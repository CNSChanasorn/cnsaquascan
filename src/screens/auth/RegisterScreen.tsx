import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../components/GradientBackground";

export default function RegisterScreen({ navigation }: any) {
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* 🔥 Tilt Neon */}
        <Text style={styles.title}>REGISTER</Text>

        {/* 🔥 Inter */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#5E2206"
          style={styles.input}
        />
        <TextInput
          placeholder="Username"
          placeholderTextColor="#5E2206"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#5E2206"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#5E2206"
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#5E2206"
          secureTextEntry
          style={styles.input}
        />

        {/* ✅ Gradient Button (เหมือน Login) */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={["#FD691A", "#FFA160", "#FFD270"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Register</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* กลับไป Login */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  /* 🔥 REGISTER → Tilt Neon */
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

  /* 🔥 Inter */
  input: {
    backgroundColor: "#FD8342",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "white",
  },

  /* ✅ Gradient Button */
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