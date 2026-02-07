import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // ✅ เพิ่มอันนี้
// import { Text, View } from "react-native";

// 🔽 Import Screens
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import HistoryScreen from "../screens/history/HistoryScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ResultScreen from "../screens/result/ResultScreen";
import CollectionStackNavigator from "./CollectionStackNavigator";

// 1️⃣ สร้างตัวแปร Navigator
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// /* 🔹 Placeholder ชั่วคราว */
// function EmptyScreen(title: string) {
//   return () => (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text style={{ fontSize: 20 }}>{title}</Text>
//     </View>
//   );
// }

// 2️⃣ สร้าง Component สำหรับ "ปุ่มเมนูด้านล่าง" (แยกออกมาไว้ข้างนอก)
function BottomTabGroup() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // 🟠 Navbar style
        tabBarStyle: {
          height: 60,
          backgroundColor: "#FD8342",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFE6D5",
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 6,
        },
      }}
    >
      {/* 🏠 Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 📦 Data Collection */}
      <Tab.Screen
        name="Collection"
        component={CollectionStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />

      {/* 📈 Analysis */}
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="analytics" size={24} color={color} />
          ),
        }}
      />

      {/* 🍊 Result */}
      <Tab.Screen
        name="Result"
        component={ResultScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assessment" size={24} color={color} />
          ),
        }}
      />

      {/* ⏱️ History */}
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 3️⃣ Export หลัก: คือ Stack ที่รวม Tab + Profile
// (ใช้ชื่อ MainTabNavigator เหมือนเดิม เพื่อให้ App.tsx ไม่ error)
export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* หน้าหลักคือ Tab Bar (BottomTabGroup) */}
      <Stack.Screen name="MainTabs" component={BottomTabGroup} />

      {/* หน้า Profile (เมื่อกดเข้ามา Tab Bar จะหายไปเอง) */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
