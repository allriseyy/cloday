// index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
// 👇 use legacy FS to silence SDK 54 deprecation warnings
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { TapGestureHandler } from "react-native-gesture-handler";
import ProfilePage from "./ProfilePage";
import Settings from "./Settings";
import SwipeableImage from "./SwipeableImage";
import UserManual from "./screens/UserManual";
import styles from "./styles/indexStyles";

type ImageMap = Record<string, string>;
type Screen = "home" | "profile" | "manual" | "settings";

const toISO = (d: Date) => d.toISOString().split("T")[0];
const addDays = (iso: string, delta: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return toISO(d);
};
const diffDays = (aISO: string, bISO: string) =>
  Math.floor((Date.parse(aISO) - Date.parse(bISO)) / 86400000);

// ---- edit-window helpers (last 7 days incl today) ----
const todayISO = () => toISO(new Date());
const isFuture = (iso: string) => Date.parse(iso) > Date.parse(todayISO());
const isEditable = (iso: string) => {
  const d = diffDays(todayISO(), iso);
  return d >= 0 && d <= 6;
};

// ---- Persistent storage folder (survives app updates; wiped on uninstall) ----
const APP_DIR = FileSystem.documentDirectory + "stories/";

async function ensureAppDir() {
  try {
    const info = await FileSystem.getInfoAsync(APP_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(APP_DIR, { intermediates: true });
    }
  } catch (e) {
    console.warn("Failed to ensure app dir", e);
  }
}

function extFromUri(uri: string) {
  const clean = uri.split("?")[0];
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop() : undefined;
  if (!ext || ext.length > 5) return "jpg";
  return ext.toLowerCase();
}

/** Copy the captured photo into a stable app location and return its file:// URI */
async function saveImageToAppStorage(sourceUri: string, dateISO: string) {
  await ensureAppDir();
  const ext = extFromUri(sourceUri);
  const dest = `${APP_DIR}${dateISO}.${ext}`;

  try {
    const existing = await FileSystem.getInfoAsync(dest);
    if (existing.exists) {
      await FileSystem.deleteAsync(dest, { idempotent: true });
    }
  } catch {}
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

/** Drop any broken file refs (e.g., if old cache URIs were stored) */
async function validateStoredImages(map: ImageMap): Promise<ImageMap> {
  const entries = await Promise.all(
    Object.entries(map).map(async ([date, uri]) => {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        return info.exists ? [date, uri] : null;
      } catch {
        return null;
      }
    })
  );
  const cleaned: ImageMap = {};
  for (const e of entries) {
    if (e) cleaned[e[0]] = e[1];
  }
  return cleaned;
}

// Helper to map tab -> numeric index for animation
const tabIndex = (s: Screen) => (s === "profile" ? 1 : 0);

