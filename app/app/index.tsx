// index.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import ProfilePage from "./ProfilePage";
import { LinearGradient } from "expo-linear-gradient";
import SwipeableImage from "./SwipeableImage";
import { TapGestureHandler } from "react-native-gesture-handler";
import Settings from "./Settings";
import UserManual from "./UserManual";

type ImageMap = Record<string, string>;
type Screen = "home" | "profile" | "manual" | "settings";

const toISO = (d: Date) => d.toISOString().split("T")[0];
const countOutfitDays = (map: ImageMap) => Object.keys(map).length;
const addDays = (iso: string, delta: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return toISO(d);
};

export default function StoriesArchive() {
  const [selectedDate, setSelectedDate] = useState<string>("null");
  const [images, setImages] = useState<ImageMap>({});
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // Image modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState<string | null>(null);

  // Clear everything (all days)
  const clearAllImages = () => {
    Alert.alert(
      "Clear all outfits?",
      "This will remove all saved outfits (red dots) for every day.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            // Clear state
            setImages({});

            // Storage: remove all images and reset count
            await AsyncStorage.removeItem("dateImages");
            await AsyncStorage.setItem("outfitCount", "0");

            // Optional: also reset the “last seen tier” so titles re-open on next unlock
            // await AsyncStorage.setItem("titleLastSeenTier", "0");

            Alert.alert("Done", "All outfits have been cleared.");
          },
        },
      ]
    );
  };

  // Theming (background colour)
  const [bgColor, setBgColor] = useState<string>("#fff");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("dateImages");
      if (raw) setImages(JSON.parse(raw));
      if (raw) {
        const parsed: ImageMap = JSON.parse(raw);
        setImages(parsed);

        // 🔵 NEW: write initial outfitCount based on loaded data
        const initialCount = countOutfitDays(parsed);
        await AsyncStorage.setItem("outfitCount", String(initialCount));
      }

      // ensure install date saved once
      const existingInstall = await AsyncStorage.getItem("installDate");
      if (!existingInstall) {
        await AsyncStorage.setItem("installDate", new Date().toISOString());
      }

      // load bg color
      const storedBg = await AsyncStorage.getItem("bgColor");
      if (storedBg) setBgColor(storedBg);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // persist the images map
      await AsyncStorage.setItem("dateImages", JSON.stringify(images));

      // 🔵 NEW: update outfitCount every time images change
      const count = countOutfitDays(images);
      await AsyncStorage.setItem("outfitCount", String(count));
    })();
  }, [images]);

  const takePicture = async () => {
    if (!selectedDate) {
      Alert.alert("Pick a date first");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      const originalUri = result.assets?.[0]?.uri;
      if (originalUri && selectedDate) {
        const next = { ...images, [selectedDate]: originalUri };
        setImages(next);
        await AsyncStorage.setItem("dateImages", JSON.stringify(next));
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

  const goToday = () => setSelectedDate(toISO(new Date()));
  const goPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goNextDay = () => setSelectedDate(addDays(selectedDate, 1));

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
              onDayPress={(d) => setSelectedDate(d.dateString)}
              enableSwipeMonths={true}
              markedDates={{
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
              }}
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
          {/* DEV: Clear-all button */}
          {/* {__DEV__ && (
            <Pressable style={styles.devBtn} onPress={clearAllImages}>
              <Ionicons name="trash-outline" size={16} color="#111" />
              <Text style={{ fontWeight: "600" }}>DEV: Clear all outfits</Text>
            </Pressable>
          )} */}

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
                      onDelete={(date) => {
                        const updated = { ...images };
                        delete updated[date];
                        setImages(updated);
                        AsyncStorage.setItem(
                          "dateImages",
                          JSON.stringify(updated)
                        );
                      }}
                    />
                  ) : (
                    <Text style={styles.nothing}>Nothing here !</Text>
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
        <Pressable
          style={styles.tabItem}
          onPress={() => setCurrentScreen("home")}
        >
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

      {/* Floating camera (home only) */}
      {currentScreen === "home" && (
        <Pressable style={styles.cameraButton} onPress={takePicture}>
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
