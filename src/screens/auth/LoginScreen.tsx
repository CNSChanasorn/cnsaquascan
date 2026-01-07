import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import GradientBackground from "../../components/GradientBackground";
import { colors } from "../../theme/colors";

export default function LoginScreen({ navigation }: any) {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>SIGN IN</Text>

        <TextInput placeholder="Username" style={styles.input} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Create New Account</Text>
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
    color: colors.textPrimary,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderColor: colors.textPrimary,
    width: 100,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
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
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: colors.textSecondary,
  },
});