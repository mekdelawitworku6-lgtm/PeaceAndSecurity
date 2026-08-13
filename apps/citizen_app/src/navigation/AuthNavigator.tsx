import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/auth/SplashScreen";
import OnboardingScreen from "../screens/auth/OnboardingScreen";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import VerifyOtpScreen from "../screens/auth/VerifyOtpScreen";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
}
