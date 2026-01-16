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

// 🔥 Firebase
import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );

      const user = userCredential.user;

      // 🧾 Save profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
      });

      // ❗ Logout หลังสมัครเสร็จ
      await signOut(auth);

      // ✅ แจ้ง success + เด้งไป Login
      Alert.alert(
        "Success",
        "Account created successfully",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.log("REGISTER ERROR:", error);

      let message = "Register failed";
      if (error.code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters";
      }

      Alert.alert("Register Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>REGISTER</Text>

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
      </View>
    </GradientBackground>
  );
}

/* 🎨 Styles (ไม่แตะ) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
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