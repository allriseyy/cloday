// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyHeader from "./components/MyHeader";
import styles from "./styles/LayoutStyles";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
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
