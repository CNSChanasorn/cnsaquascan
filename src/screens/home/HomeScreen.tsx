import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import GradientBackground from "../../components/GradientBackground";
import { auth, db } from "../../firebase/firebase"; // ตรวจสอบ path ให้ถูกต้อง

// Define UserData type
type UserData = {
  fullName: string;
  username: string;
  avatar?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserData | null>(null);

  // 🔥 Fetch User Data Logic (เหมือนใน ProfileScreen)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          }
        } catch (err) {
          console.log("Error fetching user:", err);
        }
      }
    });

    return unsub;
  }, []);

  // Mock variety data
  const varieties = [
    {
      id: 1,
      name: "Sai Nam Phueng",
      image:
        "https://i.pinimg.com/736x/17/1c/4e/171c4e706441e6ac491585d2c25718ac.jpg",
    },
    {
      id: 2,
      name: "Mandarin",
      image:
        "https://i.pinimg.com/1200x/76/e6/85/76e68521b0def637efd98da3c71bcce4.jpg",
    },
    {
      id: 3,
      name: "Tangerine",
      image:
        "https://i.pinimg.com/1200x/9f/d0/89/9fd08929da3fa68c90d05a32b8fdcc4e.jpg",
    },
  ];

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* 🔝 Header */}
        <AppHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Welcome Card */}
          <LinearGradient
            colors={["#FB9D4B", "#FD691A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.analysisCard}
          >
            {/* 1. Welcome Text อยู่ด้านบน */}
            <Text style={styles.welcomeText}>Welcome</Text>

            {/* 2. รูป Profile จาก User Data */}
            <Image
              source={{
                uri: userData?.avatar || "https://via.placeholder.com/200",
              }}
              style={styles.userImage}
            />

            {/* 3. ชื่อ User อยู่ด้านล่างรูป */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userData?.username || "Guest"}
              </Text>
            </View>
          </LinearGradient>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: 20, fontWeight: "bold", color: "#5E2206" },
              ]}
            >
              Features
            </Text>

            <View style={styles.featuresGrid}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert("Hardware", "Hardware information")}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={["#FFD270", "#FB9D4B", "#FD691A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButton}
                >
                  <MaterialIcons name="hardware" size={28} color="#FFF" />
                  <Text style={[styles.featureLabel, { color: "#FFF" }]}>
                    Hardware
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert("AI", "AI analysis information")}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={["#FFD270", "#FB9D4B", "#FD691A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButton}
                >
                  <MaterialIcons name="smart-toy" size={28} color="#FFF" />
                  <Text style={[styles.featureLabel, { color: "#FFF" }]}>
                    AI
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert("Quality", "Quality analysis")}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={["#FFD270", "#FB9D4B", "#FD691A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureButton}
                >
                  <MaterialIcons name="check-circle" size={28} color="#FFF" />
                  <Text style={[styles.featureLabel, { color: "#FFF" }]}>
                    Quality
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Variety Section */}
          <View style={styles.varietySection}>
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: 20, fontWeight: "bold", color: "#5E2206" },
              ]}
            >
              Variety
            </Text>

            <View style={styles.varietyGrid}>
              {varieties.map((variety) => (
                <TouchableOpacity
                  key={variety.id}
                  style={styles.varietyItem}
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      variety.name,
                      "View more details about this variety",
                    )
                  }
                >
                  <Image
                    source={{ uri: variety.image }}
                    style={styles.varietyImage}
                  />
                  <Text style={styles.varietyName}>{variety.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  analysisCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },

  welcomeText: {
    fontSize: 50,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 12, // เว้นระยะห่างกับรูป
  },

  userImage: {
    width: 120, // ปรับขนาดให้พอดี
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFF",
  },

  userInfo: {
    alignItems: "center",
  },

  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
  },

  featuresSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#2C2C2C",
    marginBottom: 16,
    fontWeight: "600",
  },

  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  featureButton: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  featureLabel: {
    marginTop: 8,
    fontWeight: "600",
  },

  varietySection: {
    marginBottom: 24,
  },

  varietyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  varietyItem: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    elevation: 3,
  },

  varietyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },

  varietyName: {
    fontSize: 12,
    fontWeight: "600",
  },
});
