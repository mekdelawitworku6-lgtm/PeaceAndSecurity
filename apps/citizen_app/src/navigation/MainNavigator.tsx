import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/home/HomeScreen";
import MapScreen from "../screens/map/MapScreen";
import MyReportsScreen from "../screens/report/MyReportsScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { HomeIcon, MapIcon, ReportsIcon, ProfileIcon } from "../components/Icons";
import { getCurrentLanguage, subscribeLanguageChange, t, type Language } from "../i18n";
import { colors } from "../theme";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguageChange((l) => setLang(l));
  }, []);

  return (
    <View style={styles.container} key={lang}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        {/* Tab 1: Home */}
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            title: t("tabHome"),
            tabBarIcon: ({ focused }) => (
              <HomeIcon size={20} color={focused ? colors.primary : colors.textMuted} />
            ),
          }}
        />

        {/* Tab 2: Map */}
        <Tab.Screen
          name="MapTab"
          component={MapScreen}
          options={{
            title: t("tabMap"),
            tabBarIcon: ({ focused }) => (
              <MapIcon size={20} color={focused ? colors.primary : colors.textMuted} />
            ),
          }}
        />

        {/* Tab 3: Reports */}
        <Tab.Screen
          name="ReportsTab"
          component={MyReportsScreen}
          options={{
            title: t("tabReports"),
            tabBarIcon: ({ focused }) => (
              <ReportsIcon size={20} color={focused ? colors.primary : colors.textMuted} />
            ),
          }}
        />

        {/* Tab 4: Profile */}
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            title: t("quickProfile"),
            tabBarIcon: ({ focused }) => (
              <ProfileIcon size={20} color={focused ? colors.primary : colors.textMuted} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
});
