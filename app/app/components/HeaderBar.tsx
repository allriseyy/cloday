// components/HeaderBar.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "../styles/UserManualStyles";

type HeaderBarProps = {
  title: string;
  onBack: () => void;
};

export default function HeaderBar({ title, onBack }: HeaderBarProps) {
  return (
    <View style={styles.headerBar}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {/* Spacer to balance the back button width */}
      <View style={styles.backBtn} />
    </View>
  );
}
