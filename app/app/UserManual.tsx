// UserManual.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import styles from "./styles/UserManualStyles";

type Props = {
  onBack: () => void;
};

export default function UserManual({ onBack }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerBar}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>User Manual</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.pageWrap}>
        <Text style={styles.pageTitle}>📖 Welcome to Cloday!</Text>
        <Text style={styles.pageText}>
          Track your daily outfits, unlock titles, and make Cloday your personal
          style diary.
        </Text>

        {/* Home Screen */}
        <Text style={styles.sectionTitle}>🏠 Home Screen</Text>
        <Text style={styles.pageText}>
          Your main hub to log outfits, browse your calendar, and capture new
          looks.
        </Text>
        <Text style={styles.subTitle}>Features:</Text>
        <Text style={styles.pageText}>
          • 📅 <Text style={styles.bold}>Calendar</Text> — View and select
          outfit days.{"\n"}• 👕 <Text style={styles.bold}>OOTD</Text> — Capture
          or revisit daily looks.{"\n"}• 📸{" "}
          <Text style={styles.bold}>Camera</Text> — Snap your outfit instantly.
          {"\n"}• 👤 <Text style={styles.bold}>Profile</Text> — Manage your info
          and style.
        </Text>
        <Text style={styles.subTitle}>How to Use:</Text>
        <Text style={styles.pageText}>
          • Swipe to change months.{"\n"}• Tap a date to view outfits.{"\n"}•
          Use the camera to log today’s look.{"\n"}• 🔴 = outfit saved for that
          day.
        </Text>

        {/* Profile Screen */}
        <Text style={styles.sectionTitle}>👤 Profile</Text>
        <Text style={styles.pageText}>
          Personalize your Cloday! Change your name, title, and theme color.
        </Text>
        <Text style={styles.subTitle}>Options:</Text>
        <Text style={styles.pageText}>
          • ✏️ <Text style={styles.bold}>Name</Text> — Update your display name.
          {"\n"}• 🏷️ <Text style={styles.bold}>Title</Text> — Unlock new titles
          by logging outfits.{"\n"}• 🎨 <Text style={styles.bold}>Theme</Text> —
          Set your preferred color.
        </Text>

        {/* Saving Outfits */}
        <Text style={styles.sectionTitle}>💾 Saving Outfits</Text>
        <Text style={styles.pageText}>
          Swipe right after taking a photo to save your OOTD to the calendar.
        </Text>
        <Text style={styles.subTitle}>Steps:</Text>
        <Text style={styles.pageText}>
          1️⃣ Take a photo.{"\n"}
          2️⃣ Swipe right to save.{"\n"}
          3️⃣ A 🔴 dot marks the saved day.{"\n"}
          4️⃣ Tap that day to view your outfit.
        </Text>

        {/* Deleting Outfits */}
        <Text style={styles.sectionTitle}>🗑️ Deleting Outfits</Text>
        <Text style={styles.pageText}>
          Swipe left on an outfit to delete it from your calendar.
        </Text>
        <Text style={styles.pageText}>
          1️⃣ Open the outfit.{"\n"}
          2️⃣ Swipe left to delete.{"\n"}
          3️⃣ Confirm to remove it.{"\n"}
          4️⃣ 🔴 disappears — outfit deleted.
        </Text>

        {/* Tips */}
        <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
        <Text style={styles.pageText}>
          ✅ Log daily to build your style history.{"\n"}
          🎨 Personalize your look and theme.{"\n"}
          📸 Swipe right to save fast.{"\n"}
          🗑️ Swipe left carefully — deletes are permanent.
        </Text>

        <Text style={[styles.pageText, { marginTop: 16, fontStyle: "italic" }]}>
          Cloday — Capture your daily style ✨
        </Text>
      </ScrollView>
    </View>
  );
}
