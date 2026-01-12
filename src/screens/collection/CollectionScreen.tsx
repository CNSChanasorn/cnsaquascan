import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DataCollectionScreen() {
  return (
    <LinearGradient
      colors={["#FF8A3D", "#FFD1B0", "#FFF6EF"]}
      style={styles.container}
    >
      {/* 🔝 Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.profileCircle}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
      </View>

      {/* 🔍 Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#FD8342"
          style={styles.searchInput}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* 📦 List */}
      <ScrollView contentContainerStyle={styles.list}>
        <DataCard
          image={require("../../../assets/images/orange.png")}
          id="001"
          name="Mandarin"
          size="20 CM"
          weight="3 KG"
          date="12/12/2025"
          time="10:30 A.M."
        />

        <DataCard
          image={require("../../../assets/images/tangerine.png")}
          id="002"
          name="Tangerine"
          size="18 CM"
          weight="5 KG"
          date="12/12/2025"
          time="10:30 A.M."
        />
      </ScrollView>

      {/* ➕ Floating Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

/* 🧩 Card Component */
function DataCard({ image, id, name, size, weight, date, time }: any) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />

      <View style={styles.cardInfo}>
        {/* ✅ Grid 2 คอลัมน์ 3 แถว */}
        <View style={styles.cardGrid}>
          <Text style={styles.cardItem}>🍊 {id}</Text>
          <Text style={styles.cardItem}>🍊 {name}</Text>

          <Text style={styles.cardItem}>⭕ {size}</Text>
          <Text style={styles.cardItem}>⚖️ {weight}</Text>

          <Text style={styles.cardItem}>📅 {date}</Text>
          <Text style={styles.cardItem}>⏰ {time}</Text>
        </View>
      </View>

      <Text style={styles.editIcon}>✏️</Text>
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  logoImage: {
    width: 40,
    height: 40,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    fontSize: 20,
  },

  /* 🔍 Search */
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    height: 48,
  },

  searchInput: {
    flex: 1,
    fontFamily: "Inter-Regular",
    color: "#FD8342",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },

  searchIcon: {
    fontSize: 18,
    color: "#FD8342",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },

  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },

  cardInfo: {
    flex: 1,
  },

  /* ✅ Grid layout */
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cardItem: {
    width: "50%", // 2 คอลัมน์
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 4,
  },

  editIcon: {
    fontSize: 18,
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 70,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF8A3D",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  fabText: {
    color: "#fff",
    fontSize: 28,
  },
});