import * as MediaLibrary from "expo-media-library";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import styles from "../styles/SwipeableImageStyles";

type Props = {
  uri: string;
  date: string;
  onDelete: (date: string) => void;
  onPress?: (uri: string) => void;
};

export default function SwipeableImage({
  uri,
  date,
  onDelete,
  onPress,
}: Props) {
  const swipeableRef = React.useRef<Swipeable>(null);

  // Height we measured from the first render
  const [imgHeight, setImgHeight] = React.useState<number | null>(null);

  // Make the image narrower but keep the same height
  const TARGET_WIDTH = 180; // 👈 adjust as you like

  const renderLeftActions = () => (
    <View
      style={[
        styles.actionPanel,
        styles.deleteBg,
        imgHeight ? { width: TARGET_WIDTH, height: imgHeight } : null,
      ]}
    >
      <Text style={styles.actionText}>Delete</Text>
    </View>
  );

  const renderRightActions = () => (
    <View
      style={[
        styles.actionPanel,
        styles.saveBg,
        imgHeight ? { width: TARGET_WIDTH, height: imgHeight } : null,
      ]}
    >
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
              Alert.alert(
                "Permission denied",
                "The app needs access to your photos to save images you capture."
              );
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
      overshootLeft={false}
      overshootRight={false}
      containerStyle={styles.swipeContainer}
    >
      <Pressable onPress={() => onPress?.(uri)}>
        <Image
          source={{ uri }}
          // First render: measure height using a temporary square
          // After we have height: lock height, shrink width to TARGET_WIDTH
          style={
            imgHeight
              ? [styles.imageBase, { width: TARGET_WIDTH, height: imgHeight }]
              : styles.imageMeasureOnce
          }
          resizeMode="cover" // fill fixed height; switch to "contain" to avoid side crop
          onLayout={(e) => {
            if (imgHeight === null) {
              const measured = e.nativeEvent.layout.height;
              if (measured > 0) setImgHeight(measured);
            }
          }}
        />
      </Pressable>
    </Swipeable>
  );
}
