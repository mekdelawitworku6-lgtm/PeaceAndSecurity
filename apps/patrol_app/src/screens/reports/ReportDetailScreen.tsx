import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { MediaThumb } from "../../components/MediaThumb";
import { AudioPlayer } from "../../components/AudioPlayer";
import { EmptyState } from "../../components/EmptyState";
import { Loader } from "../../components/Loader";
import { colors, radius, typography } from "../../theme";
import { assetUrl } from "../../config";
import { formatDate, statusLabel, timeAgo } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  acceptReport,
  closeReport,
  fetchReportDetail,
  fetchReportHistory,
  selectReportDetail,
  selectReportLogs,
  selectReportsError,
  selectSubmitting,
} from "../../store/reportsSlice";
import { openConversationApi } from "../../api/chat";
import { handleError } from "../../api/client";
import type { ReportStatus } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type DetailRoute = RouteProp<RootStackParamList, "ReportDetail">;

const ACCEPTABLE: ReportStatus[] = ["SUBMITTED", "ASSIGNED"];
const CLOSABLE: ReportStatus[] = ["IN_PROGRESS", "RESOLVED", "CLOSED"];

export function ReportDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRoute>();
  const { reportId, caseId } = route.params;
  const dispatch = useAppDispatch();
  const report = useAppSelector(selectReportDetail);
  const logs = useAppSelector(selectReportLogs);
  const submitting = useAppSelector(selectSubmitting);
  const error = useAppSelector(selectReportsError);
  const [preview, setPreview] = useState<string | null>(null);
  const [chatting, setChatting] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchReportDetail(reportId));
    dispatch(fetchReportHistory(reportId));
  }, [dispatch, reportId]);

  useFocusEffect(load);

  const title = report?.caseId ?? caseId ?? "Report";

  const confirmAccept = () => {
    Alert.alert(
      "Accept Report",
      `Accept case ${title}? You will be responsible for inspecting it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            dispatch(acceptReport(reportId)).then((res: unknown) => {
              const a = res as { meta?: { requestStatus?: string } };
              if (a.meta?.requestStatus === "fulfilled") {
                Alert.alert("Accepted", `Case ${title} accepted.`);
              }
            });
          },
        },
      ],
    );
  };

  const confirmClose = () => {
    Alert.alert("Close Report", `Close case ${title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Close",
        style: "destructive",
        onPress: () => {
          dispatch(closeReport(reportId)).then((res: unknown) => {
            const a = res as { meta?: { requestStatus?: string } };
            if (a.meta?.requestStatus === "fulfilled") {
              Alert.alert("Closed", `Case ${title} closed.`);
            }
          });
        },
      },
    ]);
  };

  const openChat = async () => {
    setChatting(true);
    try {
      const conv = await openConversationApi(reportId);
      navigation.navigate("Chat", { conversationId: conv.id, title: title });
    } catch (e) {
      Alert.alert("Chat unavailable", handleError(e));
    } finally {
      setChatting(false);
    }
  };

  if (!report) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <AppHeader title={title} />
        <Loader text="Loading report…" />
      </SafeAreaView>
    );
  }

  const images = report.imageUrls?.map(assetUrl).filter(Boolean) ?? [];
  const videos = report.videoUrls?.map(assetUrl).filter(Boolean) ?? [];
  const audios = report.audioUrls?.map(assetUrl).filter(Boolean) ?? [];
  const patrolImages = report.patrolImageUrls?.map(assetUrl).filter(Boolean) ?? [];
  const patrolVideos = report.patrolVideoUrls?.map(assetUrl).filter(Boolean) ?? [];
  const patrolAudios = report.patrolAudioUrls?.map(assetUrl).filter(Boolean) ?? [];

  const reporterName = report.reporter?.fullName ?? report.reporterPhoneNumber ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <AppHeader title={title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <View style={styles.titleRow}>
            <Text style={styles.caseId}>{report.caseId ?? "—"}</Text>
            <StatusBadge status={report.status} />
          </View>
          <Text style={styles.violationType}>
            {(report.reportType?.name ?? report.violationType ?? "Report").replace(/_/g, " ")}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Created {timeAgo(report.createdAt)}</Text>
            {report.assignedAt ? (
              <Text style={styles.meta}>Assigned {formatDate(report.assignedAt)}</Text>
            ) : null}
          </View>
          {report.isEmergency ? (
            <View style={styles.emergency}>
              <Text style={styles.emergencyText}>Emergency</Text>
            </View>
          ) : null}
        </Card>

        {report.isAnonymous ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Reporter</Text>
            <Text style={styles.body}>Anonymous report</Text>
          </Card>
        ) : (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Reporter</Text>
            <Text style={styles.body}>{reporterName ?? "Unknown reporter"}</Text>
            {report.reporter?.phoneNumber ? (
              <Text style={styles.meta}>{report.reporter.phoneNumber}</Text>
            ) : null}
          </Card>
        )}

        {report.reportDescription ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.body}>{report.reportDescription}</Text>
          </Card>
        ) : null}

        {report.latitude != null && report.longitude != null ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            {report.address ? <Text style={styles.body}>{report.address}</Text> : null}
            {report.area ? <Text style={styles.meta}>{report.area}</Text> : null}
            <Text style={styles.meta}>
              {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
            </Text>
            {report.distanceKm != null ? (
              <Text style={styles.meta}>{report.distanceKm.toFixed(1)} km away</Text>
            ) : null}
          </Card>
        ) : null}

        {renderInfo(report.suspectInfo, "Suspect")}
        {renderInfo(report.victimInfo, "Victim")}
        {renderInfo(report.witnessInfo, "Witness")}

        {report.patrolNotes ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Patrol notes</Text>
            <Text style={styles.body}>{report.patrolNotes}</Text>
          </Card>
        ) : null}

        {images.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence — Photos</Text>
            <View style={styles.grid}>
              {images.map((uri, i) => (
                <MediaThumb key={`img-${i}`} uri={uri} kind="image" onPress={() => setPreview(uri)} />
              ))}
            </View>
          </Card>
        ) : null}

        {videos.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence — Videos</Text>
            <View style={styles.grid}>
              {videos.map((uri, i) => (
                <MediaThumb key={`vid-${i}`} uri={uri} kind="video" onPress={() => Linking.openURL(uri)} />
              ))}
            </View>
          </Card>
        ) : null}

        {audios.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence — Audio</Text>
            {audios.map((uri, i) => (
              <View key={`aud-${i}`} style={styles.audioItem}>
                <AudioPlayer uri={uri} />
              </View>
            ))}
          </Card>
        ) : null}

        {patrolImages.length > 0 || patrolVideos.length > 0 || patrolAudios.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Patrol evidence</Text>
            {patrolImages.length > 0 ? (
              <View style={styles.grid}>
                {patrolImages.map((uri, i) => (
                  <MediaThumb key={`pimg-${i}`} uri={uri} kind="image" onPress={() => setPreview(uri)} />
                ))}
              </View>
            ) : null}
            {patrolVideos.length > 0 ? (
              <View style={styles.grid}>
                {patrolVideos.map((uri, i) => (
                  <MediaThumb key={`pvid-${i}`} uri={uri} kind="video" onPress={() => Linking.openURL(uri)} />
                ))}
              </View>
            ) : null}
            {patrolAudios.length > 0
              ? patrolAudios.map((uri, i) => (
                  <View key={`paud-${i}`} style={styles.audioItem}>
                    <AudioPlayer uri={uri} />
                  </View>
                ))
              : null}
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>Timeline</Text>
        {logs.length === 0 ? (
          <Card style={styles.section}>
            <Text style={styles.meta}>No timeline events yet.</Text>
          </Card>
        ) : (
          logs.map((log, i) => (
            <View key={log.id ?? i} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {i < logs.length - 1 ? <View style={styles.timelineLine} /> : null}
              <View style={styles.timelineBody}>
                <View style={styles.timelineTop}>
                  <Text style={styles.timelineStatus}>{statusLabel(log.status ?? "Event")}</Text>
                  <Text style={styles.meta}>{timeAgo(log.createdAt)}</Text>
                </View>
                {log.note ? <Text style={styles.body}>{log.note}</Text> : null}
              </View>
            </View>
          ))
        )}

        <View style={styles.actions}>
          {ACCEPTABLE.includes(report.status) ? (
            <AppButton title="Accept Report" onPress={confirmAccept} loading={submitting} style={styles.actionBtn} />
          ) : null}
          {!["CLOSED", "REJECTED"].includes(report.status) ? (
            <>
              <AppButton
                title="Follow Up"
                onPress={() => navigation.navigate("FollowUp", { reportId, caseId: report.caseId })}
                style={styles.actionBtn}
              />
              <AppButton
                title="Escalate"
                variant="outline"
                onPress={() => navigation.navigate("Escalate", { reportId, caseId: report.caseId })}
                style={styles.actionBtn}
              />
            </>
          ) : null}
          {CLOSABLE.includes(report.status) ? (
            <AppButton
              title="Close Report"
              variant="danger"
              onPress={confirmClose}
              loading={submitting}
              style={styles.actionBtn}
            />
          ) : null}
          <AppButton
            title="Chat about this report"
            variant="ghost"
            onPress={openChat}
            loading={chatting}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View style={styles.modalBackdrop}>
          {preview ? (
            <Pressable style={styles.modalClose} onPress={() => setPreview(null)} hitSlop={12}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          ) : null}
          {preview ? (
            <ImagePreview uri={preview} />
          ) : (
            <EmptyState title="No image" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function renderInfo(value: string | null | undefined, label: string) {
  if (!value) return null;
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </Card>
  );
}

function ImagePreview({ uri }: { uri: string }) {
  return <Image source={{ uri }} style={styles.previewImage} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  error: {
    backgroundColor: colors.danger + "1a",
    color: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caseId: {
    ...typography.label,
    color: colors.primary,
  },
  violationType: {
    ...typography.heading,
    marginTop: 8,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  meta: {
    ...typography.small,
  },
  emergency: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.danger + "1a",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  emergencyText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    ...typography.heading,
    marginTop: 16,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  audioItem: {
    marginBottom: 8,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 18,
    bottom: -14,
    width: 2,
    backgroundColor: colors.primarySoft,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineStatus: {
    ...typography.label,
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  actionBtn: {
    width: "100%",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});
