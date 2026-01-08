// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import CollectionScreen from "../screens/collection/CollectionScreen";
import HistoryScreen from "../screens/history/HistoryScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ResultScreen from "../screens/result/ResultScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Result" component={ResultScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}