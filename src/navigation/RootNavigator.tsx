import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

export default function RootNavigator() {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLogin(!!user);
    });
    return unsub;
  }, []);

  // 🔑 ถ้ายังไม่ login → Auth
  if (!isLogin) {
    return <AuthNavigator setHasEnteredApp={setIsLogin} />;
  }

  // 🔑 login แล้ว → Navbar (Tab)
  return <MainTabNavigator />;
}
