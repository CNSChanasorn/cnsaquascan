import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import GradientBackground from "../../components/GradientBackground";
import { colors } from "../../theme/colors";

export default function RegisterScreen({ navigation }: any) {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>REGISTER</Text>

        <TextInput placeholder="Full Name" style={styles.input} />
        <TextInput placeholder="Username" style={styles.input} />
        <TextInput placeholder="Email" style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} />
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
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
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    width: 120,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});