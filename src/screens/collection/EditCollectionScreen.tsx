import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [isVarietyOpen, setIsVarietyOpen] = useState(false);
  const [size, setSize] = useState(String(item.size ?? ""));
  const [weight, setWeight] = useState(String(item.weight ?? ""));
  const [date, setDate] = useState(String(item.date ?? ""));
  const [time, setTime] = useState(String(item.time ?? ""));
  const [imageUrl, setImageUrl] = useState(String(item.image ?? ""));
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const VARIETY_OPTIONS = ["Sai Nam Phueng", "Mandarin", "Tangarine"];

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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Data</Text>

          <TextInput style={styles.input} value={id} onChangeText={setId} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsVarietyOpen((prev) => !prev)}
            style={styles.dropdown}
          >
            <Text
              style={
                variety ? styles.dropdownText : styles.dropdownPlaceholderText
              }
            >
              {variety || "Select Variety"}
            </Text>
          </TouchableOpacity>

          {isVarietyOpen && (
            <View style={styles.dropdownList}>
              {VARIETY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setVariety(option);
                    setIsVarietyOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TextInput
            style={styles.input}
            value={size}
            onChangeText={setSize}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Date (DD/MM/YYYY) - Optional"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />

          <TextInput
            placeholder="Time (HH:mm:sec) - Optional"
            style={styles.input}
            value={time}
            onChangeText={setTime}
          />
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

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
              style={[styles.cancelButton, styles.actionButton]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdate}
              activeOpacity={0.85}
              style={styles.actionButton}
            >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 80,
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
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  dropdownText: {
    color: "#000",
  },
  dropdownPlaceholderText: {
    color: "#999",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    color: "#000",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  button: {
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
  cancelButton: {
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F2F2F2",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "600",
  },
});
