import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainNavigator } from "./MainNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { NearbyReportsScreen } from "../screens/reports/NearbyReportsScreen";
import { ReportDetailScreen } from "../screens/reports/ReportDetailScreen";
import { FollowUpScreen } from "../screens/reports/FollowUpScreen";
import { EscalateScreen } from "../screens/reports/EscalateScreen";
import { ChatScreen } from "../screens/chat/ChatScreen";
import { ChangePinScreen } from "../screens/settings/ChangePinScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  signedIn: boolean;
}

export function RootNavigator({ signedIn }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" options={{ animation: "none" }}>
        {() => (signedIn ? <MainNavigator /> : <AuthNavigator />)}
      </Stack.Screen>
      {signedIn ? (
        <>
          <Stack.Screen name="Nearby" component={NearbyReportsScreen} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          <Stack.Screen name="FollowUp" component={FollowUpScreen} />
          <Stack.Screen name="Escalate" component={EscalateScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChangePin" component={ChangePinScreen} />
        </>
      ) : null}
    </Stack.Navigator>
  );
}
