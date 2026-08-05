import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import MediaThumb from "../../components/MediaThumb";
import AudioPlayer from "../../components/AudioPlayer";
import Loader from "../../components/Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchReportDetail,
  fetchReportHistory,
  resetDetail,
  selectReportDetail,
  selectReportHistory,
} from "../../store/reportsSlice";
import { openConversationApi } from "../../api/chat";
import { handleError } from "../../api/client";
import { assetUrl } from "../../config";
import { formatDateTime, reportTypeLabel, statusLabel } from "../../utils/format";
import { colors, radius, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"ReportDetail">;

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ReportDetailScreen({ navigation, route }: Props) {
  const { reportId } = route.params;
  const dispatch = useAppDispatch();
  const report = useAppSelector(selectReportDetail);
  const history = useAppSelector(selectReportHistory);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    dispatch(fetchReportDetail(reportId));
    dispatch(fetchReportHistory(reportId));
    return () => {
      dispatch(resetDetail());
    };
  }, [dispatch, reportId]);

  const openChat = useCallback(async () => {
    setChatting(true);
    setChatError(null);
    try {
      const conv = await openConversationApi(reportId);
      navigation.navigate("Chat", {
        conversationId: conv.id,
        title: `${report?.caseId || "Report"} · ${reportTypeLabel(report?.reportType || report?.violationType)}`,
      });
    } catch (e) {
      setChatError(handleError(e));
    } finally {
      setChatting(false);
    }
  }, [dispatch, navigation, reportId, report]);

  if (!report) {
    return (
      <Screen>
        <AppHeader title="Report Detail" />
        <Loader label="Loading report…" />
      </Screen>
    );
  }

  const images = report.imageUrls ?? [];
  const videos = report.videoUrls ?? [];
  const audios = report.audioUrls ?? [];

  return (
    <Screen keyboard={false}>
      <AppHeader
        title={report.caseId || "Report Detail"}
        subtitle={reportTypeLabel(report.reportType || report.violationType)}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.statusRow}>
          <StatusBadge status={report.status} />
          {report.isEmergency ? <Text style={styles.emergencyTag}>🚨 EMERGENCY</Text> : null}
        </View>

        {images.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Photos</Text>
            <View style={styles.gallery}>
              {images.map((url, i) => (
                <MediaThumb key={i} uri={url} size={96} onPress={() => setFullImage(url)} />
              ))}
            </View>
          </Card>
        ) : null}

        {videos.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Videos</Text>
            <View style={styles.gallery}>
              {videos.map((url, i) => (
                <MediaThumb
                  key={i}
                  uri={url}
                  type="video"
                  size={96}
                  onPress={() => Linking.openURL(assetUrl(url))}
                />
              ))}
            </View>
          </Card>
        ) : null}

        {audios.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Audio evidence</Text>
            <View style={styles.audioList}>
              {audios.map((url, i) => (
                <AudioPlayer key={i} url={url} title={`Recording ${i + 1}`} />
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <Row label="Type" value={reportTypeLabel(report.reportType || report.violationType)} />
          <Row label="Address" value={report.address} />
          <Row label="Area" value={report.area} />
          <Row label="Incident" value={formatDateTime(report.incidentDateTime)} />
          <Row label="Reported" value={formatDateTime(report.createdAt)} />
          <Row label="Anonymous" value={report.isAnonymous ? "Yes" : "No"} />
          {report.decibelLevel != null ? (
            <Row label="Noise level" value={`${report.decibelLevel} dB (${report.noiseAreaType ?? "—"})`} />
          ) : null}
          <View style={styles.flagRow}>
            {report.isOngoing ? <Text style={styles.flag}>Ongoing</Text> : null}
            {report.isAnonymous ? <Text style={styles.flag}>Anonymous</Text> : null}
            {report.isEmergency ? <Text style={styles.flagDanger}>Emergency</Text> : null}
          </View>
        </Card>

        {report.reportDescription ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.description}>{report.reportDescription}</Text>
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>People involved</Text>
          <Row label="Suspect" value={report.suspectInfo} />
          <Row label="Victim" value={report.victimInfo} />
          <Row label="Witness" value={report.witnessInfo} />
          {!report.suspectInfo && !report.victimInfo && !report.witnessInfo ? (
            <Text style={styles.muted}>No additional details provided.</Text>
          ) : null}
        </Card>

        {report.assignedPatrol ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Assigned patrol</Text>
            <View style={styles.patrolRow}>
              {report.assignedPatrol.profileImage ? (
                <Image
                  source={{ uri: assetUrl(report.assignedPatrol.profileImage) }}
                  style={styles.patrolAvatar}
                />
              ) : (
                <View style={styles.patrolAvatar}>
                  <Text style={styles.patrolInitials}>
                    {(report.assignedPatrol.fullName || "P").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.patrolInfo}>
                <Text style={styles.patrolName}>{report.assignedPatrol.fullName || "Patrol officer"}</Text>
                {report.assignedPatrol.phoneNumber ? (
                  <Text style={styles.patrolPhone}>{report.assignedPatrol.phoneNumber}</Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : null}

        {history.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Timeline</Text>
            {history.map((log, i) => (
              <View key={log.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, i === 0 && styles.timelineDotFirst]} />
                {i < history.length - 1 ? <View style={styles.timelineLine} /> : null}
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineTitle}>{statusLabel(log.status)}</Text>
                  {log.note ? <Text style={styles.timelineNote}>{log.note}</Text> : null}
                  <Text style={styles.timelineDate}>{formatDateTime(log.createdAt)}</Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {chatError ? <Text style={styles.errorBanner}>{chatError}</Text> : null}
        <AppButton
          title="💬 Chat about this report"
          onPress={openChat}
          loading={chatting}
          style={styles.chatBtn}
        />
      </ScrollView>

      <Modal
        visible={!!fullImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullImage(null)}
      >
        <Pressable style={styles.fullscreen} onPress={() => setFullImage(null)}>
          {fullImage ? (
            <Image
              source={{ uri: assetUrl(fullImage) }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : null}
          <Pressable style={styles.closeBtn} onPress={() => setFullImage(null)} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  emergencyTag: {
    color: colors.danger,
    fontWeight: "800",
    fontSize: 13,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.md,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  audioList: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  rowValue: {
    ...typography.smallMedium,
    flex: 1,
    textAlign: "right",
  },
  flagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  flag: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    overflow: "hidden",
  },
  flagDanger: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
    overflow: "hidden",
  },
  description: {
    ...typography.body,
  },
  muted: {
    ...typography.small,
    color: colors.textMuted,
  },
  patrolRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  patrolAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  patrolInitials: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  patrolInfo: {
    flex: 1,
  },
  patrolName: {
    ...typography.bodyMedium,
  },
  patrolPhone: {
    ...typography.small,
    color: colors.primary,
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginTop: 5,
    marginRight: spacing.md,
  },
  timelineDotFirst: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    position: "absolute",
    left: 4.5,
    top: 18,
    bottom: -4,
    width: 1,
    backgroundColor: colors.border,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineTitle: {
    ...typography.bodyMedium,
  },
  timelineNote: {
    ...typography.small,
    marginTop: 2,
  },
  timelineDate: {
    ...typography.caption,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radius.input,
    marginBottom: spacing.lg,
    fontSize: 14,
    fontWeight: "600",
  },
  chatBtn: {
    marginBottom: spacing.lg,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  closeBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
