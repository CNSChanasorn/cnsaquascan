import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import GradientBackground from "../../components/GradientBackground";
import { orangeRepository } from "../../firebase/repositories/orangeRepository";
import { saveImageLocally } from "../../firebase/storage";

export default function EditCollectionScreen({ route, navigation }: any) {
  const { item } = route.params; // 👈 รับข้อมูลจากการ์ด

  const [id, setId] = useState(String(item.id ?? ""));
  const [variety, setVariety] = useState(String(item.name ?? ""));
  const [size, setSize] = useState(String(item.size ?? ""));
  const [weight, setWeight] = useState(String(item.weight ?? ""));
  const [date, setDate] = useState(String(item.date ?? ""));
  const [time, setTime] = useState(String(item.time ?? ""));
  const [imageUrl, setImageUrl] = useState(String(item.image ?? ""));
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLocalImageUri(uri);
      setImageUrl(uri);
    }
  };

  const handleUpdate = async () => {
    if (!id || !variety || !weight) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const createdAt = (() => {
        if (!date && !time) return undefined;
        const combined = `${date} ${time}`.trim();
        const parsed = Date.parse(combined);
        if (Number.isNaN(parsed)) return undefined;
        return new Date(parsed).toISOString();
      })();

      let finalImagePath = imageUrl;
      if (localImageUri) {
        finalImagePath = await saveImageLocally(
          localImageUri,
          `orange_${item.orangeId}.jpg`,
        );
      }

      await orangeRepository.updateOrange(
        item.orangeId,
        variety,
        Number.parseFloat(weight) || 0,
        Number.parseFloat(size) || 0,
        createdAt,
        finalImagePath || undefined,
        "pending",
      );

      Alert.alert("Success", "Data updated", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Data</Text>

        <TextInput style={styles.input} value={id} onChangeText={setId} />
        <TextInput
          style={styles.input}
          value={variety}
          onChangeText={setVariety}
        />
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

        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
          <LinearGradient
            colors={["#FFD270", "#FFA160", "#FD691A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.secondaryButton}
          >
            <Text style={styles.buttonText}>Pick Image</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUpdate} activeOpacity={0.85}>
          <LinearGradient
            colors={["#FFAC72", "#FF8937", "#FF6900"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Save"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </GradientBackground>
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
    color: "#922D24", // ให้เข้าธีมเดียวกับหน้าอื่น
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
  secondaryButton: {
    marginTop: 6,
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
