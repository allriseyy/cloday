// app/_layout.tsx
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MyHeader() {
  const insets = useSafeAreaInsets();
  const loadingIcon = require("../assets/images/loading.png"); // ensure this path exists

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
        <Image
          source={loadingIcon}
          style={{
            width: 30,
            height: 50,
            resizeMode: "center",
            paddingRight: 0,
            marginRight: 0,
          }}
        />
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
    return null; // or a splash/loading component
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            header: () => <MyHeader />, // custom header replaces default
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
