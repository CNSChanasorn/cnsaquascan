import { LinearGradient } from "expo-linear-gradient";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { db } from "../../firebase/firebase";

export default function EditCollectionScreen({ route, navigation }: any) {
  const { item } = route.params; // 👈 รับข้อมูลจากการ์ด

  const [id, setId] = useState(item.id);
  const [variety, setVariety] = useState(item.name);
  const [size, setSize] = useState(item.size);
  const [weight, setWeight] = useState(item.weight);
  const [date, setDate] = useState(item.date);
  const [time, setTime] = useState(item.time);
  const [imageUrl, setImageUrl] = useState(item.image);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!id || !variety || !weight) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "collections", item.docId), {
        id,
        name: variety,
        size,
        weight,
        date,
        time,
        image: imageUrl,
      });

      Alert.alert("Success", "Data updated");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FF8A3D", "#FFD1B0", "#FFF6EF"]}
      style={styles.container}
    >
      <Text style={styles.title}>Edit Data</Text>

      <TextInput style={styles.input} value={id} onChangeText={setId} />
      <TextInput style={styles.input} value={variety} onChangeText={setVariety} />
      <TextInput style={styles.input} value={size} onChangeText={setSize} />
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput style={styles.input} value={date} onChangeText={setDate} />
      <TextInput style={styles.input} value={time} onChangeText={setTime} />
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Image URL"
      />

      <TouchableOpacity onPress={handleUpdate} activeOpacity={0.85}>
        <LinearGradient
          colors={["#FDBA3A", "#B6D53A"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Save"}
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