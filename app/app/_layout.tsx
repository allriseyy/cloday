// app/_layout.tsx
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MyHeader() {
  const insets = useSafeAreaInsets(); // gives top inset for notch / dynamic island

  return (
    <View
      style={{
        paddingTop: insets.top, // 👈 push below dynamic island/notch
        height: insets.top + 40, // header height + safe area
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
      }}
    >
      <Text style={{ fontSize: 20 }}>Drobe</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="drobe"
          options={{
            header: () => <MyHeader />, // custom header replaces default
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
