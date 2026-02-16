import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GradientBackground from "../../components/GradientBackground";
import { auth } from "../../firebase/firebase";
import { userRepository } from "../../firebase/repositories/userRepository";
import { deleteImageLocally, saveImageLocally } from "../../firebase/storage";

type UserData = {
  fullName: string;
  username: string;
  phone?: string;
  email: string;
  avatar?: string;
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  /* 🔥 Load current login user */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ No user login");
        setLoading(false);
        return;
      }

      console.log("✅ Login UID:", user.uid);
      setUid(user.uid);

      try {
        const localUser: any = await userRepository.getUserById(user.uid);

        if (!localUser) {
          setUserData({
            fullName: user.displayName || "-",
            username: user.email || "-",
            phone: "-",
            email: user.email || "-",
            avatar: "",
          });
          setAvatarVersion(Date.now());
          setLoading(false);
          return;
        }

        setUserData({
          fullName: localUser.full_name,
          username: localUser.username,
          email: localUser.email,
          avatar: localUser.avatar || "",
          phone: localUser.phone || "-",
        });
        setAvatarVersion(Date.now());
      } catch (err) {
        console.log("🔥 Load user error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  /* 📸 Pick image from gallery */
  const pickImage = async () => {
    if (!uid) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      try {
        // Delete old avatar if exists
        if (userData?.avatar) {
          await deleteImageLocally(userData.avatar);
        }

        // Save new avatar locally
        const localPath = await saveImageLocally(imageUri, `avatar_${uid}.jpg`);

        await userRepository.updateAvatar(uid, localPath);

        setUserData((prev) => (prev ? { ...prev, avatar: localPath } : prev));
        setAvatarVersion(Date.now());
      } catch (err) {
        Alert.alert("Error", "Failed to save image");
        console.log("Save error:", err);
      }
    }
  };

  /* 🔗 Set image by URL */
  const openImageLink = () => {
    if (!uid) return;
    setLinkInput(userData?.avatar || "");
    setIsLinkModalOpen(true);
  };

  const saveImageLink = async () => {
    if (!uid) return;
    const url = linkInput.trim();
    if (!url) {
      Alert.alert("Error", "Please enter a URL");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert("Error", "URL must start with http:// or https://");
      return;
    }

    try {
      await userRepository.updateAvatar(uid, url);

      setUserData((prev) => (prev ? { ...prev, avatar: url } : prev));
      setAvatarVersion(Date.now());
      setIsLinkModalOpen(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update avatar");
      console.log("Update error:", err);
    }
  };

  /* 🚪 Logout */
  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FD8342" />
        </View>
      </GradientBackground>
    );
  }

  const avatarUri = userData?.avatar
    ? `${userData.avatar}${userData.avatar.includes("?") ? "&" : "?"}v=${avatarVersion}`
    : "";

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.profileCircle}>
            <MaterialIcons name="person" size={24} color="#FD8342" />
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.avatarBox}>
          {userData?.avatar ? (
            <>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </>
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <MaterialIcons name="person" size={60} color="#FD8342" />
            </View>
          )}

          <TouchableOpacity
            style={styles.camera}
            onPress={() =>
              Alert.alert("Choose", "Select option", [
                { text: "Gallery", onPress: pickImage },
                { text: "Image URL", onPress: openImageLink },
                { text: "Cancel", style: "cancel" },
              ])
            }
          >
            <MaterialIcons name="photo-camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={isLinkModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsLinkModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Image URL</Text>
              <TextInput
                value={linkInput}
                onChangeText={setLinkInput}
                placeholder="https://..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.modalInput}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={() => setIsLinkModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSave]}
                  onPress={saveImageLink}
                >
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Info */}
        <Text style={styles.username}>{userData?.username}</Text>

        <View style={styles.infoCard}>
          <MaterialIcons name="person-outline" size={20} color="#FD8342" />
          <Text>{userData?.fullName}</Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="phone" size={20} color="#FD8342" />
          <Text>{userData?.phone}</Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="email" size={20} color="#FD8342" />
          <Text>{userData?.email}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBox: { position: "relative", alignSelf: "center", marginBottom: 16 },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  defaultAvatar: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#FF8A3D",
    padding: 6,
    borderRadius: 16,
  },
  username: { textAlign: "center", fontWeight: "600", marginBottom: 20 },
  infoCard: {
    backgroundColor: "#FFB067",
    borderRadius: 30,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    gap: 10,
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#FF5A5A",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#F0D7C3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: "#EEE",
  },
  modalSave: {
    backgroundColor: "#FF8A3D",
  },
  modalCancelText: { color: "#333", fontWeight: "600" },
  modalSaveText: { color: "#fff", fontWeight: "600" },
});
