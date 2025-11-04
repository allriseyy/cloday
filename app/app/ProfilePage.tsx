// ProfilePage.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import styles from "./styles/ProfilePageStyles";

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

const instagramUrl = "https://instagram.com/yiyonglim"; // ← change this

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

  // --- Newsletter modal state ---
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

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

  // Inside ProfilePage component (alongside sendFeedbackEmail, submitNewsletter, etc.)
  const openInstagram = async () => {
    try {
      const can = await Linking.canOpenURL(instagramUrl);
      if (can) {
        await Linking.openURL(instagramUrl);
      } else {
        Alert.alert("Unable to open", "Please visit: " + instagramUrl);
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong opening Instagram.");
    }
  };

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "The app needs access to your photos to let you upload and share pictures from your gallery."
      );
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

  const sendFeedbackEmail = async () => {
    const email = "allriseyy@gmail.com";
    const subject = encodeURIComponent("Cloday Feedback");
    const body = encodeURIComponent(
      "Hi there,\n\nI’d like to share the following feedback:\n\n"
    );
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Could not open email app on this device.");
    }
  };

  // --- Newsletter helpers ---
  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const submitNewsletter = async () => {
    const cleaned = newsletterEmail.trim();
    if (!validateEmail(cleaned)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    const to = "allriseyy@gmail.com"; // change if needed
    const subject = encodeURIComponent("Newsletter Signup");
    const body = encodeURIComponent(
      `Please add me to your newsletter.\n\nEmail: ${cleaned}\n\n(From Profile > Newsletter)`
    );
    const url = `mailto:${to}?subject=${subject}&body=${body}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      setNewsletterOpen(false);
      setNewsletterEmail("");
    } else {
      Alert.alert("Unable to open email app", `Please email us at ${to}`);
    }
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
  const isUltraCompact = height < 640;
  const isCompact = !isUltraCompact && height < 740;

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
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ padding: PAD }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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
                styles.inputInline,
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
          { padding: PAD, borderRadius: CARD_R, marginBottom: CARD_SPACE },
        ]}
      >
        <Text
          style={[styles.cardTitle, { fontSize: isUltraCompact ? 17 : 18 }]}
        >
          Quick Actions
        </Text>

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
            <Ionicons name="person-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Edit</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={() => setEditingName(true)}
          >
            <Ionicons name="create-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Name</Text>
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
            <Text style={styles.quickTxt}>Manual</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={onOpenSettings}
          >
            <Ionicons name="settings-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Settings</Text>
          </Pressable>

          <Pressable
            style={[styles.quickBtn, { paddingVertical: BTN_PY }]}
            onPress={sendFeedbackEmail}
          >
            <Ionicons name="mail-outline" size={22} color="#111" />
            <Text style={styles.quickTxt}>Feedback</Text>
          </Pressable>
        </View>
      </View>

      {/* NEW: NEWSLETTER SECTION */}
      <View
        style={[
          styles.card,
          { padding: PAD, borderRadius: CARD_R, marginBottom: 0 },
        ]}
      >
        <Text
          style={[styles.cardTitle, { fontSize: isUltraCompact ? 17 : 18 }]}
        >
          Newsletter
        </Text>
        <Text style={{ color: "#666", marginTop: 6, marginBottom: 10 }}>
          Get occasional tips and updates. Unsubscribe anytime.
        </Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => setNewsletterOpen(true)}
          accessibilityLabel="Subscribe to newsletter"
        >
          <Text style={styles.primaryBtnText}>Subscribe to Newsletter</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryBtn} onPress={openInstagram}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="logo-instagram" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Follow on Instagram</Text>
        </View>
      </Pressable>

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

      {/* Newsletter Modal */}
      <Modal
        visible={newsletterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setNewsletterOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={styles.modalTitle}>Subscribe</Text>
              <Pressable
                onPress={() => setNewsletterOpen(false)}
                accessibilityLabel="Close"
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#111" />
              </Pressable>
            </View>

            <Text style={styles.modalHint}>
              Thank you! Please enter your email and we’ll open your mail app to
              send us a signup request.
            </Text>

            <TextInput
              style={styles.input}
              value={newsletterEmail}
              onChangeText={setNewsletterEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="send"
              onSubmitEditing={submitNewsletter}
              accessibilityLabel="Email address"
            />

            <Pressable style={styles.primaryBtn} onPress={submitNewsletter}>
              <Text style={styles.primaryBtnText}>Subscribe</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
