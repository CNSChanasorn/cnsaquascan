import { LinearGradient } from "expo-linear-gradient";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { db } from "../../firebase/firebase";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/150"; // 🔁 fallback รูป

export default function AddCollectionScreen({ navigation }: any) {
  const [id, setId] = useState("");
  const [variety, setVariety] = useState("");
  const [size, setSize] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // ✅ เพิ่ม
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!id || !variety || !weight) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "collections"), {
        id,
        name: variety,                 // ✅ ตรงกับหน้า Collection
        size,
        weight,
        date,
        time,
        image: imageUrl || DEFAULT_IMAGE, // ✅ ใช้ URL
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Data added successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to add data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FF8A3D", "#FFD1B0", "#FFF6EF"]}
      style={styles.container}
    >
      <Text style={styles.title}>Add New Data</Text>

      <TextInput
        placeholder="ID"
        style={styles.input}
        value={id}
        onChangeText={setId}
      />

      <TextInput
        placeholder="Variety"
        style={styles.input}
        value={variety}
        onChangeText={setVariety}
      />

      <TextInput
        placeholder="Circle line"
        style={styles.input}
        value={size}
        onChangeText={setSize}
      />

      <TextInput
        placeholder="Weight (kg)"
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Date"
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        placeholder="Time"
        style={styles.input}
        value={time}
        onChangeText={setTime}
      />

      {/* 🖼 Image URL */}
      <TextInput
        placeholder="Image URL (optional)"
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
      />

      <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
        <LinearGradient
          colors={["#FFA160", "#FFD270", "#B6D53A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Add"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});