// ProfilePage.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfilePage() {
  return (
    <View style={styles.profilePage}>
      <Ionicons name="person-circle" size={120} color="#888" />
      <Text style={styles.profileName}>John Doe</Text>
      <Text style={styles.profileText}>Fashion Enthusiast 👕👖</Text>
      <Text style={styles.profileText}>Joined: Jan 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profilePage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  profileText: { fontSize: 16, color: "#555", marginTop: 4 },
});
