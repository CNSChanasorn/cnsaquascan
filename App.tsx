import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import AuthNavigator from "./src/navigation/AuthNavigator";
import MainTabNavigator from "./src/navigation/MainTabNavigator";

import {
  CormorantUnicase_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-unicase";
import { Felipa_400Regular } from "@expo-google-fonts/felipa";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { TiltNeon_400Regular } from "@expo-google-fonts/tilt-neon";

// 🔥 Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/firebase";
import { useDatabaseReady } from "./src/firebase/useDatabase";

export default function App() {
  // 🔐 สถานะ login จาก Firebase
  const [isLogin, setIsLogin] = useState(false);

  // ✅ คุมการเข้าแอป (สำคัญ)
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const { ready: dbReady, error: dbError } = useDatabaseReady();

  // 🔤 โหลดฟอนต์
  const [fontsLoaded] = useFonts({
    "Cormorant-SemiBold": CormorantUnicase_600SemiBold,
    "Felipa-Regular": Felipa_400Regular,
    "TiltNeon-Regular": TiltNeon_400Regular,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
  });

  // ✅ ฟัง auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLogin(!!user);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  // ⏳ รอ font + auth
  if (!fontsLoaded || checkingAuth || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (dbError) {
    console.error("Database init error:", dbError);
  }

  return (
    <NavigationContainer>
      {isLogin && hasEnteredApp ? (
        // ✅ ต้อง login + กดเข้าแอปแล้วเท่านั้น
        <MainTabNavigator />
      ) : (
        // 🔐 เปิดแอป = Welcome เสมอ
        <AuthNavigator setHasEnteredApp={setHasEnteredApp} />
      )}
    </NavigationContainer>
  );
}
