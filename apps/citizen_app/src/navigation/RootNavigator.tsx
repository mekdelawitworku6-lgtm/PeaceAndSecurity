import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ReportDetailScreen from "../screens/report/ReportDetailScreen";
import CreateReportScreen from "../screens/report/CreateReportScreen";
import CreateReportSuccessScreen from "../screens/report/CreateReportSuccessScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import TrackCaseScreen from "../screens/report/TrackCaseScreen";
import ChangePinScreen from "../screens/settings/ChangePinScreen";
import { useAppSelector } from "../store/hooks";
import { selectAuthStatus } from "../store/authSlice";
import { colors } from "../theme";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootNavigator() {
  const status = useAppSelector(selectAuthStatus);
  const signedIn = status === "signedIn";

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {signedIn ? (
          <>
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
            <Stack.Screen name="CreateReport" component={CreateReportScreen} />
            <Stack.Screen name="CreateReportSuccess" component={CreateReportSuccessScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="TrackCase" component={TrackCaseScreen} />
            <Stack.Screen name="ChangePin" component={ChangePinScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
