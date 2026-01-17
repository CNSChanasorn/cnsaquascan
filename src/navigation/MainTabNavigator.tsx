import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

// 🔽 ใช้ Stack ครอบ Collection แทน
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import HistoryScreen from "../screens/history/HistoryScreen";
import ResultScreen from "../screens/result/ResultScreen";
import CollectionStackNavigator from "./CollectionStackNavigator";

const Tab = createBottomTabNavigator();

/* 🔹 Placeholder ชั่วคราว */
function EmptyScreen(title: string) {
  return () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>{title}</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        // 🟠 Navbar style (เหมือนเดิม)
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
        component={EmptyScreen("Home")}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 📦 Data Collection (แก้ตรงนี้อย่างเดียว) */}
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