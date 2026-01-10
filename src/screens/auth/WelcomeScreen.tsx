import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GradientBackground from "../../components/GradientBackground";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Felipa */}
        <Text style={styles.subtitle}>Welcome To</Text>

        {/* ✅ Cormorant Unicase */}
        <Text style={styles.title}>AquaScan</Text>

        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#FFB163", "#FF9831", "#FF8000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  subtitle: {
    fontSize: 48,
    fontFamily: "Felipa-Regular",
    color: "#ffffff",
    marginBottom: 8,
  },

  title: {
    fontSize: 52,
    fontFamily: "Cormorant-SemiBold", // 🔥 ใช้จริงแล้ว
    letterSpacing: 2,
    color: "#880B00",
    textAlign: "center",
  },

  image: {
    width: 200,
    height: 200,
    marginVertical: 40,
  },

  button: {
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 40,
  },

  buttonText: {
    color: "white",
    fontSize: 20,
  },
});