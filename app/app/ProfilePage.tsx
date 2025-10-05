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
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

// Title unlock tiers (all shown in the modal)
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

  const [titlePickerVisible, setTitlePickerVisible] = useState(false);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [installDate, setInstallDate] = useState<string | null>(null);

  // Outfit day count drives unlocks
  const [outfitCount, setOutfitCount] = useState<number>(0);

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
    if (isLocked) return;
    setTitle(val);
    await AsyncStorage.setItem("profileTitle", val);
    setTitlePickerVisible(false);
  };

  // Progress helpers
  const nextTier = useMemo(
    () => TITLE_TIERS.find((t) => outfitCount < t.threshold),
    [outfitCount]
  );
  const nextMilestoneText = useMemo(() => {
    if (!nextTier) return "All titles unlocked — styling legend!";
    const remaining = nextTier.threshold - outfitCount;
    return `Save ${remaining} more outfit${
      remaining === 1 ? "" : "s"
    } to unlock “${nextTier.title}”.`;
  }, [nextTier, outfitCount]);

  const progressPercent = useMemo(() => {
    if (!nextTier) return 100;
    const prevThreshold =
      TITLE_TIERS.slice()
        .reverse()
        .find((t) => t.threshold <= outfitCount)?.threshold ?? 0;
    const span = nextTier.threshold - prevThreshold;
    const gained = outfitCount - prevThreshold;
    return Math.max(0, Math.min(100, Math.round((gained / span) * 100)));
  }, [outfitCount, nextTier]);

  // --------- RESPONSIVE FIT-TO-SCREEN LOGIC ----------
  const { height } = useWindowDimensions();
  // Three layout modes by device height
  const isUltraCompact = height < 640;
  const isCompact = !isUltraCompact && height < 740;

  // Sizes derived from mode
  const AVATAR = isUltraCompact ? 120 : isCompact ? 140 : 160;
  const NAME_F = isUltraCompact ? 22 : isCompact ? 26 : 28;
  const TITLE_F = isUltraCompact ? 15 : isCompact ? 16 : 18;
  const PAD = isUltraCompact ? 12 : 16;
  const CARD_R = 16;
  const GAP = isUltraCompact ? 8 : 10;
  const BTN_PY = isUltraCompact ? 10 : 12;
  const STAT_VALUE_F = isUltraCompact ? 16 : 18;
  const STAT_LABEL_F = 12;
  const CARD_SPACE = isUltraCompact ? 10 : 14;
  const PROGRESS_H = isUltraCompact ? 10 : 12;

  return (
    <SafeAreaView style={[styles.page, { padding: PAD }]}>
      {/* HERO: Avatar + Main Info */}
      <View
        style={[
          styles.heroCard,
          {
            padding: PAD,
            borderRadius: CARD_R + 2,
            marginBottom: CARD_SPACE,
          },
        ]}
      >
        <Pressable onPress={pickProfileImage} style={styles.avatarWrap}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={[
                styles.avatar,
                { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },
              ]}
            />
          ) : (
            <Ionicons name="person-circle" size={AVATAR} color="#b8b8b8" />
          )}
          <View
            style={[styles.avatarBadge, { padding: isUltraCompact ? 5 : 6 }]}
          >
            <Ionicons
              name="camera"
              size={isUltraCompact ? 14 : 16}
              color="#fff"
            />
          </View>
        </Pressable>

        {/* Name row */}
        {editingName ? (
          <View style={[styles.editRow, { marginTop: GAP }]}>
            <TextInput
              style={[
                styles.input,
                {
                  paddingVertical: isUltraCompact ? 8 : 10,
                  paddingHorizontal: 14,
                  fontSize: isUltraCompact ? 15 : 16,
                  maxWidth: 320,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <Pressable
              style={[
                styles.iconBtnPrimary,
                { paddingVertical: BTN_PY - 2, paddingHorizontal: 14 },
              ]}
              onPress={saveName}
              accessibilityLabel="Save name"
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.nameRow, { marginTop: GAP }]}>
            <Text
              style={[styles.nameText, { fontSize: NAME_F, maxWidth: 240 }]}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Pressable
              style={[
                styles.iconBtn,
                { paddingVertical: 8, paddingHorizontal: 12 },
              ]}
              onPress={() => setEditingName(true)}
              accessibilityLabel="Edit name"
            >
              <Ionicons name="pencil" size={16} color="#111" />
            </Pressable>
          </View>
        )}

        {/* Title row */}
        <View style={[styles.titleRow, { marginTop: GAP }]}>
          <Text
            style={[styles.titleText, { fontSize: TITLE_F }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Pressable
            style={styles.titleIconBtn}
            onPress={openTitlePicker}
            accessibilityLabel={
              hasUnlockedTitles ? "Change title" : "Title locked"
            }
            disabled={!hasUnlockedTitles}
          >
            <Ionicons
              name={hasUnlockedTitles ? "pricetags" : "lock-closed"}
              size={18}
              color={hasUnlockedTitles ? "#111" : "#999"}
            />
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View
          style={[
            styles.statsRow,
            {
              marginTop: GAP + 4,
              paddingVertical: isUltraCompact ? 10 : 12,
              paddingHorizontal: 10,
              borderRadius: 14,
            },
          ]}
        >
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { fontSize: STAT_VALUE_F }]}>
              {outfitCount}
            </Text>
            <Text style={[styles.statLabel, { fontSize: STAT_LABEL_F }]}>
              Outfits
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { fontSize: STAT_VALUE_F }]}>
              {formatJoined(installDate)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: STAT_LABEL_F }]}>
              Joined
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text
              style={[styles.statValue, { fontSize: STAT_VALUE_F }]}
              numberOfLines={1}
            >
              🎯
            </Text>
            <Text style={[styles.statLabel, { fontSize: STAT_LABEL_F }]}>
              Streak
            </Text>
          </View>
        </View>
      </View>

      {/* PROGRESS: Title Unlock */}
      <View
        style={[
          styles.card,
          { padding: PAD, borderRadius: CARD_R, marginBottom: CARD_SPACE },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[styles.cardTitle, { fontSize: isUltraCompact ? 17 : 18 }]}
          >
            Title Progress
          </Text>
          <Text style={styles.cardMeta}>{progressPercent}%</Text>
        </View>
        <View style={[styles.progressTrack, { height: PROGRESS_H }]}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={[styles.helperTextLarge, { marginTop: GAP - 2 }]}>
          {nextMilestoneText}
        </Text>
      </View>

      {/* QUICK ACTIONS */}
      <View
        style={[
          styles.card,
          { padding: PAD, borderRadius: CARD_R, marginBottom: 0 },
        ]}
      >
        <Text
          style={[styles.cardTitle, { fontSize: isUltraCompact ? 17 : 18 }]}
        >
          Quick Actions
        </Text>

        {/* On ultra-compact screens reduce to tighter grid gaps */}
        <View
          style={[
            styles.quickGrid,
            { gap: isUltraCompact ? 8 : 10, marginTop: 8 },
          ]}
        >
          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={pickProfileImage}
          >
            <Ionicons name="image-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Change Photo</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={() => setEditingName(true)}
          >
            <Ionicons name="create-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Edit Name</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={openTitlePicker}
          >
            <Ionicons name="pricetags-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Titles</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={onOpenManual}
          >
            <Ionicons name="book-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>User Manual</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={onOpenSettings}
          >
            <Ionicons name="settings-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Settings</Text>
          </Pressable>

          <View style={[styles.quickBtnDisabled, { paddingVertical: BTN_PY }]}>
            <Ionicons name="calendar-outline" size={22} color="#999" />
            <Text style={styles.quickTxtDisabled}>Calendar</Text>
          </View>
        </View>
      </View>

      {/* Title Picker Modal */}
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
                        numberOfLines={1}
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
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  // HERO
  heroCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.12 : 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    borderWidth: 3,
    borderColor: "#efefef",
  },
  avatarBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "#111",
    borderRadius: 999,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameText: {
    fontWeight: "800",
  },
  iconBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconBtnPrimary: {
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  titleIconBtn: {
    padding: 6,
    borderRadius: 8,
    // keep it subtle; no bg needed, but uncomment if you want a chip feel:
    backgroundColor: "#f2f2f2",
  },
  titleText: {
    color: "#444",
    fontWeight: "700",
  },
  changeTitleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f2f2f2",
  },
  changeTitleBtnDisabled: {
    opacity: 0.6,
  },
  changeTitleTxt: { fontSize: 14, color: "#111", fontWeight: "600" },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    backgroundColor: "#f7f7f7",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  statValue: {
    fontWeight: "800",
  },
  statLabel: {
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 6,
  },

  // GENERIC CARD
  card: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "800",
  },
  cardMeta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },

  // Progress
  progressTrack: {
    backgroundColor: "#eee",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#111",
  },
  helperTextLarge: {
    fontSize: 13,
    color: "#666",
  },

  // Quick actions
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickBtn: {
    width: "48%",
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickBtnDisabled: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    opacity: 0.6,
  },
  quickTxt: { fontSize: 14, fontWeight: "700", color: "#111" },
  quickTxtDisabled: { fontSize: 14, fontWeight: "700", color: "#999" },

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
    maxWidth: 380,
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
    fontWeight: "800",
    marginBottom: 8,
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
    backgroundColor: "#eaeaea",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  titleOptionLocked: {
    opacity: 0.6,
  },
  titleOptionText: { fontSize: 15, color: "#111", fontWeight: "700" },
  lockedSub: { fontSize: 12, color: "#777", marginTop: 2 },
  unlockedSub: { fontSize: 12, color: "#4a4a4a", marginTop: 2 },

  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 16,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
