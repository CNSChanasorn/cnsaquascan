import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
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

type CollectionItem = {
  docId: string;
  id: string;
  name: string;
  size: string;
  weight: string;
  date: string;
  time: string;
  image?: string;
};

type CollectedItemCardProps = {
  item: CollectionItem;
  selected: boolean;
  onPress: () => void;
};

function CollectedItemCard({
  item,
  selected,
  onPress,
}: CollectedItemCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.collectedItem,
        selected && styles.collectedItemSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/150" }}
        style={styles.collectedItemImage}
      />

      <View style={styles.collectedItemContent}>
        <View style={styles.cardGrid}>
          <Text style={styles.cardItem}>🍊 ID: {item.id}</Text>
          <Text style={styles.cardItem}>🍊 Variety: {item.name}</Text>
          <Text style={styles.cardItem}>⭕ Size: {item.size}</Text>
          <Text style={styles.cardItem}>⚖️ Weight: {item.weight}</Text>
          <Text style={styles.cardItem}>📅 Date: {item.date}</Text>
          <Text style={styles.cardItem}>⏰ Time: {item.time}</Text>
        </View>
      </View>

      {selected && (
        <MaterialIcons
          name="check-circle"
          size={22}
          color="#FD8342"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
}

export default function AnalysisScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<CollectionItem[]>([]);
  const [selectedItem, setSelectedItem] =
    useState<CollectionItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "collections"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CollectionItem[] = snapshot.docs.map((doc) => {
        const d: any = doc.data();
        return {
          docId: doc.id,
          id: d.id || doc.id,
          name: d.name || "-",
          size: d.size || "0",
          weight: d.weight || "0",
          date: d.date || "-",
          time: d.time || "-",
          image: d.image,
        };
      });

      setData(list);
    });

    return unsubscribe;
  }, []);

  /* 🔮 Prediction Logic (FIXED & SAFE) */
  const predictOrange = (size: number, weight: number) => {
    let grade: "Good" | "Medium" | "Bad" = "Bad";
    let sweetness = 4;

    // 🟢 Good
    if (size >= 80 && weight >= 100) {
      grade = "Good";
      sweetness = 14;

    // 🟡 Medium
    } else if (
      (size >= 60 && size < 80) ||
      (weight >= 80 && weight < 100)
    ) {
      grade = "Medium";
      sweetness = 8;
    }

    return { grade, sweetness };
  };

  const handleMeasure = () => {
    if (!selectedItem) {
      Alert.alert("Error", "Please select an item");
      return;
    }

    const size = parseFloat(selectedItem.size.replace(/[^\d.]/g, ""));
    const weight = parseFloat(selectedItem.weight.replace(/[^\d.]/g, ""));

    const result = predictOrange(size, weight);

    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      navigation.navigate("Result", {
        image: selectedItem.image,
        variety: selectedItem.name,
        grade: result.grade,
        sweetness: result.sweetness,
        date: selectedItem.date,
        time: selectedItem.time,
      });
    }, 2000);
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* 🔝 Header (ใช้ Component แยก) */}
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

        <ScrollView contentContainerStyle={styles.list}>
          {data.map((item) => (
            <CollectedItemCard
              key={item.docId}
              item={item}
              selected={selectedItem?.docId === item.docId}
              onPress={() => setSelectedItem(item)}
            />
          ))}

          <TouchableOpacity
            onPress={handleMeasure}
            disabled={isAnalyzing}
            activeOpacity={0.85}
            style={styles.measureButton}
          >
            <LinearGradient
              colors={["#FFAC72", "#FF8937", "#FF6900"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.measureGradient}
            >
              <MaterialIcons
                name={isAnalyzing ? "schedule" : "check-circle"}
                size={22}
                color="#fff"
              />
              <Text style={styles.measureText}>
                {isAnalyzing ? "Analyzing..." : "Measure"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

/* 🎨 Styles (UNCHANGED) */
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
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
  searchInput: { flex: 1, color: "#FD8342" },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  collectedItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  collectedItemSelected: {
    borderWidth: 2,
    borderColor: "#FD8342",
  },
  collectedItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  collectedItemContent: { flex: 1 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap" },
  cardItem: { width: "50%", fontSize: 12, marginBottom: 4 },
  checkIcon: { position: "absolute", top: 10, right: 12 },
  measureButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 16,
  },
  measureGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  measureText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});