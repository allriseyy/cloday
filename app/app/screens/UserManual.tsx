// UserManual.tsx
import React from "react";
import { ScrollView, Text, View } from "react-native";
import HeaderBar from "../components/HeaderBar";
import {
  Bold,
  P,
  PageTitle,
  SectionTitle,
  SubTitle,
} from "../components/Typography";
import { useManualHandlers } from "../hooks/useManualHandlers";
import styles from "../styles/UserManualStyles";

type Props = {
  onBack: () => void;
};

export default function UserManual({ onBack }: Props) {
  const { handleBack } = useManualHandlers(onBack);

  return (
    <View style={styles.rootView}>
      <HeaderBar title="User Manual" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.pageWrap}>
        <PageTitle>📖 Welcome to Cloday!</PageTitle>
        <P>
          Track your daily outfits, unlock titles, and make Cloday your personal
          style diary.
        </P>

        {/* Home Screen */}
        <SectionTitle>🏠 Home Screen</SectionTitle>
        <P>
          Your main hub to log outfits, browse your calendar, and capture new
          looks.
        </P>

        <SubTitle>Features:</SubTitle>
        <P>
          • 📅 <Bold>Calendar</Bold> — View and select outfit days.{"\n"}• 👕{" "}
          <Bold>OOTD</Bold> — Capture or revisit daily looks.{"\n"}• 📸{" "}
          <Bold>Camera</Bold> — Snap your outfit instantly.{"\n"}• 👤{" "}
          <Bold>Profile</Bold> — Manage your info and style.
        </P>

        <SubTitle>How to Use:</SubTitle>
        <P>
          • Swipe to change months.{"\n"}• Tap a date to view outfits.{"\n"}•
          Use the camera to log today’s look.{"\n"}• 🔴 = outfit saved for that
          day.
        </P>

        {/* Profile Screen */}
        <SectionTitle>👤 Profile</SectionTitle>
        <P>
          Personalize your Cloday! Change your name, title, and theme color.
        </P>

        <SubTitle>Options:</SubTitle>
        <P>
          • ✏️ <Bold>Name</Bold> — Update your display name.{"\n"}• 🏷️{" "}
          <Bold>Title</Bold> — Unlock new titles by logging outfits.{"\n"}• 🎨{" "}
          <Bold>Theme</Bold> — Set your preferred color.
        </P>

        {/* Saving Outfits */}
        <SectionTitle>💾 Saving Outfits</SectionTitle>
        <P>
          Swipe right after taking a photo to save your OOTD to the calendar.
        </P>

        <SubTitle>Steps:</SubTitle>
        <P>
          1️⃣ Take a photo.{"\n"}
          2️⃣ Swipe right to save.{"\n"}
          3️⃣ A 🔴 dot marks the saved day.{"\n"}
          4️⃣ Tap that day to view your outfit.
        </P>

        {/* Deleting Outfits */}
        <SectionTitle>🗑️ Deleting Outfits</SectionTitle>
        <P>Swipe left on an outfit to delete it from your calendar.</P>
        <P>
          1️⃣ Open the outfit.{"\n"}
          2️⃣ Swipe left to delete.{"\n"}
          3️⃣ Confirm to remove it.{"\n"}
          4️⃣ 🔴 disappears — outfit deleted.
        </P>

        {/* Tips */}
        <SectionTitle>💡 Pro Tips</SectionTitle>
        <P>
          ✅ Log daily to build your style history.{"\n"}
          🎨 Personalize your look and theme.{"\n"}
          📸 Swipe right to save fast.{"\n"}
          🗑️ Swipe left carefully — deletes are permanent.
        </P>

        <P>
          <Text style={styles.fontItalic}>
            Cloday — Capture your daily style ✨
          </Text>
        </P>
      </ScrollView>
    </View>
  );
}
