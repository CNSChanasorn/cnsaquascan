import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import AuthNavigator from "./src/navigation/AuthNavigator";
import MainTabNavigator from "./src/navigation/MainTabNavigator";

import {
  CormorantUnicase_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-unicase";
import { Felipa_400Regular } from "@expo-google-fonts/felipa";
import {
  Inter_400Regular,
  Inter_500Medium,
} from "@expo-google-fonts/inter";
import { TiltNeon_400Regular } from "@expo-google-fonts/tilt-neon";

export default function App() {
  // 🔐 เริ่มต้น = ยังไม่ login
  const [isLogin, setIsLogin] = useState(true);

  const [fontsLoaded] = useFonts({
    "Cormorant-SemiBold": CormorantUnicase_600SemiBold,
    "Felipa-Regular": Felipa_400Regular,
    "TiltNeon-Regular": TiltNeon_400Regular,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLogin ? (
        <MainTabNavigator />   // ✅ login แล้ว → เห็น Navbar
      ) : (
        <AuthNavigator setIsLogin={setIsLogin} /> // 🔐 Welcome / Login / Register
      )}
    </NavigationContainer>
  );
}