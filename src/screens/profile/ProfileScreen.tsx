import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../components/GradientBackground";
import { auth, db } from "../../firebase/firebase";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 Load user from Firestore */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.log("LOAD USER ERROR:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  /* 🚪 Logout */
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
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

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* 🔝 Header */}
        <View style={styles.header}>
          <MaterialIcons name="eco" size={26} color="#fff" />
          <View style={styles.profileCircle}>
            <MaterialIcons name="person" size={24} color="#FD8342" />
          </View>
        </View>

        {/* 🏷 Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>My Account</Text>
        </View>

        {/* 🖼 Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={{
              uri:
                userData?.avatar ||
                "https://via.placeholder.com/200",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.camera}>
            <MaterialIcons name="photo-camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 👤 Username */}
        <Text style={styles.username}>
          {userData?.username || "-"}
        </Text>

        {/* 📋 Info Cards */}
        <View style={styles.infoCard}>
          <MaterialIcons name="person-outline" size={20} color="#FD8342" />
          <Text style={styles.infoText}>
            {userData?.fullName || "-"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="phone" size={20} color="#FD8342" />
          <Text style={styles.infoText}>
            {userData?.phone || "-"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="email" size={20} color="#FD8342" />
          <Text style={styles.infoText}>
            {userData?.email || "-"}
          </Text>
        </View>

        {/* 🚪 Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  header: {
    width: "100%",
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

  titleBox: {
    backgroundColor: "#FFB067",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  avatarBox: {
    position: "relative",
    marginBottom: 12,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
  },

  camera: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#FF8A3D",
    borderRadius: 16,
    padding: 6,
  },

  username: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#FFB067",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  infoText: {
    fontSize: 14,
    fontWeight: "500",
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#FF5A5A",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});