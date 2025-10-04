// ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
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

export default function ProfilePage({ onOpenManual, onOpenSettings }: Props) {
  const [name, setName] = useState<string>("John Doe");
  const [title, setTitle] = useState<string>("Fashion Enthusiast 👕👖");
  const [editingName, setEditingName] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [installDate, setInstallDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [n, t, p, i] = await Promise.all([
        AsyncStorage.getItem("profileName"),
        AsyncStorage.getItem("profileTitle"),
        AsyncStorage.getItem("profilePhoto"),
        AsyncStorage.getItem("installDate"),
      ]);
      if (n) setName(n);
      if (t) setTitle(t);
      if (p) setPhotoUri(p);
      if (i) setInstallDate(i);
    })();
  }, []);

  const saveName = async () => {
    await AsyncStorage.setItem("profileName", name.trim() || "John Doe");
    setEditingName(false);
  };

  const saveTitle = async () => {
    await AsyncStorage.setItem("profileTitle", title.trim() || "Enthusiast");
    setEditingTitle(false);
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

      {/* Title row */}
      <View style={styles.row}>
        {editingTitle ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Your title"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveTitle}
            />
            <Pressable style={styles.iconBtn} onPress={saveTitle}>
              <Ionicons name="checkmark" size={22} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <Text style={styles.profileText}>{title}</Text>
            <Pressable
              style={styles.iconBtn}
              onPress={() => setEditingTitle(true)}
              accessibilityLabel="Edit title"
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>

      <Text style={styles.joinedText}>Joined: {formatJoined(installDate)}</Text>

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
  joinedText: { marginTop: 6, fontSize: 14, color: "#666" },
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
});
