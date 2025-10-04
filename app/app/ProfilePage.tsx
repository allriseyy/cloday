// ProfilePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  onOpenManual: () => void;
  onOpenSettings: () => void;
};

const formatJoined = (iso?: string | null) => {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${month} ${year}`;
};

// Title unlock tiers (all will be shown in the modal)
const TITLE_TIERS = [
  { threshold: 1, title: "Fashion Enthusiast 👕" },
  { threshold: 3, title: "Style Explorer 🌟" },
  { threshold: 5, title: "Trend Setter ✨" },
  { threshold: 10, title: "Fabulous Snapper 📸" },
  { threshold: 15, title: "Chic Collector 👗" },
  { threshold: 30, title: "Wardrobe Wizard 🧥" },
  { threshold: 60, title: "Designer Lover 👜" },
  { threshold: 100, title: "Style Icon 👑" },
];

export default function ProfilePage({ onOpenManual, onOpenSettings }: Props) {
  const [name, setName] = useState<string>("John Doe");
  const [title, setTitle] = useState<string>("Newcomer");
  const [editingName, setEditingName] = useState(false);

  // Title picker modal
  const [titlePickerVisible, setTitlePickerVisible] = useState(false);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [installDate, setInstallDate] = useState<string | null>(null);

  // Outfit day count drives unlocks
  const [outfitCount, setOutfitCount] = useState<number>(0);

  // convenience: do we have any unlocked at all?
  const hasUnlockedTitles = useMemo(
    () => TITLE_TIERS.some((t) => outfitCount >= t.threshold),
    [outfitCount]
  );

  useEffect(() => {
    (async () => {
      const [n, t, p, i, c] = await Promise.all([
        AsyncStorage.getItem("profileName"),
        AsyncStorage.getItem("profileTitle"),
        AsyncStorage.getItem("profilePhoto"),
        AsyncStorage.getItem("installDate"),
        AsyncStorage.getItem("outfitCount"),
      ]);
      if (n) setName(n);
      if (t) setTitle(t);
      if (p) setPhotoUri(p);
      if (i) setInstallDate(i);
      if (c) setOutfitCount(Number(c) || 0);
    })();
  }, []);

  const saveName = async () => {
    const cleaned = name.trim() || "John Doe";
    setName(cleaned);
    await AsyncStorage.setItem("profileName", cleaned);
    setEditingName(false);
  };

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri ?? null;
      if (uri) {
        setPhotoUri(uri);
        await AsyncStorage.setItem("profilePhoto", uri);
      }
    }
  };

  const openTitlePicker = () => {
    if (!hasUnlockedTitles) {
      const nextTier = TITLE_TIERS.find((t) => outfitCount < t.threshold);
      const needed = nextTier ? nextTier.threshold - outfitCount : 0;
      Alert.alert(
        "No titles unlocked yet",
        nextTier
          ? `Save ${needed} more outfit${needed === 1 ? "" : "s"} to unlock “${
              nextTier.title
            }”.`
          : "Keep styling to unlock more titles!"
      );
      return;
    }
    setTitlePickerVisible(true);
  };

  const selectTitle = async (val: string, isLocked: boolean) => {
    if (isLocked) return; // ignore taps on locked items
    setTitle(val);
    await AsyncStorage.setItem("profileTitle", val);
    setTitlePickerVisible(false);
  };

  // Next milestone helper for a small hint under the title
  const nextMilestoneText = useMemo(() => {
    const next = TITLE_TIERS.find((t) => outfitCount < t.threshold);
    if (!next) return "All titles unlocked—styling legend!";
    const remaining = next.threshold - outfitCount;
    return `Save ${remaining} more outfit${
      remaining === 1 ? "" : "s"
    } to unlock “${next.title}”.`;
  }, [outfitCount]);

  return (
    <View style={styles.profilePage}>
      <Pressable onPress={pickProfileImage}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={120} color="#888" />
        )}
      </Pressable>

      {/* Name row */}
      <View style={styles.row}>
        {editingName ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <Pressable style={styles.iconBtn} onPress={saveName}>
              <Ionicons name="checkmark" size={22} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <Text style={styles.profileName}>{name}</Text>
            <Pressable
              style={styles.iconBtn}
              onPress={() => setEditingName(true)}
              accessibilityLabel="Edit name"
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Title row — non-editable text + button to pick when unlocked */}
      <View style={styles.row}>
        <View style={styles.displayRow}>
          <Text style={styles.profileText}>{title}</Text>

          <Pressable
            style={[
              styles.iconBtn,
              !hasUnlockedTitles && { backgroundColor: "#bbb" },
            ]}
            onPress={openTitlePicker}
            accessibilityLabel={
              hasUnlockedTitles ? "Change title" : "Title locked"
            }
          >
            <Ionicons
              name={hasUnlockedTitles ? "pricetags" : "lock-closed"}
              size={14}
              color="#fff"
            />
          </Pressable>
        </View>
        <Text style={styles.helperText}>{nextMilestoneText}</Text>
      </View>

      <Text style={styles.joinedText}>Joined: {formatJoined(installDate)}</Text>
      <Text style={styles.joinedText}>Outfits saved: {outfitCount}</Text>

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={onOpenManual}>
          <Ionicons name="book-outline" size={18} color="#111" />
          <Text style={styles.actionText}>User Manual</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onOpenSettings}>
          <Ionicons name="settings-outline" size={18} color="#111" />
          <Text style={styles.actionText}>Settings</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>
        Tip: tap the avatar to upload/change your profile picture.
      </Text>

      {/* Title Picker Modal (shows both unlocked + locked with remaining count) */}
      <Modal
        visible={titlePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTitlePickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose your title</Text>

            <FlatList
              data={TITLE_TIERS}
              keyExtractor={(item) => String(item.threshold)}
              renderItem={({ item }) => {
                const isUnlocked = outfitCount >= item.threshold;
                const remaining = Math.max(0, item.threshold - outfitCount);

                return (
                  <Pressable
                    style={[
                      styles.titleOption,
                      !isUnlocked && styles.titleOptionLocked,
                      item.title === title &&
                        isUnlocked &&
                        styles.titleOptionActive,
                    ]}
                    onPress={() => selectTitle(item.title, !isUnlocked)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.titleOptionText,
                          !isUnlocked && { color: "#777" },
                        ]}
                      >
                        {item.title}
                      </Text>
                      {!isUnlocked ? (
                        <Text style={styles.lockedSub}>
                          Locked • {remaining} more outfit
                          {remaining === 1 ? "" : "s"} to unlock
                        </Text>
                      ) : (
                        <Text style={styles.unlockedSub}>
                          Unlocked at {item.threshold} day
                          {item.threshold === 1 ? "" : "s"}
                        </Text>
                      )}
                    </View>

                    {isUnlocked ? (
                      item.title === title ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#111"
                        />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={16}
                          color="#111"
                        />
                      )
                    ) : (
                      <Ionicons name="lock-closed" size={16} color="#999" />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />

            <Pressable
              onPress={() => setTitlePickerVisible(false)}
              style={[
                styles.actionBtn,
                { alignSelf: "flex-end", marginTop: 16 },
              ]}
            >
              <Text style={styles.actionText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  profilePage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  row: { width: "90%" },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    maxWidth: 300,
  },
  iconBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  profileName: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  profileText: { fontSize: 16, color: "#555", marginTop: 4 },
  joinedText: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  helperText: {
    marginTop: 4,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: { fontSize: 15, fontWeight: "600", color: "#111" },
  hint: { marginTop: 16, color: "#888", fontSize: 12, textAlign: "center" },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  titleOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleOptionActive: {
    backgroundColor: "#e8e8e8",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  titleOptionLocked: {
    opacity: 0.6,
  },
  titleOptionText: { fontSize: 15, color: "#111" },
  lockedSub: { fontSize: 12, color: "#777", marginTop: 2 },
  unlockedSub: { fontSize: 12, color: "#4a4a4a", marginTop: 2 },
});
