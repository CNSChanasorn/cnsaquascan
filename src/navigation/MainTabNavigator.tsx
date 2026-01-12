import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import CollectionScreen from "../screens/collection/CollectionScreen";

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
        component={EmptyScreen("Home")}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 📦 Data Collection */}
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />

      {/* 📈 Analysis */}
      <Tab.Screen
        name="Analysis"
        component={EmptyScreen("Analysis")}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="analytics" size={24} color={color} />
          ),
        }}
      />

      {/* 🍊 Result */}
      <Tab.Screen
        name="Result"
        component={EmptyScreen("Result")}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assessment" size={24} color={color} />
          ),
        }}
      />

      {/* ⏱️ History */}
      <Tab.Screen
        name="History"
        component={EmptyScreen("History")}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}