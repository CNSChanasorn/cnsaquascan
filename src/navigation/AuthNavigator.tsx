import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";

/* ➕ import หน้า Collection */
import DataCollectionScreen from "../screens/collection/CollectionScreen";

const Stack = createNativeStackNavigator();

type Props = {
  setHasEnteredApp: (value: boolean) => void;
};

export default function AuthNavigator({ setHasEnteredApp }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} setHasEnteredApp={setHasEnteredApp} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* เก็บไว้ได้ ไม่พัง */}
      <Stack.Screen name="Collection" component={DataCollectionScreen} />
    </Stack.Navigator>
  );
}
