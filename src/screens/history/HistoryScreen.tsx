import { MaterialIcons } from "@expo/vector-icons";
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
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AppHeader from "../../components/AppHeader";
import GradientBackground from "../../components/GradientBackground";
import { db } from "../../firebase/firebase";

type HistoryItem = {
  docId: string;
  name: string;
  grade: "good" | "medium" | "bad";
  sweetness: string;
  date: string;
  time: string;
  image?: string;
};

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

/* 🔁 แปลงค่าเกรด */
const gradeText = (grade: HistoryItem["grade"]) => {
  if (grade === "good") return "Good";
  if (grade === "medium") return "Medium";
  return "Bad";
};

export default function HistoryScreen() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: HistoryItem[] = snapshot.docs.map((docSnap) => {
        const d: any = docSnap.data();

        return {
          docId: docSnap.id,
          name: d.name ?? "-",
          grade: d.grade ?? "medium",
          sweetness: d.sweetness ?? "-",
          date: d.date ?? "-",
          time: d.time ?? "-",
          image: d.image ?? DEFAULT_IMAGE,
        };
      });

      setData(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <GradientBackground>
      <View style={styles.container}>

        {/* 🔝 Header (ใช้ AppHeader) */}
        <AppHeader />

        {/* 🔍 Search */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#FD8342"
            style={styles.searchInput}
          />
          <MaterialIcons name="search" size={22} color="#FD8342" />
        </View>

        {/* 📜 List */}
        {loading ? (
          <ActivityIndicator size="large" color="#FD8342" />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {data.map((item) => (
              <HistoryCard key={item.docId} item={item} navigator={navigator} />
            ))}
          </ScrollView>
        )}
      </View>
    </GradientBackground>
  );
}

/* 🧩 Card */
function HistoryCard({
  item,
  navigator,
}: {
  item: HistoryItem;
  navigator: any;
}) {
  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "history", docId));
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => navigator.navigator("EditHistory", { item })}
        >
          <MaterialIcons name="edit" size={18} color="#FD8342" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.docId)}
          style={{ marginLeft: 10 }}
        >
          <MaterialIcons name="delete" size={18} color="red" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: item.image || DEFAULT_IMAGE }}
        style={styles.cardImage}
      />

      <View style={styles.cardInfo}>
        <View style={styles.cardGrid}>
          <Text style={styles.cardItem}>🍊 {item.name}</Text>
          <Text style={styles.cardItem}>
            🏷️ Grade: {gradeText(item.grade)}
          </Text>
          <Text style={styles.cardItem}>
            🍬 Sweetness: {item.sweetness}
          </Text>
          <Text style={styles.cardItem}>📅 {item.date}</Text>
          <Text style={styles.cardItem}>⏰ {item.time}</Text>
        </View>
      </View>
    </View>
  );
}

/* 🎨 Styles (ไม่แตะ) */
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
  cardActions: {
    position: "absolute",
    top: 10,
    right: 12,
    flexDirection: "row",
    zIndex: 10,
  },
});