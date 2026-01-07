import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function GradientBackground({ children }: any) {
  return (
    <LinearGradient
      colors={["#FFD3B6", "#FF8A3D"]}
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