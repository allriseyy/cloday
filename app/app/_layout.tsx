// app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "../styles/LayoutStyles";

function MyHeader() {
  const insets = useSafeAreaInsets();

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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CaveatBrushRegular: require("../assets/fonts/CaveatBrush-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            header: () => <MyHeader />,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
