import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, StyleSheet, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ImageMap = Record<string, string>;

export default function StoriesArchive() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [images, setImages] = useState<ImageMap>({});

  // load on start
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("dateImages");
      if (raw) setImages(JSON.parse(raw));
    })();
  }, []);

  // persist whenever images change
  useEffect(() => {
    AsyncStorage.setItem("dateImages", JSON.stringify(images));
  }, [images]);

  const takePicture = async () => {
    if (!selectedDate) {
      Alert.alert("Pick a date first");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setImages(prev => ({ ...prev, [selectedDate]: uri }));
        // Optional immediate persist (useful on iOS if app is backgrounded)
        await AsyncStorage.setItem("dateImages", JSON.stringify({ ...images, [selectedDate]: uri }));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stories archive</Text>

      <Calendar
        onDayPress={d => setSelectedDate(d.dateString)}
        markedDates={{
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: "black" } } : {}),
          ...Object.fromEntries(
            Object.keys(images).map(date => [date, { marked: true }])
          ),
        }}
      />

      {selectedDate && (
        <View style={styles.preview}>
          <Text>Selected: {selectedDate}</Text>
          {images[selectedDate] ? (
            <Image source={{ uri: images[selectedDate] }} style={styles.image} />
          ) : (
            <Text>No picture saved</Text>
          )}
          <Button title="Take Picture" onPress={takePicture} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "600", marginVertical: 10 },
  preview: { alignItems: "center", marginTop: 20 },
  image: { width: 200, height: 200, borderRadius: 12, marginTop: 12 },
});
