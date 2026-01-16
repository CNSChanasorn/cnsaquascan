import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
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
    >
      <View style={styles.collectedItemContent}>
        <Text style={styles.collectedItemVariety}>🍊 {item.name}</Text>
        <View style={styles.collectedItemDetails}>
          <Text style={styles.collectedItemDetail}>Size: {item.size}</Text>
          <Text style={styles.collectedItemDetail}>Weight: {item.weight}</Text>
        </View>
      </View>

      <View style={styles.collectedItemCheckbox}>
        {selected && (
          <MaterialIcons name="check" size={20} color="#FD8342" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AnalysisScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>(
    "https://images.unsplash.com/photo-1569410849066-a82e2b7c3df7?w=300&q=80"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
          docId: doc.id,
          id: d.id || doc.id,
          name: d.variety || d.name || "-",
          size: d.size || "-",
          weight: d.weight || "-",
          date: d.date || "-",
          time: d.time || "-",
          image: d.image,
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

  const handleSelectImage = () => {
    Alert.alert("Select Image", "Choose how to upload", [
      {
        text: "Camera",
        onPress: () => {
          setSelectedImage(
            "https://images.unsplash.com/photo-1569410849066-a82e2b7c3df7?w=300&q=80"
          );
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          setSelectedImage(
            "https://images.unsplash.com/photo-1599599810694-b5ac4dd63edb?w=300&q=80"
          );
        },
      },
      { text: "Cancel", onPress: () => {} },
    ]);
  };

  const handleMeasure = () => {
    if (!selectedItem) {
      Alert.alert("Error", "Please select an item from the collected data");
      return;
    }
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigation.navigate("Result");
    }, 2000);
  };

  const handleSelectItem = (item: CollectionItem) => {
    setSelectedItem(item);
    setSelectedImage(item.image || selectedImage);
  };

  const renderCollectedItem: ListRenderItem<CollectionItem> = ({ item }) => (
  <TouchableOpacity
    style={[
      styles.collectedItem,
      selectedItem?.docId === item.docId && styles.collectedItemSelected,
    ]}
    onPress={() => handleSelectItem(item)}
  >

    <Image
  source={{ uri: item.image || "https://via.placeholder.com/100" }}
  style={styles.collectedItemImage}
/>

    <View style={styles.collectedItemContent}>
      <Text style={styles.collectedItemVariety}>🍊 {item.name}</Text>
      <View style={styles.collectedItemDetails}>
        <Text style={styles.collectedItemDetail}>
          Size: {item.size}
        </Text>
        <Text style={styles.collectedItemDetail}>
          Weight: {item.weight}
        </Text>
      </View>
    </View>

    <View style={styles.collectedItemCheckbox}>
      {selectedItem?.docId === item.docId && (
        <MaterialIcons name="check" size={20} color="#FD8342" />
      )}
    </View>
  </TouchableOpacity>
);

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
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
        
        {/* Collected Data Section */}
        <View style={styles.collectedSection}>
          <Text style={styles.sectionTitle}>Collected Data</Text>

          {data.length > 0 ? (
  <View style={styles.collectedList}>
    {data.map((item) => (
      <CollectedItemCard
        key={item.docId}
        item={item}
        selected={selectedItem?.docId === item.docId}
        onPress={() => handleSelectItem(item)}
      />
    ))}

    {/* Measure Button */}
        <TouchableOpacity
          style={styles.measureButton}
          onPress={handleMeasure}
          disabled={isAnalyzing}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#FFD270", "#FFA160"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.measureGradient}
          >
            <MaterialIcons
              name={isAnalyzing ? "schedule" : "check-circle"}
              size={24}
              color="#FFF"
            />
            <Text style={styles.measureText}>
              {isAnalyzing ? "Analyzing..." : "Measure"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
  </View>
) : (
  <View style={styles.emptyState}>
    <MaterialIcons name="inbox" size={48} color="#CCC" />
    <Text style={styles.emptyText}>No data to analyze</Text>
  </View>
)}

        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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

  headerTitle: {
    fontSize: 28,
    fontFamily: "Cormorant-SemiBold",
    color: "#FD8342",
    fontWeight: "700",
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
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#2C2C2C",
  },

//   imageCard: {
//     borderRadius: 20,
//     height: 280,
//     marginBottom: 20,
//     overflow: "hidden",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//   },

//   heartIcon: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     zIndex: 10,
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },

  analysisImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  measureButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },

  measureGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 12,
  },

  measureText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFF",
    fontWeight: "600",
  },

  collectedSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#2C2C2C",
    marginBottom: 16,
    fontWeight: "600",
  },

  collectedList: {
  paddingHorizontal: 20,
  paddingBottom: 120, // เผื่อปุ่ม Measure / FAB
},

  collectedItem: {
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 14,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  position: "relative",
  minHeight: 120,
},

collectedItemImage: {
  width: 100,
  height: 100,
  borderRadius: 12,
  marginRight: 12,
  backgroundColor: "#F2F2F2",
},

  collectedItemSelected: {
  borderWidth: 2,
  borderColor: "#FD8342",
  backgroundColor: "#FFF7F2",
},

  collectedItemContent: {
    flex: 1,
  },

  collectedItemVariety: {
  fontSize: 16,
  fontWeight: "600",
  color: "#2C2C2C",
  marginBottom: 8,
},

  collectedItemDetails: {
  flexDirection: "row",
  flexWrap: "wrap",
},

  collectedItemDetail: {
  width: "50%",
  fontSize: 12,
  color: "#999",
  marginBottom: 4,
},

  collectedItemCheckbox: {
  position: "absolute",
  top: 10,
  right: 12,
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#E0E0E0",
  justifyContent: "center",
  alignItems: "center",
},

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#999",
    marginTop: 12,
  },
});