import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Assigned: undefined;
  Inbox: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Nearby: undefined;
  ReportDetail: { reportId: string; caseId?: string };
  FollowUp: { reportId: string; caseId?: string };
  Escalate: { reportId: string; caseId?: string };
  Chat: { conversationId: string; title?: string };
  ChangePin: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
