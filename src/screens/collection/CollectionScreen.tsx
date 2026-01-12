import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type CollectionItem = {
  id: string;
  name: string;
  size: string;
  weight: string;
  date: string;
  time: string;
  image: string;
};

export default function DataCollectionScreen() {
  const [data, setData] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      const res = await fetch("https://your-backend.com/api/collections");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.log("API error:", error);
    } finally {
      setLoading(false);
    }
  };

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

        {/* 👤 Profile Icon (Google Icon) */}
        <View style={styles.profileCircle}>
          <MaterialIcons name="person" size={24} color="#FD8342" />
        </View>
      </View>

      {/* 🔍 Search */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#FD8342"
          style={styles.searchInput}
        />
        <MaterialIcons name="search" size={22} color="#FD8342" />
      </View>

      {/* 📦 List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FD8342" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.map((item) => (
            <DataCard
              key={item.id}
              image={getImage(item.image)}
              id={item.id}
              name={item.name}
              size={item.size}
              weight={item.weight}
              date={item.date}
              time={item.time}
            />
          ))}
        </ScrollView>
      )}

      {/* ➕ Floating Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <MaterialIcons name="add" size={28} color="#fff" />
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
        <View style={styles.cardGrid}>
          <Text style={styles.cardItem}>🍊 {id}</Text>
          <Text style={styles.cardItem}>🍊 {name}</Text>
          <Text style={styles.cardItem}>⭕ {size}</Text>
          <Text style={styles.cardItem}>⚖️ {weight}</Text>
          <Text style={styles.cardItem}>📅 {date}</Text>
          <Text style={styles.cardItem}>⏰ {time}</Text>
        </View>
      </View>

      <MaterialIcons name="edit" size={18} color="#FD8342" />
    </View>
  );
}

/* 🔁 map image จาก backend */
function getImage(type: string) {
  switch (type) {
    case "orange":
      return require("../../../assets/images/orange.png");
    case "tangerine":
      return require("../../../assets/images/tangerine.png");
    default:
      return require("../../../assets/images/orange.png");
  }
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

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cardItem: {
    width: "50%",
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 4,
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
});