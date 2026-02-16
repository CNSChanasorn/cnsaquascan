import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import GradientBackground from "../../components/GradientBackground";

// 📸 Image Picker
import * as ImagePicker from "expo-image-picker";

// 🔥 Firebase
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { userRepository } from "../../firebase/repositories/userRepository";
import { saveImageLocally } from "../../firebase/storage";

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* 📸 เลือกรูป */
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
      setAvatar(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.toLowerCase().trim();
      const normalizedUsername = username.trim();

      const existingByEmail =
        await userRepository.getUserByEmail(normalizedEmail);
      if (existingByEmail) {
        Alert.alert("Register Failed", "Email already in use");
        return;
      }

      const existingByUsername =
        await userRepository.getUserByUsername(normalizedUsername);
      if (existingByUsername) {
        Alert.alert("Register Failed", "Username already in use");
        return;
      }

      // 🔐 Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

      const user = userCredential.user;

      // 🧾 Save profile to SQLite (avatar saved locally)
      let avatarPath = "";
      if (avatar) {
        avatarPath = await saveImageLocally(avatar, `avatar_${user.uid}.jpg`);
      }

      try {
        await userRepository.createUser(
          user.uid,
          normalizedUsername,
          fullName.trim(),
          normalizedEmail,
          phone.trim(),
          avatarPath,
        );
      } catch (dbError) {
        try {
          await user.delete();
        } catch (cleanupError) {
          console.log("Auth cleanup failed after DB error:", cleanupError);
        }
        throw dbError;
      }

      // ❗ Logout หลังสมัครเสร็จ
      await signOut(auth);

      Alert.alert(
        "Success",
        "Account created successfully",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ],
        { cancelable: false },
      );
    } catch (error: any) {
      console.log("REGISTER ERROR:", error);

      let message = "Register failed";
      const errorMessage = String(error?.message ?? "");
      if (error.code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters";
      } else if (
        errorMessage.includes("UNIQUE constraint failed: Users.email")
      ) {
        message = "Email already in use";
      } else if (
        errorMessage.includes("UNIQUE constraint failed: Users.username")
      ) {
        message = "Username already in use";
      }

      Alert.alert("Register Failed", message);
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
          <Text style={styles.title}>REGISTER</Text>

          {/* 🖼 Avatar */}
          <TouchableOpacity style={styles.avatarBox} onPress={pickImage}>
            <Image
              source={{
                uri: avatar || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <Text style={styles.avatarText}>Tap to choose photo</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#5E2206"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#5E2206"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Phone"
            placeholderTextColor="#5E2206"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#5E2206"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#5E2206"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#5E2206"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={["#FD691A", "#FFA160", "#FFD270"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Register"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.link}
          >
            <Text style={styles.linkText}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

/* 🎨 Styles (โครงสร้างเดิม + เพิ่ม avatar) */
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
    fontSize: 36,
    fontFamily: "TiltNeon-Regular",
    color: "#922D24",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderColor: "#922D24",
    width: 170,
    letterSpacing: 2,
  },
  avatarBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  avatarText: {
    marginTop: 8,
    color: "#5E2206",
  },
  input: {
    backgroundColor: "#FD8342",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "white",
  },
  button: {
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Inter-Medium",
  },
  link: {
    marginTop: 18,
    alignItems: "center",
  },
  linkText: {
    color: "#5E2206",
    fontFamily: "Inter-Regular",
  },
});
