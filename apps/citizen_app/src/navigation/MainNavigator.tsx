import { type ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import MyReportsScreen from "../screens/report/MyReportsScreen";
import ConversationsScreen from "../screens/chat/ConversationsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { useAppSelector } from "../store/hooks";
import { selectUnreadCount } from "../store/notificationsSlice";
import { colors } from "../theme";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: {
  name: keyof MainTabParamList;
  component: ComponentType<any>;
  icon: string;
  label: string;
}[] = [
  { name: "HomeTab", component: HomeScreen, icon: "🏠", label: "Home" },
  { name: "ReportsTab", component: MyReportsScreen, icon: "📋", label: "Reports" },
  { name: "ChatTab", component: ConversationsScreen, icon: "💬", label: "Chat" },
  { name: "NotificationsTab", component: NotificationsScreen, icon: "🔔", label: "Alerts" },
  { name: "SettingsTab", component: SettingsScreen, icon: "⚙️", label: "Settings" },
];

export default function MainNavigator() {
  const unread = useAppSelector(selectUnreadCount);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            title: t.label,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconWrap}>
                <Text style={[styles.icon, { opacity: focused ? 1 : 0.55 }]}>{t.icon}</Text>
                {t.name === "NotificationsTab" && unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
                  </View>
                ) : null}
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
});
