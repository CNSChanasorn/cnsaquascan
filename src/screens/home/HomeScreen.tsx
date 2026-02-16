import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
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
import { auth } from "../../firebase/firebase"; // ตรวจสอบ path ให้ถูกต้อง
import { userRepository } from "../../firebase/repositories/userRepository";

// Define UserData type
type UserData = {
  fullName: string;
  username: string;
  avatar?: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const loadUser = useCallback(async (userId: string) => {
    try {
      const localUser: any = await userRepository.getUserById(userId);

      if (localUser) {
        setUserData({
          fullName: localUser.full_name,
          username: localUser.username,
          avatar: localUser.avatar || "",
        });
        setAvatarVersion(Date.now());
      }
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  }, []);

  // 🔥 Fetch User Data Logic (เหมือนใน ProfileScreen)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUser(user.uid);
      }
    });

    return unsub;
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        void loadUser(currentUser.uid);
      }
    }, [loadUser]),
  );

  // Mock variety data
  const varieties = [
    {
      id: 1,
      name: "Sai Nam Phueng",
      image:
        "https://i.pinimg.com/736x/17/1c/4e/171c4e706441e6ac491585d2c25718ac.jpg",
      description:
        "Sai Nam Phueng is a premium citrus variety known for its sweet flavor, smooth texture, and bright orange color. It has a thin peel, high juice content, and a balanced sugar level, making it highly desirable for consumption and commercial purposes. This variety is commonly recognized for its consistent quality, attractive appearance, and suitability for both fresh consumption and processing. The AI system identifies Sai Nam Phueng based on its size, color intensity, and surface characteristics.",
    },
    {
      id: 2,
      name: "Mandarin",
      image:
        "https://i.pinimg.com/1200x/76/e6/85/76e68521b0def637efd98da3c71bcce4.jpg",
      description:
        "Mandarin is a popular citrus variety characterized by its smaller size, easy-to-peel skin, and naturally sweet taste. It typically has a slightly softer texture and a bright orange color. Mandarins are widely consumed due to their convenient size and pleasant flavor. The system analyzes shape, color distribution, and surface features to accurately classify this variety. This variety is valued for its consumer appeal and nutritional benefits.",
    },
    {
      id: 3,
      name: "Tangerine",
      image:
        "https://i.pinimg.com/1200x/9f/d0/89/9fd08929da3fa68c90d05a32b8fdcc4e.jpg",
      description:
        "Tangerine is a citrus variety characterized by its slightly darker orange color, firm texture, and balanced sweet and tangy flavor. The skin is moderately easy to peel, and the fruit contains juicy segments. Tangerines are widely used for fresh consumption and juice production. This variety is valued for its strong aroma, vibrant color, and good storage capability.",
    },
  ];

  const avatarUri = userData?.avatar
    ? `${userData.avatar}${userData.avatar.includes("?") ? "&" : "?"}v=${avatarVersion}`
    : "";

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
            {userData?.avatar ? (
              <Image source={{ uri: avatarUri }} style={styles.userImage} />
            ) : (
              <View style={[styles.userImage, styles.defaultUserImage]}>
                <MaterialIcons name="person" size={60} color="#FD8342" />
              </View>
            )}

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
                onPress={() =>
                  Alert.alert(
                    "Hardware",
                    "This section provides detailed information about the system hardware components and their current operational status. It includes connected sensors, camera modules, processing units, and memory usage. The hardware system is responsible for capturing images, collecting sensor data, and ensuring stable performance during operation. All components are monitored in real-time to ensure reliability, accuracy, and efficient data processing.",
                  )
                }
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
                onPress={() =>
                  Alert.alert(
                    "AI",
                    "This section presents the results generated by the artificial intelligence system. The AI model processes captured images and sensor data to identify, classify, and analyze objects accurately. It uses a trained deep learning model to provide fast and reliable predictions. The AI system helps automate the analysis process, reduces human error, and improves overall efficiency and decision-making.",
                  )
                }
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
                onPress={() =>
                  Alert.alert(
                    "Quality",
                    "This section shows the quality evaluation results based on the analysis performed by the system. Various factors such as size, shape, color, and detected defects are considered to determine the overall quality. The quality assessment helps ensure consistency and supports decision-making for grading, sorting, or further processing. The system provides reliable and objective quality measurements.",
                  )
                }
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
                  onPress={() => Alert.alert(variety.name, variety.description)}
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

  defaultUserImage: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
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
