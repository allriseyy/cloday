import React, { useRef } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";

type Props = {
  uri: string;
  date: string;
  onDelete: (date: string) => void;
};

export default function SwipeableImage({ uri, date, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = () => (
    <View style={[styles.action, { backgroundColor: "red" }]}>
      <Text style={styles.actionText}>Delete</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={[styles.action, { backgroundColor: "green" }]}>
      <Text style={styles.actionText}>Save</Text>
    </View>
  );

  const confirmDelete = () => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        { text: "Delete", style: "destructive", onPress: () => onDelete(date) },
      ]
    );
  };

  const confirmSave = () => {
    Alert.alert(
      "Save Image",
      "Do you want to save this picture to your gallery?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Save",
          onPress: async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              await MediaLibrary.saveToLibraryAsync(uri);
              Alert.alert("Saved", "Image saved to your gallery 🎉");
            } else {
              Alert.alert("Permission denied", "Enable access to save images.");
            }
            swipeableRef.current?.close();
          },
        },
      ]
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={confirmDelete}
      onSwipeableRightOpen={confirmSave}
    >
      <Pressable>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginVertical: 12,
    alignSelf: "center",
  },
  action: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
