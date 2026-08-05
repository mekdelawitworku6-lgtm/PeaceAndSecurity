import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyOtp: {
    registrationToken: string;
    phoneNumber: string;
    pin: string;
  };
};

export type MainTabParamList = {
  HomeTab: undefined;
  ReportsTab: undefined;
  ChatTab: undefined;
  NotificationsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  ReportDetail: { reportId: string; caseId?: string };
  CreateReport: undefined;
  CreateReportSuccess: { reportId: string; caseId: string; status: string };
  Chat: { conversationId: string; title: string };
  TrackCase: undefined;
  ChangePin: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
