import { useNavigation, useRoute } from "@react-navigation/native";
import { addDoc, collection, getDocs } from "firebase/firestore";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import GradientBackground from "../../components/GradientBackground";
import { db } from "../../firebase/firebase";

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    id,
    image,
    variety = "-",
    grade = "-",
    sweetness = 0,
    date = "-",
    time = "-",
  } = route.params || {};

  /* 💾 Save to History */
  const handleSave = async () => {
    try {
      console.log("🔥 SAVE PRESSED");
      const now = new Date();

      // --- 🟢 ส่วนที่เพิ่มใหม่: สร้าง ID 001 ---
      let finalId = id; // ถ้ามี id ส่งมา (จากการสแกน) ให้ใช้ตัวนั้น

      if (!finalId) {
        // ถ้าไม่มี id ให้สร้างใหม่ โดยการนับจำนวน document ใน history
        const historyCollection = collection(db, "history");
        const snapshot = await getDocs(historyCollection);
        const count = snapshot.size; // นับจำนวนที่มีอยู่

        // แปลงเลขเป็น format "001", "002" (padZero)
        finalId = String(count + 1).padStart(3, "0");
      }

      await addDoc(collection(db, "history"), {
        id: finalId, // ✅ ใช้ ID ที่เราสร้าง
        name: variety,
        grade: grade.toLowerCase(),
        sweetness: `${sweetness}%`,
        date: now.toLocaleDateString("th-TH"),
        time: now.toLocaleTimeString("th-TH"),
        image: image,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Saved to history");
      navigation.navigate("History");
    } catch (error) {
      console.log("❌ SAVE ERROR:", error);
      Alert.alert("Error", "Cannot save data");
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* 🔝 Header */}
        <AppHeader />

        {/* 🔽 Content */}
        <View style={styles.contentContainer}>
          {/* 🖼 Image */}
          <View style={styles.imageCard}>
            <Image
              source={{ uri: image || "https://via.placeholder.com/300" }}
              style={styles.image}
            />
          </View>

          {/* 🍊 Variety */}
          <View style={styles.pill}>
            <Text style={styles.pillText}>🍊 Variety: {variety}</Text>
          </View>

          {/* ⭐ Grade + 🍬 Sweetness */}
          <View style={styles.row}>
            <View style={styles.smallCard}>
              <Text style={styles.smallText}>⭐ Grade: {grade}</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallText}>🍬 Sweetness: {sweetness}%</Text>
            </View>
          </View>

          {/* 📅 Date + ⏰ Time */}
          <View style={styles.row}>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>📅 Date: {date}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>⏰ Time: {time}</Text>
            </View>
          </View>

          {/* 🔘 Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>💾 Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GradientBackground>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  /* ✅ ตัวนี้แหละที่แก้ spacing */
  contentContainer: {
    paddingHorizontal: 20,
  },

  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 350,
    borderRadius: 20,
  },

  pill: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 14,
  },

  pillText: {
    fontSize: 16,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },

  smallText: {
    fontSize: 15,
    fontWeight: "600",
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },

  infoText: {
    fontSize: 14,
    fontWeight: "500",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#FF8A3D",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
