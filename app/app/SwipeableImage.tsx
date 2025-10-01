import React, { useRef } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";

type Props = {
  uri: string;
  date: string;
  onDelete: (date: string) => void;
  onPress?: (uri: string) => void;
};

export default function SwipeableImage({ uri, date, onDelete, onPress }: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const [imgHeight, setImgHeight] = React.useState(0);

  const renderLeftActions = () => (
    <View style={[styles.actionFull, styles.deleteBg, { height: imgHeight }]}>
      <Text style={styles.actionText}>Delete</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={[styles.actionFull, styles.saveBg, { height: imgHeight }]}>
      <Text style={styles.actionText}>Save</Text>
    </View>
  );

  const confirmDelete = () => {
    Alert.alert("Delete Image", "Are you sure you want to delete this picture?", [
      { text: "Cancel", style: "cancel", onPress: () => swipeableRef.current?.close() },
      { text: "Delete", style: "destructive", onPress: () => onDelete(date) },
    ]);
  };

  const confirmSave = () => {
    Alert.alert("Save Image", "Do you want to save this picture to your gallery?", [
      { text: "Cancel", style: "cancel", onPress: () => swipeableRef.current?.close() },
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
    ]);
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={confirmDelete}
      onSwipeableRightOpen={confirmSave}
      overshootLeft={false}
      overshootRight={false}
      containerStyle={styles.swipeContainer}
    >
      <Pressable onPress={() => onPress?.(uri)}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onLayout={(e) => setImgHeight(e.nativeEvent.layout.height)} // 👈 track height
        />
      </Pressable>
    </Swipeable>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: RADIUS,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 12,
  },
  image: {
    width: 250,      // only constrain width
    height: undefined,
    aspectRatio: 1,  // 👈 optional: replace with actual aspect ratio if you know it
    borderRadius: RADIUS,
  },
  actionFull: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  deleteBg: { backgroundColor: "red" },
  saveBg: { backgroundColor: "green" },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
