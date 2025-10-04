// Settings.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  bgColor: string;
  setBgColor: (c: string) => void | Promise<void>;
  onBack: () => void;
};

const presetColors = [
  "#ffffff",
  "#f5f7ff",
  "#fff7ed",
  "#f0fdf4",
  "#fef2f2",
  "#f0f9ff",
];

export default function Settings({ bgColor, setBgColor, onBack }: Props) {
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.pageWrap}>
        <Text style={styles.pageSubtitle}>Background colour</Text>
        <View style={styles.colorRow}>
          {presetColors.map((c) => (
            <Pressable
              key={c}
              onPress={() => setBgColor(c)}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: c,
                  borderColor: c === "#111111" ? "#333" : "#ddd",
                },
                bgColor === c && styles.colorSwatchSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Set background to ${c}`}
            >
              {bgColor === c && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={c === "#111111" ? "#fff" : "#111"}
                />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.pageHint}>
          This colour updates the app background instantly.
        </Text>
      </View>
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
  pageSubtitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  pageHint: { fontSize: 12, color: "#777", marginTop: 8 },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },
});
