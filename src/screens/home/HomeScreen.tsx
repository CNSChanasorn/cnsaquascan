// src/screens/home/HomeScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { screenColors } from "../../theme/screenColors";

export default function HomeScreen() {
  return (
    <LinearGradient colors={screenColors.home} style={styles.container}>
      <View>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Featured Fruits</Text>
      </View>
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
    color: "#fff",
  },
  subtitle: {
    marginTop: 12,
    color: "#fff",
  },
});