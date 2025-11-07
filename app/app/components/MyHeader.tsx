import { useFonts } from "expo-font";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "../styles/MyHeaderStyles";

export default function MyHeader() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    CaveatBrushRegular: require("../../assets/fonts/CaveatBrush-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null; // or <AppLoading />
  }

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top, height: insets.top + 40 },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Cloday</Text>
      </View>
    </View>
  );
}
