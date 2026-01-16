import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
        const list: CollectionItem[] = snapshot.docs.map((docSnap) => {
          const d: any = docSnap.data();

          return {
            docId: docSnap.id, // ✅ ใช้ลบ
            id: d.id || docSnap.id,
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
  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "collections", item.docId));
            } catch (err) {
              console.log("DELETE ERROR:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* 🔝 Icons มุมขวาบน */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditCollection", { item })
          }
        >
          <MaterialIcons name="edit" size={18} color="#FD8342" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 10 }}>
          <MaterialIcons name="delete" size={18} color="red" />
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

/* 🎨 Styles (โครงสร้างเดิม + เพิ่มเล็กน้อย) */
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
    position: "relative",
  },
  cardActions: {
    position: "absolute",
    top: 10,
    right: 12,
    flexDirection: "row",
    zIndex: 10,
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