import { NavigationContainer } from "@react-navigation/native";
import { useState } from "react";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";

export default function RootNavigator() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <NavigationContainer>
      <AuthNavigator setIsLogin={setIsLogin} />
      {/* ยังไม่ login → เห็น Welcome แน่นอน */}
    </NavigationContainer>
  );
}