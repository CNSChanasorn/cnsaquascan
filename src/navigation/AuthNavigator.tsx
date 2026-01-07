import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

type Props = {
  setIsLogin: (value: boolean) => void;
};

export default function AuthNavigator({ setIsLogin }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            setIsLogin={setIsLogin}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}