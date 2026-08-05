import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors, radius, typography } from "../theme";
import { HomeScreen } from "../screens/home/HomeScreen";
import { AssignedReportsScreen } from "../screens/reports/AssignedReportsScreen";
import { ConversationsScreen } from "../screens/chat/ConversationsScreen";
import { NotificationsScreen } from "../screens/notifications/NotificationsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { useAppSelector } from "../store";
import { selectUnreadCount } from "../store/notificationsSlice";
import { selectConversations } from "../store/chatSlice";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: "⌂",
  Assigned: "◉",
  Inbox: "✉",
  Notifications: "❍",
  Settings: "⚙",
};

function TabIcon({ label, focused }: { label: keyof MainTabParamList; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.icon, { color: focused ? colors.primary : colors.muted }]}>
        {TAB_ICONS[label]}
      </Text>
    </View>
  );
}

export function MainNavigator() {
  const unreadNotifications = useAppSelector(selectUnreadCount);
  const conversations = useAppSelector(selectConversations);
  const unreadChats = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Assigned"
        component={AssignedReportsScreen}
        options={{
          tabBarLabel: "Assigned",
          tabBarIcon: ({ focused }) => <TabIcon label="Assigned" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={ConversationsScreen}
        options={{
          tabBarLabel: "Inbox",
          tabBarIcon: ({ focused }) => <TabIcon label="Inbox" focused={focused} />,
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Notifications" focused={focused} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
  },
  icon: {
    fontSize: 20,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.danger,
    color: colors.white,
    fontSize: 11,
    ...typography.caption,
  },
});
