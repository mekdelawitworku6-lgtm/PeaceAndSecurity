import { useCallback, useEffect, useRef, useState } from "react";
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
import MediaThumb from "../../components/MediaThumb";
import EmptyState from "../../components/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectUser } from "../../store/authSlice";
import { createReport, fetchMyReports, selectMyReports, selectReportsLoading } from "../../store/reportsSlice";
import { fetchUnreadCount, selectUnreadCount } from "../../store/notificationsSlice";
import { handleError } from "../../api/client";
import { pickImages, pickLocation } from "../../utils/media";
import { timeAgo } from "../../utils/format";
import { reportTypeLabel } from "../../utils/format";
import type { PickedMedia } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"HomeTab">;

const QUICK_ACTIONS = [
  { key: "report", label: "Report Incident", icon: "🚨", route: "CreateReport" },
  { key: "myreports", label: "My Reports", icon: "📋", route: "ReportsTab" },
  { key: "chat", label: "Chat", icon: "💬", route: "ChatTab" },
  { key: "alerts", label: "Notifications", icon: "🔔", route: "NotificationsTab" },
  { key: "track", label: "Track Case", icon: "📍", route: "TrackCase" },
] as const;

export default function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const reports = useAppSelector(selectMyReports);
  const reportsLoading = useAppSelector(selectReportsLoading);
  const unread = useAppSelector(selectUnreadCount);
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosPhoto, setSosPhoto] = useState<PickedMedia[]>([]);
  const [sosSubmitting, setSosSubmitting] = useState(false);
  const [sosResult, setSosResult] = useState<string | null>(null);
  const [sosReport, setSosReport] = useState<{ id: string; caseId?: string } | null>(null);
  const pressedRef = useRef(false);

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

  const openSos = () => {
    setSosOpen(true);
    setSosPhoto([]);
    setSosResult(null);
    setSosReport(null);
    pressedRef.current = false;
  };

  const addSosPhoto = async () => {
    const picked = await pickImages(3);
    if (picked.length) setSosPhoto((p) => [...p, ...picked].slice(0, 3));
  };

  const submitSos = async () => {
    if (pressedRef.current) return;
    pressedRef.current = true;
    setSosSubmitting(true);
    setSosResult(null);
    try {
      const loc = await pickLocation();
      const anonymous = sosPhoto.length === 0;
      const res = await dispatch(
        createReport({
          violationType: "EMERGENCY",
          reportDescription: "Emergency situation reported via the SOS button.",
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          isEmergency: true,
          isOngoing: true,
          isAnonymous: anonymous,
          images: sosPhoto,
        }),
      );
      if (createReport.fulfilled.match(res)) {
        const report = res.payload;
        setSosReport({ id: report.id, caseId: report.caseId });
        setSosResult(
          `Emergency report sent. Case ${report.caseId ?? ""} has been submitted and patrol response is being coordinated.`,
        );
        await dispatch(fetchMyReports());
      } else {
        setSosResult(res.payload || "Failed to send the emergency report.");
      }
    } catch (e) {
      setSosResult(handleError(e));
    } finally {
      setSosSubmitting(false);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  return (
    <Screen scroll onRefresh={onRefresh} refreshing={refreshing}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Text style={styles.greeting}>Hello{firstName ? `, ${firstName}` : ""} 👋</Text>
            <Text style={styles.heroSub}>Peace &amp; Security · Citizen App</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("NotificationsTab")}
            style={styles.bell}
            hitSlop={8}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unread > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 9 ? "9+" : unread}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Pressable style={styles.sosButton} onPress={openSos} accessibilityRole="button">
          <Text style={styles.sosIcon}>🆘</Text>
          <Text style={styles.sosText}>EMERGENCY SOS</Text>
          <Text style={styles.sosSub}>Send your location for immediate help</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((a) => (
            <Pressable
              key={a.key}
              style={styles.gridItem}
              onPress={() => navigation.navigate(a.route)}
            >
              <Text style={styles.gridIcon}>{a.icon}</Text>
              <Text style={styles.gridLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent reports</Text>
          <Pressable onPress={() => navigation.navigate("ReportsTab")} hitSlop={8}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {reportsLoading && reports.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="🕊️"
              title="No reports yet"
              subtitle="Use “Report Incident” to submit your first report."
              actionLabel="Report Incident"
              onAction={() => navigation.navigate("CreateReport")}
            />
          </Card>
        ) : (
          reports.slice(0, 3).map((r) => (
            <Pressable
              key={r.id}
              onPress={() => navigation.navigate("ReportDetail", { reportId: r.id })}
            >
              <Card style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{reportTypeLabel(r.reportType || r.violationType)}</Text>
                    <Text style={styles.reportMeta}>
                      {r.caseId || "—"} · {timeAgo(r.createdAt)}
                    </Text>
                    <Text style={styles.reportMeta} numberOfLines={1}>
                      {r.address || `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`}
                    </Text>
                  </View>
                  <StatusBadge status={r.status} />
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>

      <Modal
        visible={sosOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSosOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🆘 Emergency SOS</Text>
            <Text style={styles.modalSub}>
              Your current location will be sent immediately with your report.
            </Text>

            {sosPhoto.length > 0 ? (
              <View style={styles.photoRow}>
                {sosPhoto.map((p, i) => (
                  <View key={i}>
                    <MediaThumb uri={p.uri} size={64} />
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => setSosPhoto((arr) => arr.filter((_, j) => j !== i))}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {sosResult ? (
              <Text style={styles.sosResult}>{sosResult}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <AppButton
                title="Add photo (optional)"
                variant="ghost"
                small
                onPress={addSosPhoto}
                disabled={sosSubmitting}
              />
              <View style={styles.modalMain}>
                <AppButton
                  title={sosSubmitting ? "Sending…" : "Send SOS"}
                  variant="danger"
                  onPress={submitSos}
                  loading={sosSubmitting}
                  disabled={!!sosResult && !sosReport}
                />
                {sosReport ? (
                  <AppButton
                    title="View report"
                    small
                    onPress={() => {
                      setSosOpen(false);
                      navigation.navigate("ReportDetail", { reportId: sosReport.id, caseId: sosReport.caseId });
                    }}
                    style={styles.modalSpacing}
                  />
                ) : null}
                <AppButton
                  title="Close"
                  variant="ghost"
                  onPress={() => setSosOpen(false)}
                  disabled={sosSubmitting}
                  style={styles.modalSpacing}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryDark,
    padding: spacing.lg,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  greeting: {
    ...typography.h2,
    color: colors.white,
  },
  heroSub: {
    ...typography.small,
    color: colors.primarySoft,
    marginTop: 2,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  bellIcon: {
    fontSize: 20,
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
  sosButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  sosIcon: {
    fontSize: 28,
  },
  sosText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 2,
  },
  sosSub: {
    color: "#fecaca",
    fontSize: 12,
    marginTop: 4,
  },
  body: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    ...({ borderWidth: 1, borderColor: colors.border } as object),
  },
  gridIcon: {
    fontSize: 26,
  },
  gridLabel: {
    ...typography.small,
    fontWeight: "600",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAll: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyCard: {
    padding: spacing.lg,
  },
  reportCard: {
    marginBottom: spacing.md,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  reportTitle: {
    ...typography.bodyMedium,
  },
  reportMeta: {
    ...typography.caption,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(8,26,77,0.55)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
  },
  modalSub: {
    ...typography.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  photoRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  sosResult: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    padding: spacing.md,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  modalActions: {
    gap: spacing.md,
  },
  modalMain: {
    gap: spacing.md,
  },
  modalSpacing: {
    marginTop: spacing.sm,
  },
});