export default function StoriesArchive() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [images, setImages] = useState<ImageMap>({});
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // 🔹 Track which tab we’re animating between (home/profile only)
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const anim = useRef(new Animated.Value(0)).current; // 0 = home, 1 = profile
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  // Image modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState<string | null>(null);

  // Theming (background colour)
  const [bgColor, setBgColor] = useState<string>("#fff");

  // load persisted data
  useEffect(() => {
    (async () => {
      await ensureAppDir();

      const raw = await AsyncStorage.getItem("dateImages");
      if (raw) {
        const parsed: ImageMap = JSON.parse(raw);
        const cleaned = await validateStoredImages(parsed);
        setImages(cleaned);
        if (JSON.stringify(cleaned) !== raw) {
          await AsyncStorage.setItem("dateImages", JSON.stringify(cleaned));
        }
      }

      const existingInstall = await AsyncStorage.getItem("installDate");
      if (!existingInstall) {
        await AsyncStorage.setItem("installDate", new Date().toISOString());
      }

      const storedBg = await AsyncStorage.getItem("bgColor");
      if (storedBg) setBgColor(storedBg);
    })();
  }, []);

  // persist changes
  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem("dateImages", JSON.stringify(images));
    })();
  }, [images]);

  const takePicture = async () => {
    if (!selectedDate) {
      Alert.alert("Pick a date first");
      return;
    }
    if (!isEditable(selectedDate)) {
      if (isFuture(selectedDate)) {
        Alert.alert("Not allowed", "You can’t add photos to future dates.");
      } else {
        Alert.alert(
          "View-only",
          "You can view older days, but adding or deleting photos is limited to the last 7 days."
        );
      }
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "The app needs camera access to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      const originalUri = result.assets?.[0]?.uri;
      if (originalUri) {
        try {
          const stableUri = await saveImageToAppStorage(
            originalUri,
            selectedDate
          );
          const next = { ...images, [selectedDate]: stableUri };
          setImages(next);
          await AsyncStorage.setItem("dateImages", JSON.stringify(next));
        } catch (e) {
          console.warn("Failed to save image to app storage:", e);
          Alert.alert(
            "Save failed",
            "Couldn’t persist the photo. Please try again."
          );
        }
      }
    }
  };

  // Modal handlers
  const openImageModal = (uri: string) => {
    setModalUri(uri);
    setModalVisible(true);
  };
  const closeImageModal = () => {
    setModalVisible(false);
    setModalUri(null);
  };

  const doubleTapRef = useRef<TapGestureHandler>(null);
  const singleTapRef = useRef<TapGestureHandler>(null);
  const [previewWidth, setPreviewWidth] = useState(0);

  const goToday = () => setSelectedDate(todayISO());
  const goPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (!isFuture(next)) setSelectedDate(next);
  };

  const canEdit = isEditable(selectedDate);
  const isSelectedFuture = isFuture(selectedDate);

  // build markedDates
  const marked: any = {
    ...Object.fromEntries(
      Object.keys(images).map((date) => [
        date,
        {
          selected: true,
          selectedColor: "#ff0000ff",
          selectedTextColor: "white",
        },
      ])
    ),
    ...(selectedDate
      ? {
          [selectedDate]: {
            selected: true,
            selectedColor: "black",
            selectedTextColor: "white",
          },
        }
      : {}),
  };

  // 🔹 Smooth tab transition (home <-> profile)
  const switchTab = (to: "home" | "profile") => {
    if (currentScreen === "manual" || currentScreen === "settings") {
      setCurrentScreen(to);
      setActiveTab(to);
      Animated.timing(anim, {
        toValue: tabIndex(to),
        duration: 0,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (activeTab === to || isTabTransitioning) return;

    setIsTabTransitioning(true);
    const toVal = tabIndex(to);
    Animated.timing(anim, {
      toValue: toVal,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(to);
      setCurrentScreen(to);
      setIsTabTransitioning(false);
    });
  };

  const onContentLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== contentWidth) setContentWidth(w);
  };

  // Interpolations for pages
  const slideHome = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -contentWidth],
  });
  const slideProfile = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [contentWidth, 0],
  });
  const fadeOut = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });
  const fadeIn = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  const scaleOut = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });
  const scaleIn = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.02, 1],
  });

  // 🔹 Camera "pop & slide down" when going Home → Profile (and back up on Profile → Home)
  const camTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56], // slide down by ~56px
  });
  const camScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88], // slight shrink as it slides down
  });
  const camOpacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.4, 0], // fade out
  });

  const isTabView = currentScreen === "home" || currentScreen === "profile";

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor }]}
      onLayout={onContentLayout}
    >
      {/* -------- Animated Tab Area (Home/Profile) -------- */}
      {isTabView && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, overflow: "hidden" }}>
            {/* Home */}
            <Animated.View
              pointerEvents={activeTab === "profile" ? "none" : "auto"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: slideHome }, { scale: scaleOut }],
                opacity: fadeOut,
              }}
            >
              <>
                <LinearGradient
                  colors={["#f5f7ff", "#e6ecff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.calendarWrapper}
                >
                  <Calendar
                    style={styles.calendarCard}
                    onDayPress={(d) => {
                      if (isFuture(d.dateString)) {
                        Alert.alert(
                          "Future day",
                          "You can’t select future dates."
                        );
                        return;
                      }
                      setSelectedDate(d.dateString);
                    }}
                    enableSwipeMonths={true}
                    maxDate={todayISO()}
                    markedDates={marked}
                    theme={{
                      calendarBackground: "transparent",
                      textSectionTitleColor: "#333",
                      dayTextColor: "#111",
                      monthTextColor: "#111",
                      arrowColor: "#111",
                      selectedDayBackgroundColor: "transparent",
                    }}
                  />
                </LinearGradient>

                {selectedDate && (
                  <TapGestureHandler
                    ref={doubleTapRef}
                    numberOfTaps={2}
                    onActivated={goToday}
                  >
                    <TapGestureHandler
                      ref={singleTapRef}
                      waitFor={doubleTapRef}
                      numberOfTaps={1}
                      onActivated={(e) => {
                        const x = e.nativeEvent.x;
                        if (previewWidth === 0) return;
                        if (x < previewWidth / 2) {
                          goPrevDay();
                        } else {
                          goNextDay();
                        }
                      }}
                    >
                      <View
                        style={styles.preview}
                        onLayout={(ev) =>
                          setPreviewWidth(ev.nativeEvent.layout.width)
                        }
                      >
                        {images[selectedDate] ? (
                          <SwipeableImage
                            uri={images[selectedDate]!}
                            date={selectedDate}
                            onPress={(uri) => openImageModal(uri)}
                            onDelete={async (date) => {
                              if (!isEditable(date)) {
                                Alert.alert(
                                  "View-only",
                                  "Deleting is limited to the last 7 days."
                                );
                                return;
                              }
                              const uri = images[date];
                              const updated = { ...images };
                              delete updated[date];
                              setImages(updated);
                              await AsyncStorage.setItem(
                                "dateImages",
                                JSON.stringify(updated)
                              );
                              if (uri && uri.startsWith(APP_DIR)) {
                                try {
                                  await FileSystem.deleteAsync(uri, {
                                    idempotent: true,
                                  });
                                } catch {}
                              }
                            }}
                          />
                        ) : (
                          <Text style={styles.nothing}>Nothing here !</Text>
                        )}
                        {!canEdit && (
                          <Text
                            style={{
                              marginTop: 10,
                              fontSize: 10,
                              color: "#666",
                            }}
                          >
                            {isSelectedFuture
                              ? "Future dates are not editable."
                              : "That day’s ancient history! Just for viewing now 👀"}
                          </Text>
                        )}
                      </View>
                    </TapGestureHandler>
                  </TapGestureHandler>
                )}
              </>
            </Animated.View>

            {/* Profile */}
            <Animated.View
              pointerEvents={activeTab === "home" ? "none" : "auto"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: slideProfile }, { scale: scaleIn }],
                opacity: fadeIn,
              }}
            >
              <ProfilePage
                onOpenManual={() => setCurrentScreen("manual")}
                onOpenSettings={() => setCurrentScreen("settings")}
              />
            </Animated.View>
          </View>
        </View>
      )}

      {/* -------- Non-tab pages (no tab animation) -------- */}
      {currentScreen === "manual" && (
        <UserManual onBack={() => setCurrentScreen("profile")} />
      )}

      {currentScreen === "settings" && (
        <Settings
          bgColor={bgColor}
          setBgColor={async (c) => {
            setBgColor(c);
            await AsyncStorage.setItem("bgColor", c);
          }}
          onBack={() => setCurrentScreen("profile")}
        />
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.tabItem}
          onPress={() => switchTab("home")}
          accessibilityLabel="Home"
        >
          <Ionicons
            name={activeTab === "home" && isTabView ? "home" : "home-outline"}
            size={26}
          />
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => switchTab("profile")}
          accessibilityLabel="Profile"
        >
          <Ionicons
            name={
              activeTab === "profile" && isTabView
                ? "person-circle"
                : "person-circle-outline"
            }
            size={26}
          />
        </Pressable>
      </View>

      {/* 🔹 Animated Floating Camera (visible on tab views; interactive on Home) */}
      {isTabView && (
        <Animated.View
          style={[
            styles.cameraWrap,
            {
              transform: [{ translateY: camTranslateY }, { scale: camScale }],
              opacity: camOpacity,
            },
          ]}
          pointerEvents={
            activeTab === "home" && !isTabTransitioning ? "auto" : "none"
          }
        >
          <Pressable
            style={[styles.cameraButton, !canEdit && { opacity: 0.4 }]}
            disabled={!canEdit || activeTab !== "home" || isTabTransitioning}
            onPress={takePicture}
          >
            <Ionicons name="camera" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={false}
        presentationStyle="fullScreen"
        hardwareAccelerated
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={closeImageModal}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          {modalUri ? (
            <Image
              source={{ uri: modalUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
