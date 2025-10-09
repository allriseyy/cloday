import React from "react";
import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  bgColor: string;
  setBgColor: (c: string) => void | Promise<void>;
  onBack: () => void;
};

const presetColors = [
  // 🌤️ Light & neutral bases
  "#ffffff", // Pure white
  "#f5f7ff", // Soft blue-white
  "#fff7ed", // Warm beige
  "#fef2f2", // Soft blush pink
  "#f0fdf4", // Mint green
  "#f0f9ff", // Sky blue
  "#fafaf9", // Subtle off-white
  "#f4f4f5", // Light gray

  // 🎨 Pastels
  "#bfdbfe", // Pastel blue
  "#fbcfe8", // Pastel pink
  "#fcebaaff", // Soft yellow
  "#ddd6fe", // Lavender purple
  "#d9f99d", // Pale lime
  "#fee2e2", // Baby pink
  "#bae6fd", // Light cyan

  // 🌸 Warm & cozy
  "#fef3c7", // Light cream
  "#fde68a", // Butter yellow
  "#e0f2fe", // Powder blue
];

// 👉 Replace this with your actual privacy policy link
const privacyPolicyUrl =
  "https://www.privacypolicies.com/live/4888ffc8-953c-44fb-ab3c-a9eac2d35312";

export default function Settings({ bgColor, setBgColor, onBack }: Props) {
  const openPrivacyPolicy = async () => {
    const supported = await Linking.canOpenURL(privacyPolicyUrl);
    if (supported) {
      await Linking.openURL(privacyPolicyUrl);
    } else {
      console.warn("Cannot open URL:", privacyPolicyUrl);
    }
  };

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

        {/* PRIVACY POLICY BUTTON */}
        <Pressable style={styles.privacyBtn} onPress={openPrivacyPolicy}>
          <Text style={styles.privacyBtnText}>View Privacy Policy</Text>
        </Pressable>
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
  privacyBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 10,
  },
  privacyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
