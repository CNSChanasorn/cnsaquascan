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

  if (!isLogin) {
    return <AuthNavigator setHasEnteredApp={setIsLogin} />;
  }

  return <MainTabNavigator />;
}
