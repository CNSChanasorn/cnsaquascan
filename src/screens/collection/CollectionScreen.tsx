import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

import { db } from "../../firebase/firebase";

type CollectionItem = {
  docId: string; // ✅ Firestore document id
  id: string;
  name: string;
  size: string;
  weight: string;
  date: string;
  time: string;
  image?: string;
};

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

export default function CollectionScreen({ navigation }: any) {
  const [data, setData] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "collections"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CollectionItem[] = snapshot.docs.map((doc) => {
          const d: any = doc.data();

          return {
            docId: doc.id, // ✅ สำคัญสำหรับ edit
            id: d.id || doc.id,
            name: d.variety || d.name || "-",
            size: d.size || "-",
            weight: d.weight || "-",
            date: d.date || "-",
            time: d.time || "-",
            image: d.image || DEFAULT_IMAGE,
          };
        });

        setData(list);
        setLoading(false);
      },
      (error) => {
        console.log("Firestore error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
              key={item.docId}
              item={item}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      )}

      {/* ➕ Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("AddCollection")}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

/* 🧩 Card Component */
function DataCard({
  item,
  navigation,
}: {
  item: CollectionItem;
  navigation: any;
}) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || DEFAULT_IMAGE }}
        style={styles.cardImage}
      />

      <View style={styles.cardInfo}>
        <View style={styles.cardGrid}>
          <Text style={styles.cardItem}>🍊 {item.id}</Text>
          <Text style={styles.cardItem}>🍊 {item.name}</Text>
          <Text style={styles.cardItem}>⭕ {item.size}</Text>
          <Text style={styles.cardItem}>⚖️ {item.weight}</Text>
          <Text style={styles.cardItem}>📅 {item.date}</Text>
          <Text style={styles.cardItem}>⏰ {item.time}</Text>
        </View>
      </View>

      {/* ✏️ Edit Button */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("EditCollection", {
            item,
          })
        }
      >
        <MaterialIcons name="edit" size={18} color="#FD8342" />
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 Styles (เดิมทั้งหมด) */
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