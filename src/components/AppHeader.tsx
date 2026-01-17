import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function AppHeader() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.profileCircle}
        onPress={() => navigation.navigate("Profile")}
      >
        <MaterialIcons name="person" size={24} color="#FD8342" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});