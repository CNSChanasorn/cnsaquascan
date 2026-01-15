import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AddCollectionScreen from "../screens/collection/AddCollectionScreen";
import CollectionScreen from "../screens/collection/CollectionScreen";
import EditCollectionScreen from "../screens/collection/EditCollectionScreen";

const Stack = createNativeStackNavigator();

export default function CollectionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionMain" component={CollectionScreen} />
      <Stack.Screen name="AddCollection" component={AddCollectionScreen} />
      <Stack.Screen name="EditCollection" component={EditCollectionScreen} /> 
    </Stack.Navigator>
  );
}