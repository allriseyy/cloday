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
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { TapGestureHandler } from "react-native-gesture-handler";
import ProfilePage from "./ProfilePage";
import Settings from "./Settings";
import SwipeableImage from "./SwipeableImage";
import UserManual from "./UserManual";

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

export default function StoriesArchive() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [images, setImages] = useState<ImageMap>({});
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

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
          const stableUri = await saveImageToAppStorage(originalUri, selectedDate);
          const next = { ...images, [selectedDate]: stableUri };
          setImages(next);
          await AsyncStorage.setItem("dateImages", JSON.stringify(next));
        } catch (e) {
          console.warn("Failed to save image to app storage:", e);
          Alert.alert("Save failed", "Couldn’t persist the photo. Please try again.");
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

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {currentScreen === "home" && (
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
                  Alert.alert("Future day", "You can’t select future dates.");
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
                  onLayout={(ev) => setPreviewWidth(ev.nativeEvent.layout.width)}
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
                            await FileSystem.deleteAsync(uri, { idempotent: true });
                          } catch {}
                        }
                      }}
                    />
                  ) : (
                    <Text style={styles.nothing}>Nothing here !</Text>
                  )}
                  {!canEdit && (
                    <Text style={{ marginTop: 10, fontSize: 10, color: "#666" }}>
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
      )}

      {currentScreen === "profile" && (
        <ProfilePage
          onOpenManual={() => setCurrentScreen("manual")}
          onOpenSettings={() => setCurrentScreen("settings")}
        />
      )}

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
        <Pressable style={styles.tabItem} onPress={() => setCurrentScreen("home")}>
          <Ionicons
            name={currentScreen === "home" ? "home" : "home-outline"}
            size={26}
          />
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => setCurrentScreen("profile")}
        >
          <Ionicons
            name={
              currentScreen === "profile"
                ? "person-circle"
                : "person-circle-outline"
            }
            size={26}
          />
        </Pressable>
      </View>

      {/* Floating camera (home only); disabled when view-only */}
      {currentScreen === "home" && (
        <Pressable
          style={[styles.cameraButton, !canEdit && { opacity: 0.4 }]}
          disabled={!canEdit}
          onPress={takePicture}
        >
          <Ionicons name="camera" size={28} color="#fff" />
        </Pressable>
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

const BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: BAR_HEIGHT + 16,
  },
  header: { fontSize: 22, fontWeight: "600", marginVertical: 10 },
  preview: {
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e4e4e471",
    padding: 8,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 3 / 4,
    maxHeight: 250,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: "center",
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e6e6e6",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: BAR_HEIGHT / 3,
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImage: {
    flex: 1,
    alignSelf: "stretch",
  },
  zoomContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nothing: {
    marginTop: 80,
    marginBottom: 80,
    alignItems: "center",
    height: 100,
    fontSize: 20,
  },
  calendarWrapper: {
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  calendarCard: {
    borderRadius: 10,
    backgroundColor: "transparent",
  },

  // Pages
  pageWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: "700" },
  pageSubtitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  pageText: { fontSize: 15, color: "#444" },
  pageHint: { fontSize: 12, color: "#777", marginTop: 8 },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },
  devBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
    marginRight: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f4f4f4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
