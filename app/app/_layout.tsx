// app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MyHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: insets.top + 40,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontFamily: "ImperialScriptRegular", fontSize: 25 }}>
          Cloday
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ImperialScriptRegular: require("../assets/fonts/ImperialScript-Regular.ttf"),
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
