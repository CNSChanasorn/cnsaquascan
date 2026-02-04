import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
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
import ViewShot from "react-native-view-shot";

import AppHeader from "../../components/AppHeader";
import GradientBackground from "../../components/GradientBackground";
import { analysisRepository } from "../../firebase/repositories/analysisRepository";

type HistoryItem = {
  resultId: string;
  id: string;
  name: string;
  size: string;
  weight: string;
  grade: string;
  sweetness: string;
  date: string;
  time: string;
  status?: string;
  image?: string;
};

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

/* 🔁 แปลงค่าเกรด */
const gradeText = (grade: HistoryItem["grade"]) => {
  const g = grade?.toLowerCase?.() || "";
  if (g === "good") return "Good";
  if (g === "medium") return "Medium";
  if (g === "bad") return "Bad";
  return grade || "-";
};

export default function HistoryScreen() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  // 🔍 Search state
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        void analysisRepository.syncPendingAnalysis();
        const rows: any[] = await analysisRepository.getAllAnalysisResults();
        const list: HistoryItem[] = rows.map((row) => {
          const analyzedAt = row.analyzed_at
            ? new Date(row.analyzed_at)
            : new Date();
          return {
            resultId: row.result_id,
            id: row.orange_id,
            name: row.variety || "-",
            size: String(row.circle_line ?? "-") || "-",
            weight: String(row.weight ?? "-") || "-",
            grade: row.grade || "-",
            sweetness: `${row.brix_value ?? "-"}`,
            date: analyzedAt.toLocaleDateString("th-TH"),
            time: analyzedAt.toLocaleTimeString("th-TH"),
            status: row.status || "pending",
            image: row.image_uri || DEFAULT_IMAGE,
          };
        });

        setData(list);
      } catch (err) {
        console.log("LOAD HISTORY ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      setLoading(true);
      load();
    }
  }, [isFocused]);

  // 🔎 Filter logic
  const filteredData = data.filter((item) => {
    const keyword = searchText.toLowerCase();

    return (
      item.id.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      item.size.toLowerCase().includes(keyword) ||
      item.weight.toLowerCase().includes(keyword) ||
      gradeText(item.grade).toLowerCase().includes(keyword) ||
      item.sweetness.toLowerCase().includes(keyword) ||
      item.date.toLowerCase().includes(keyword) ||
      item.time.toLowerCase().includes(keyword) ||
      (item.status || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <GradientBackground>
      <View style={styles.container}>
        <AppHeader />

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#FD8342"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
          <MaterialIcons name="search" size={22} color="#FD8342" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FD8342" />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {filteredData.map((item) => (
              <HistoryCard key={item.resultId} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
    </GradientBackground>
  );
}

/* 🧩 Card */
function HistoryCard({ item }: { item: HistoryItem }) {
  const viewShotRef = useRef<ViewShot>(null);
  const statusValue = (item.status || "pending").toLowerCase();
  const statusLabel = statusValue === "synced" ? "Synced" : "Pending";
  const statusColor = statusValue === "synced" ? "#4CAF50" : "#FF9800";

  const handleSave = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture?.();
        if (uri) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, {
              mimeType: "image/png",
              dialogTitle: "Save or Share Image",
            });
          } else {
            Alert.alert("Error", "Sharing is not available on this device");
          }
        }
      }
    } catch (err) {
      console.log("SAVE ERROR:", err);
      Alert.alert("Error", "Failed to save image");
    }
  };

  const handleDelete = async (resultId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await analysisRepository.deleteAnalysis(resultId);
            } catch (err) {
              console.log("DELETE ERROR:", err);
            }
          },
        },
      ],
    );
  };

  return (
    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
      <View style={styles.card}>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={handleSave} style={{ marginRight: 10 }}>
            <MaterialIcons name="save" size={18} color="#4CAF50" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item.resultId)}>
            <MaterialIcons name="delete" size={18} color="red" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: item.image || DEFAULT_IMAGE }}
          style={styles.cardImage}
        />

        <View style={styles.cardInfo}>
          <View style={styles.cardGrid}>
            <Text style={styles.cardItem}>🍊 ID: {item.id}</Text>
            <Text style={styles.cardItem}>🍊 {item.name}</Text>
            <Text style={styles.cardItem}>⭕ Size: {item.size}</Text>
            <Text style={styles.cardItem}>⚖️ Weight: {item.weight}</Text>
            <Text style={styles.cardItem}>
              🏷️ Grade: {gradeText(item.grade)}
            </Text>
            <Text style={styles.cardItem}>🍬 Sweetness: {item.sweetness}</Text>
            <Text style={styles.cardItem}>📅 {item.date}</Text>
            <Text style={styles.cardItem}>⏰ {item.time}</Text>
            <Text
              style={[styles.cardItem, { color: statusColor, width: "100%" }]}
            >
              🔄 {statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </ViewShot>
  );
}

/* 🎨 Styles (ไม่แตะ) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
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
