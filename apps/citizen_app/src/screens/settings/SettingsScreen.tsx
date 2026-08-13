import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import AppButton from "../../components/AppButton";
import { AlertIcon, BellIcon, CheckIcon, ProfileIcon, ShieldIcon } from "../../components/Icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout, selectUser } from "../../store/authSlice";
import { fetchMyReports, selectMyReports } from "../../store/reportsSlice";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllRead,
  markRead,
  selectNotifications,
  selectUnreadCount,
} from "../../store/notificationsSlice";
import { getCurrentLanguage, setAppLanguage, subscribeLanguageChange, t, type Language } from "../../i18n";
import { timeAgo } from "../../utils/format";
import { colors, radius, spacing, typography } from "../../theme";
import type { Report } from "../../types";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"SettingsTab">;

type ProfileTabKey = "reports" | "preferences" | "notifications";

const MOCK_PROFILE_REPORTS: Report[] = [
  {
    id: "r1",
    caseId: "PSB-2026-0584",
    violationType: "Robbery / Theft",
    reportType: { id: "t1", name: "Robbery / Theft" },
    reportDescription: "Suspicious robbery attempt near Meskel Square.",
    latitude: 9.0107,
    longitude: 38.7612,
    address: "Meskel Square, Addis Ababa",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    caseId: "PSB-2026-0571",
    violationType: "Illegal Weapons",
    reportType: { id: "t2", name: "Illegal Weapons" },
    reportDescription: "Illegal weapons observed in Bole area.",
    latitude: 8.9892,
    longitude: 38.7865,
    address: "Bole Sub-City, Block 4",
    status: "UNDER_REVIEW",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    caseId: "PSB-2026-0550",
    violationType: "Street Begging Concern",
    reportType: { id: "t5", name: "Street Begging Concern" },
    reportDescription: "Street begging group near commercial center.",
    latitude: 9.0125,
    longitude: 38.745,
    address: "Churchill Ave, CBD",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const myReports = useAppSelector(selectMyReports);
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("reports");
  const [lang, setLang] = useState<Language>(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguageChange((l) => setLang(l));
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchMyReports()),
      dispatch(fetchNotifications()),
      dispatch(fetchUnreadCount()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused, loadData]);

  const reportsList = myReports.length > 0 ? myReports : MOCK_PROFILE_REPORTS;
  const activeCount = reportsList.filter((r) => r.status === "IN_PROGRESS" || r.status === "UNDER_REVIEW" || r.status === "ASSIGNED" || r.status === "SUBMITTED").length;
  const resolvedCount = reportsList.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length;

  const changeLang = async (l: Language) => {
    await setAppLanguage(l);
    setLang(l);
  };

  const confirmLogout = () => {
    Alert.alert(t("logout"), "Are you sure you want to log out?", [
      { text: t("cancel"), style: "cancel" },
      { text: t("logout"), style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <Screen keyboard={false} padding={false} key={lang}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <ProfileIcon size={22} color={colors.white} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullName || "Tigist Haile"}</Text>
              <Text style={styles.userSub}>
                • Local Community • Bole Sub-City
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.bellBtn}
            onPress={() => setActiveTab("notifications")}
            hitSlop={8}
          >
            <BellIcon size={18} color={colors.primary} />
            {unreadCount > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        {/* Sub Tabs */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabBtn, activeTab === "reports" && styles.tabBtnActive]}
            onPress={() => setActiveTab("reports")}
          >
            <Text style={[styles.tabBtnText, activeTab === "reports" && styles.tabBtnTextActive]}>
              {t("tabReports")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "preferences" && styles.tabBtnActive]}
            onPress={() => setActiveTab("preferences")}
          >
            <Text style={[styles.tabBtnText, activeTab === "preferences" && styles.tabBtnTextActive]}>
              {t("settings")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "notifications" && styles.tabBtnActive]}
            onPress={() => setActiveTab("notifications")}
          >
            <Text style={[styles.tabBtnText, activeTab === "notifications" && styles.tabBtnTextActive]}>
              {t("notifications")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "reports" ? (
          <View>
            <View style={styles.reportsHeader}>
              <Text style={styles.reportsTitle}>YOUR REPORTS</Text>
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>All Time ▾</Text>
              </View>
            </View>

            {reportsList.map((r, idx) => {
              const isWarning = (r.violationType || "").includes("Robbery") || (r.violationType || "").includes("Crime");
              const isLock = (r.violationType || "").includes("Weapons") || (r.violationType || "").includes("Illegal");
              const bgCircle = isWarning ? "#fee2e2" : isLock ? "#fef3c7" : "#dcfce7";

              return (
                <Pressable
                  key={r.id || idx}
                  onPress={() => navigation.navigate("ReportDetail", { reportId: r.id, caseId: r.caseId })}
                >
                  <Card style={styles.reportCard}>
                    <View style={styles.cardRow}>
                      <View style={[styles.typeIconCircle, { backgroundColor: bgCircle }]}>
                        {isWarning ? (
                          <AlertIcon size={20} color="#dc2626" />
                        ) : isLock ? (
                          <ShieldIcon size={20} color="#d97706" />
                        ) : (
                          <ProfileIcon size={20} color="#16a34a" />
                        )}
                      </View>

                      <View style={styles.cardMainInfo}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardReportTitle}>{r.reportType?.name || r.violationType}</Text>
                          <StatusBadge status={r.status} />
                        </View>
                        <Text style={styles.cardMetaText}>⏱ {timeAgo(r.createdAt)}</Text>
                        <Text style={styles.cardMetaText} numberOfLines={1}>
                          📍 {r.address || "Addis Ababa, Ethiopia"}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}

            {/* Dark Blue Summary Banner */}
            <View style={styles.summaryBanner}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryNum}>{reportsList.length}</Text>
                <Text style={styles.summaryLabel}>Total Reports</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryCol}>
                <Text style={styles.summaryNum}>{activeCount}</Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryCol}>
                <Text style={styles.summaryNum}>{resolvedCount}</Text>
                <Text style={styles.summaryLabel}>Resolved</Text>
              </View>
            </View>
          </View>
        ) : null}

        {activeTab === "preferences" ? (
          <View style={styles.prefSection}>
            <Text style={styles.sectionTitle}>{t("selectLanguage")}</Text>
            <Card style={styles.prefCard}>
              <Pressable style={styles.prefRow} onPress={() => changeLang("en")}>
                <Text style={styles.prefText}>English</Text>
                {lang === "en" ? <CheckIcon size={18} color={colors.primary} /> : null}
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.prefRow} onPress={() => changeLang("am")}>
                <Text style={styles.prefText}>አማርኛ (Amharic)</Text>
                {lang === "am" ? <CheckIcon size={18} color={colors.primary} /> : null}
              </Pressable>
              <View style={styles.divider} />
              <Pressable style={styles.prefRow} onPress={() => changeLang("om")}>
                <Text style={styles.prefText}>Afaan Oromoo (Oromo)</Text>
                {lang === "om" ? <CheckIcon size={18} color={colors.primary} /> : null}
              </Pressable>
            </Card>

            <Text style={styles.sectionTitle}>{t("account")}</Text>
            <Card style={styles.prefCard}>
              <Pressable
                style={styles.prefRow}
                onPress={() => navigation.navigate("ChangePin")}
              >
                <Text style={styles.prefText}>{t("changePin")}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={styles.prefRow}
                onPress={() => navigation.navigate("TrackCase")}
              >
                <Text style={styles.prefText}>{t("trackCase")}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Card>

            <AppButton
              title={t("logout")}
              variant="danger"
              onPress={confirmLogout}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : null}

        {activeTab === "notifications" ? (
          <View>
            <View style={styles.notificationsTop}>
              <Text style={styles.reportsTitle}>{t("notifications").toUpperCase()}</Text>
              <Pressable onPress={() => dispatch(markAllRead())} hitSlop={8}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </Pressable>
            </View>

            {notifications.length === 0 ? (
              <Card style={{ padding: spacing.xl, alignItems: "center" }}>
                <Text style={typography.bodyMedium}>No notifications</Text>
              </Card>
            ) : (
              notifications.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => {
                    if (!n.isRead) dispatch(markRead(n.id));
                    if (n.data?.reportId) {
                      navigation.navigate("ReportDetail", { reportId: n.data.reportId, caseId: n.data.caseId });
                    }
                  }}
                >
                  <Card style={[styles.notifCard, !n.isRead && styles.notifUnread]}>
                    <View style={styles.notifRow}>
                      <BellIcon size={18} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifTitle, !n.isRead && styles.notifTitleUnread]}>
                          {n.title}
                        </Text>
                        <Text style={styles.notifMsg}>{n.message}</Text>
                        <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.xxl + 4,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    fontSize: 18,
  },
  userSub: {
    ...typography.caption,
    marginTop: 2,
    fontSize: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  tabBtn: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  reportsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  reportsTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 1,
  },
  filterPill: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  reportCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardMainInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardReportTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
  },
  cardMetaText: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 1,
  },
  summaryBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  summaryCol: {
    alignItems: "center",
  },
  summaryNum: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.primarySoft,
    marginTop: 2,
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  prefSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  prefCard: {
    padding: 0,
    overflow: "hidden",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  prefText: {
    ...typography.bodyMedium,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  notificationsTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  markAllText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  notifCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  notifUnread: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  notifTitle: {
    ...typography.bodyMedium,
  },
  notifTitleUnread: {
    color: colors.primary,
  },
  notifMsg: {
    ...typography.small,
    marginTop: 2,
  },
  notifTime: {
    ...typography.caption,
    marginTop: 4,
  },
});
