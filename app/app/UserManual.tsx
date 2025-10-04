// UserManual.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onBack: () => void;
};

export default function UserManual({ onBack }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBar}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>User Manual</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.pageWrap}>
        <Text style={styles.pageTitle}>Welcome to Cloday !</Text>
        <Text style={styles.pageText}>
          Write your manual here. This is a placeholder screen you can fill with
          sections, tips, and screenshots.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#000000ff",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  pageWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: "700" },
  pageText: { fontSize: 15, color: "#444" },
});
