import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function GradientBackground({ children }: any) {
  return (
    <LinearGradient
      colors={["#FF8A3D", "#FFD1B0", "#FFF6EF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});