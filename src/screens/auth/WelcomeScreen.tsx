import { View, Text, TouchableOpacity, Image } from "react-native";
import GradientBackground from "../../components/GradientBackground";
import { colors } from "../../theme/colors";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <GradientBackground>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            color: colors.textPrimary,
            fontStyle: "italic",
            marginBottom: 20,
          }}
        >
          Welcome To
        </Text>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: 40,
          }}
        >
          AquaScan
        </Text>

        <Image
          source={require("../../../assets/images/icon.png")}
          style={{ width: 120, height: 120, marginBottom: 40 }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 40,
            paddingVertical: 14,
            borderRadius: 30,
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>→</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}