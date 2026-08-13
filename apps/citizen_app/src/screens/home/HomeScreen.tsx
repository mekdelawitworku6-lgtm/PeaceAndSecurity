import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import Screen from "../../components/Screen";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import AppButton from "../../components/AppButton";
import EmptyState from "../../components/EmptyState";
import { AlertIcon, BellIcon, MapIcon, ShieldIcon } from "../../components/Icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import { fetchMyReports, selectMyReports, selectReportsLoading } from "../../store/reportsSlice";
import { fetchUnreadCount, selectUnreadCount } from "../../store/notificationsSlice";
import { getCurrentLanguage, setAppLanguage, subscribeLanguageChange, t, type Language } from "../../i18n";
import { timeAgo, reportTypeLabel } from "../../utils/format";
import { colors, radius, spacing, typography } from "../../theme";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"HomeTab">;

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const reports = useAppSelector(selectMyReports);
  const reportsLoading = useAppSelector(selectReportsLoading);
  const unread = useAppSelector(selectUnreadCount);
  const isFocused = useIsFocused();

  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    return subscribeLanguageChange((l) => setLang(l));
  }, []);

  const load = useCallback(async () => {
    await dispatch(fetchMyReports());
    await dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const changeLanguage = async (l: Language) => {
    await setAppLanguage(l);
    setLang(l);
    setLangModalOpen(false);
  };

  return (
    <Screen scroll onRefresh={onRefresh} refreshing={refreshing} key={lang} padding={false}>
      {/* Top Header Card */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerUserWrap}>
            <View style={styles.avatarCircle}>
              <ShieldIcon size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.greetingText}>
                {t("goodMorning")}, {user?.fullName || "AAPSB"}
              </Text>
              <Text style={styles.greetingSub}>{t("addisAbabaCitizens")}</Text>
            </View>
          </View>

          <View style={styles.headerControls}>
            <Pressable
              style={styles.langPill}
              onPress={() => setLangModalOpen(true)}
              hitSlop={8}
            >
              <Text style={styles.langPillText}>{lang.toUpperCase()}</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("NotificationsTab")}
              style={styles.bellBtn}
              hitSlop={8}
            >
              <BellIcon size={18} color={colors.white} />
              {unread > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unread > 9 ? "9+" : unread}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content Container */}
      <View style={styles.content}>
        {/* Action Cards */}
        <View style={styles.actionRow}>
          {/* Card 1: Report Incident */}
          <Pressable
            style={styles.darkActionCard}
            onPress={() => navigation.navigate("CreateReport")}
          >
            <View style={styles.actionIconBadge}>
              <AlertIcon size={18} color={colors.white} />
            </View>
            <Text style={styles.actionTitle}>{t("reportIncident")}</Text>
            <Text style={styles.actionSub}>{t("reportIncidentSub")}</Text>
          </Pressable>

          {/* Card 2: View Incident Map */}
          <Pressable
            style={styles.darkActionCard}
            onPress={() => navigation.navigate("MapTab")}
          >
            <View style={styles.actionIconBadge}>
              <MapIcon size={18} color={colors.white} />
            </View>
            <Text style={styles.actionTitle}>{t("viewIncidentMap")}</Text>
            <Text style={styles.actionSub}>{t("viewIncidentMapSub")}</Text>
          </Pressable>
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("recentReports")}</Text>
          <Pressable onPress={() => navigation.navigate("ReportsTab")} hitSlop={8}>
            <Text style={styles.seeAllText}>{t("seeAll")}</Text>
          </Pressable>
        </View>

        {reportsLoading && reports.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              title={t("noReportsYet")}
              subtitle={t("noReportsSub")}
              actionLabel={t("reportIncident")}
              onAction={() => navigation.navigate("CreateReport")}
            />
          </Card>
        ) : (
          reports.slice(0, 3).map((r) => (
            <Pressable
              key={r.id}
              onPress={() => navigation.navigate("ReportDetail", { reportId: r.id })}
            >
              <Card style={styles.reportItemCard}>
                <View style={styles.reportRow}>
                  <View style={styles.reportMain}>
                    <Text style={styles.reportTypeTitle}>
                      {reportTypeLabel(r.reportType?.name || r.violationType)}
                    </Text>
                    <Text style={styles.reportTimeLocation}>
                      {timeAgo(r.createdAt)} • {r.address || "Meskel Square, Addis Ababa"}
                    </Text>
                  </View>
                  <StatusBadge status={r.status} />
                </View>
              </Card>
            </Pressable>
          ))
        )}

        {/* Impact Stats */}
        <Text style={[styles.sectionTitle, styles.statsHeader]}>{t("impactStats")}</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Text style={styles.statVal}>1,284</Text>
            <Text style={styles.statName}>{t("reportsThisMonth")}</Text>
            <Text style={styles.statBadgeGreen}>{t("vsLastMonth")}</Text>
          </Card>

          <Card style={styles.statBox}>
            <Text style={styles.statVal}>1.8h</Text>
            <Text style={styles.statName}>{t("avgResponseTime")}</Text>
            <Text style={styles.statBadgeBlue}>{t("improvement")}</Text>
          </Card>
        </View>
      </View>

      {/* Language Modal */}
      <Modal
        visible={langModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLangModalOpen(false)}>
          <View style={styles.langModalCard}>
            <Text style={styles.langModalTitle}>{t("selectLanguage")}</Text>

            <Pressable style={styles.langItem} onPress={() => changeLanguage("en")}>
              <Text style={[styles.langItemText, lang === "en" && styles.langItemActive]}>
                English
              </Text>
              {lang === "en" ? <Text style={styles.checkMark}>✓</Text> : null}
            </Pressable>

            <Pressable style={styles.langItem} onPress={() => changeLanguage("am")}>
              <Text style={[styles.langItemText, lang === "am" && styles.langItemActive]}>
                አማርኛ (Amharic)
              </Text>
              {lang === "am" ? <Text style={styles.checkMark}>✓</Text> : null}
            </Pressable>

            <Pressable style={styles.langItem} onPress={() => changeLanguage("om")}>
              <Text style={[styles.langItemText, lang === "om" && styles.langItemActive]}>
                Afaan Oromoo (Oromo)
              </Text>
              {lang === "om" ? <Text style={styles.checkMark}>✓</Text> : null}
            </Pressable>

            <AppButton
              title={t("close")}
              variant="ghost"
              onPress={() => setLangModalOpen(false)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + 10,
    paddingBottom: spacing.xl,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerUserWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
  },
  greetingSub: {
    fontSize: 12,
    color: colors.primarySoft,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.chip,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  langPillText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    padding: spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  darkActionCard: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    padding: spacing.lg,
    minHeight: 125,
    justifyContent: "space-between",
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    color: colors.primarySoft,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: "700",
  },
  seeAllText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyCard: {
    padding: spacing.lg,
  },
  reportItemCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportMain: {
    flex: 1,
    marginRight: spacing.md,
  },
  reportTypeTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: "700",
  },
  reportTimeLocation: {
    ...typography.caption,
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  statsHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statBox: {
    flex: 1,
    padding: spacing.lg,
  },
  statVal: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
  },
  statName: {
    ...typography.smallMedium,
    marginTop: 2,
    fontSize: 12,
    color: colors.textBody,
  },
  statBadgeGreen: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "700",
    marginTop: 6,
  },
  statBadgeBlue: {
    fontSize: 12,
    color: colors.info,
    fontWeight: "700",
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(8,26,77,0.55)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  langModalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  langModalTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  langItemText: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  langItemActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  checkMark: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
});
