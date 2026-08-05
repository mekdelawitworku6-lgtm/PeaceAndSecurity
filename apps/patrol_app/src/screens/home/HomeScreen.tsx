import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback } from "react";
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { colors, radius, typography, shadows } from "../../theme";
import { timeAgo } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectUser, logout } from "../../store/authSlice";
import {
  fetchAssignedReports,
  fetchNearbyReports,
  selectAssignedReports,
  selectNearbyReports,
} from "../../store/reportsSlice";
import { selectUnreadCount } from "../../store/notificationsSlice";
import type { MainTabParamList, RootStackParamList } from "../../navigation/types";
import type { Report } from "../../types";

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const reports = useAppSelector(selectAssignedReports);
  const nearby = useAppSelector(selectNearbyReports);
  const unreadCount = useAppSelector(selectUnreadCount);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAssignedReports());
      dispatch(fetchNearbyReports(10));
    }, [dispatch]),
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.fullName?.split(" ")[0] ?? "Officer";

  const stats = [
    {
      label: "Assigned",
      value: reports.filter((r) => r.status === "ASSIGNED").length,
      color: colors.accent,
    },
    {
      label: "In Progress",
      value: reports.filter((r) => r.status === "IN_PROGRESS").length,
      color: "#8b5cf6",
    },
    {
      label: "Resolved",
      value: reports.filter(
        (r) => r.status === "RESOLVED" || r.status === "CLOSED",
      ).length,
      color: colors.success,
    },
    {
      label: "Nearby",
      value: nearby.length,
      color: colors.info,
    },
  ];

  const recent = reports.slice(0, 3);

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.area}>{user?.assignedArea ?? user?.officeAddress ?? "Patrol Officer"}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Notifications")}
          style={styles.bell}
          hitSlop={8}
        >
          <Text style={styles.bellIcon}>❍</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsRow}>
        <QuickAction
          icon="▤"
          label="Assigned"
          onPress={() => navigation.navigate("Assigned")}
        />
        <QuickAction
          icon="◎"
          label="Nearby"
          onPress={() => navigation.navigate("Nearby")}
        />
        <QuickAction
          icon="✉"
          label="Chat"
          onPress={() => navigation.navigate("Inbox")}
        />
        <QuickAction icon="⏻" label="Logout" onPress={confirmLogout} danger />
      </View>

      <Text style={styles.sectionTitle}>Recent assigned reports</Text>
      {recent.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No assigned reports yet.</Text>
        </Card>
      ) : (
        recent.map((r) => (
          <RecentRow key={r.id} report={r} onPress={() => openDetail(navigation, r)} />
        ))
      )}
    </Screen>
  );
}

function openDetail(
  navigation: HomeNav,
  report: Report,
) {
  navigation.navigate("ReportDetail", { reportId: report.id, caseId: report.caseId });
}

function QuickAction({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const tint = danger ? colors.danger : colors.primary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Text style={[styles.actionIcon, { color: tint }]}>{icon}</Text>
      <Text style={[styles.actionLabel, { color: danger ? colors.danger : colors.heading }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function RecentRow({ report, onPress }: { report: Report; onPress: () => void }) {
  const violationType = report.reportType?.name ?? report.violationType ?? "Report";
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.recent, pressed && styles.pressed]}>
      <View style={styles.recentTop}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {violationType.replace(/_/g, " ")}
        </Text>
        <StatusBadge status={report.status} />
      </View>
      <Text style={styles.recentMeta} numberOfLines={1}>
        {report.caseId ?? "—"} · {timeAgo(report.createdAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.muted,
  },
  name: {
    ...typography.display,
    fontSize: 26,
  },
  area: {
    ...typography.small,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  bellIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    ...shadows.card,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    ...typography.small,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.heading,
    marginTop: 18,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  action: {
    width: "23.5%",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    ...shadows.card,
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: "700",
  },
  actionLabel: {
    ...typography.label,
    fontSize: 12,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
  },
  recent: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  recentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentTitle: {
    ...typography.subtitle,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  recentMeta: {
    ...typography.small,
    marginTop: 4,
  },
});
