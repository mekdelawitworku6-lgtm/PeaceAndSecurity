import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import Card from "../../components/Card";
import MediaThumb from "../../components/MediaThumb";
import Loader from "../../components/Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createReport, selectReportsSubmitting } from "../../store/reportsSlice";
import { fetchReportTypesApi } from "../../api/reportTypes";
import { handleError } from "../../api/client";
import { pickImages, pickLocation, pickVideo, useRecorder } from "../../utils/media";
import { t } from "../../i18n";
import type { NoiseAreaType, PickedMedia, ReportType } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"CreateReport">;

const DEFAULT_TYPES = [
  { id: "t1", name: "Robbery / Theft / Crime", labelKey: "typeRobbery" as const, emoji: "🚔" },
  { id: "t2", name: "Illegal Weapons", labelKey: "typeWeapons" as const, emoji: "🔫" },
  { id: "t3", name: "Forgery / Fraud / Illegal Money", labelKey: "typeFraud" as const, emoji: "💸" },
  { id: "t4", name: "Security Threat", labelKey: "typeThreat" as const, emoji: "🛡️" },
  { id: "t5", name: "Street Children / Begging", labelKey: "typeBegging" as const, emoji: "🚸" },
  { id: "t6", name: "Disruptive / Illegal Activity", labelKey: "typeDisruptive" as const, emoji: "⚠️" },
  { id: "t7", name: "Illegal Business / Broker Activity", labelKey: "typeIllegalBusiness" as const, emoji: "🏪" },
  { id: "t8", name: "Event / Holiday Security Screen", labelKey: "typeEventSecurity" as const, emoji: "🎆" },
  { id: "t9", name: "Institution Inspection Request", labelKey: "typeInspection" as const, emoji: "🏢" },
];

export default function CreateReportScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectReportsSubmitting);

  const [types, setTypes] = useState<ReportType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ReportType | typeof DEFAULT_TYPES[0] | null>(null);
  const [description, setDescription] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [severity, setSeverity] = useState<"minor" | "moderate" | "severe">("moderate");
  const [suspectInfo, setSuspectInfo] = useState("");
  const [decibelLevel, setDecibelLevel] = useState("");
  const [noiseAreaType, setNoiseAreaType] = useState<NoiseAreaType | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [images, setImages] = useState<PickedMedia[]>([]);
  const [video, setVideo] = useState<PickedMedia[]>([]);
  const [audioNote, setAudioNote] = useState<PickedMedia | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRecorder();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchReportTypesApi();
        if (mounted && list.length > 0) {
          setTypes(list.filter((t) => t.isActive !== false));
        } else if (mounted) {
          setTypes(DEFAULT_TYPES as any);
        }
      } catch (e) {
        if (mounted) setTypes(DEFAULT_TYPES as any);
      } finally {
        if (mounted) setTypesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const loc = await pickLocation();
      setLocation(loc);
    } catch (e) {
      setError(handleError(e));
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const addImages = async () => {
    const remaining = 4 - images.length;
    if (remaining <= 0) return;
    const picked = await pickImages(remaining);
    if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, 4));
  };

  const addVideo = async () => {
    const picked = await pickVideo();
    if (picked.length) setVideo(picked.slice(0, 1));
  };

  const toggleRecording = async () => {
    if (recorder.recording) {
      await recorder.stop();
      if (recorder.uri) {
        setAudioNote({ uri: recorder.uri, name: "voice_recording.m4a", type: "audio/m4a" });
      }
    } else {
      await recorder.start();
    }
  };

  const validate = (): string | null => {
    if (!selectedType) return t("selectIncidentType");
    if (!description.trim() || description.trim().length < 5) {
      return t("describeWhatHappened");
    }
    if (!location) return "Location is required. Tap 'Change' to update location.";
    return null;
  };

  const submit = async (emergency = false) => {
    const finalEmergency = emergency || isEmergency;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const finalAudio = audioNote
      ? [audioNote]
      : recorder.uri
      ? [{ uri: recorder.uri, name: "recording.m4a", type: "audio/m4a" }]
      : undefined;

    const res = await dispatch(
      createReport({
        violationType: selectedType!.name,
        reportDescription: description.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        address: location!.address,
        isAnonymous,
        isOngoing,
        isEmergency: finalEmergency,
        suspectInfo: suspectInfo.trim() || undefined,
        decibelLevel: decibelLevel ? Number(decibelLevel) : undefined,
        noiseAreaType: noiseAreaType as NoiseAreaType,
        images,
        video,
        audio: finalAudio,
      }),
    );

    if (createReport.fulfilled.match(res)) {
      navigation.replace("CreateReportSuccess", {
        reportId: res.payload.id,
        caseId: res.payload.caseId || "PSB-2026-0564",
        status: res.payload.status || "SUBMITTED",
      });
    } else {
      setError(res.payload || "Failed to submit the report.");
    }
  };

  if (typesLoading) {
    return (
      <Screen>
        <AppHeader title={t("reportSecurityIncident")} />
        <Loader label={t("loading")} />
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard>
      <AppHeader title={t("reportSecurityIncident")} subtitle={t("attachNotice")} />

      <View style={styles.body}>
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        {/* ─── Media Attachments Card (Photos + Video + Audio) ─── */}
        <Card style={styles.uploadCard}>
          <Text style={styles.uploadCardHeader}>{t("attachNotice")}</Text>

          {/* Quick Attachment Controls Row */}
          <View style={styles.mediaButtonsRow}>
            {/* Add Photo Button */}
            <Pressable style={styles.mediaBtn} onPress={addImages}>
              <Text style={styles.mediaBtnIcon}>📷</Text>
              <Text style={styles.mediaBtnLabel}>Photos ({images.length}/4)</Text>
            </Pressable>

            {/* Add Video Button */}
            <Pressable style={styles.mediaBtn} onPress={addVideo}>
              <Text style={styles.mediaBtnIcon}>🎬</Text>
              <Text style={styles.mediaBtnLabel}>{video.length ? "Video Added" : "+ Video"}</Text>
            </Pressable>

            {/* Record Audio Button */}
            <Pressable
              style={[styles.mediaBtn, recorder.recording && styles.mediaBtnRecording]}
              onPress={toggleRecording}
            >
              <Text style={styles.mediaBtnIcon}>
                {recorder.recording ? "⏹️" : "🎙️"}
              </Text>
              <Text style={styles.mediaBtnLabel}>
                {recorder.recording
                  ? `${Math.floor(recorder.seconds)}s`
                  : audioNote || recorder.uri
                  ? "Audio Added"
                  : "+ Voice"}
              </Text>
            </Pressable>
          </View>

          {/* Image & Media Slots Preview */}
          <View style={styles.thumbsRow}>
            {[0, 1, 2, 3].map((slotIndex) => {
              const img = images[slotIndex];
              return (
                <View key={slotIndex} style={styles.slot}>
                  {img ? (
                    <View>
                      <MediaThumb uri={img.uri} size={56} />
                      <Pressable
                        style={styles.removeSlotBtn}
                        onPress={() => setImages((arr) => arr.filter((_, idx) => idx !== slotIndex))}
                      >
                        <Text style={styles.removeSlotText}>×</Text>
                      </Pressable>
                    </View>
                  ) : slotIndex === 0 ? (
                    <Pressable style={styles.addSlot} onPress={addImages}>
                      <Text style={styles.plusIcon}>+</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.emptySlot} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Video Attachment Indicator */}
          {video.length > 0 ? (
            <View style={styles.attachedPill}>
              <Text style={styles.attachedPillIcon}>🎬</Text>
              <Text style={styles.attachedPillText} numberOfLines={1}>
                Video: {video[0].name || "video_clip.mp4"}
              </Text>
              <Pressable onPress={() => setVideo([])} hitSlop={8}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Audio Attachment Indicator */}
          {audioNote || recorder.uri ? (
            <View style={styles.attachedPill}>
              <Text style={styles.attachedPillIcon}>🎙️</Text>
              <Text style={styles.attachedPillText} numberOfLines={1}>
                Voice Recording ({Math.round(recorder.seconds || 5)}s)
              </Text>
              <Pressable
                onPress={() => {
                  setAudioNote(null);
                  recorder.reset();
                }}
                hitSlop={8}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>

        {/* Emergency Mode Toggle */}
        <Pressable
          style={[styles.emergencyToggleRow, isEmergency && styles.emergencyToggleActive]}
          onPress={() => setIsEmergency(!isEmergency)}
        >
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.emergencyLabel, isEmergency && styles.emergencyLabelActive]}>
              🚨 {t("emergencyMode")}
            </Text>
          </View>
          <View style={[styles.switch, isEmergency && styles.switchOn]}>
            <View style={[styles.switchKnob, isEmergency && styles.switchKnobOn]} />
          </View>
        </Pressable>

        {/* Emergency Mode Expanded Panel */}
        {isEmergency ? (
          <View style={styles.emergencyPanel}>
            <View style={styles.cameraArea}>
              <Pressable style={styles.cameraCircle} onPress={addImages}>
                <Text style={styles.cameraIcon}>📷</Text>
              </Pressable>
              <Text style={styles.cameraSub}>Tap to capture photo{"\n"}or hold to record video</Text>
            </View>

            <Text style={styles.severityTitle}>{t("severityLevel")}</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFillGreen, { flex: severity === "minor" ? 1 : severity === "moderate" ? 0.5 : 0.33 }]} />
              <View style={[styles.sliderFillYellow, { flex: severity === "moderate" || severity === "severe" ? (severity === "severe" ? 0.34 : 0.5) : 0 }]} />
              <View style={[styles.sliderFillRed, { flex: severity === "severe" ? 0.33 : 0 }]} />
            </View>
            <View style={styles.severityLabelsRow}>
              <Pressable onPress={() => setSeverity("minor")}>
                <View style={styles.severityLabelWrap}>
                  <View style={[styles.severityDot, { backgroundColor: "#16a34a" }]} />
                  <Text style={[styles.severityLabelText, severity === "minor" && styles.severityLabelActive]}>
                    {t("minor")}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setSeverity("moderate")}>
                <View style={styles.severityLabelWrap}>
                  <View style={[styles.severityDot, { backgroundColor: "#f59e0b" }]} />
                  <Text style={[styles.severityLabelText, severity === "moderate" && styles.severityLabelActive]}>
                    {t("moderate")}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setSeverity("severe")}>
                <View style={styles.severityLabelWrap}>
                  <View style={[styles.severityDot, { backgroundColor: "#dc2626" }]} />
                  <Text style={[styles.severityLabelText, severity === "severe" && styles.severityLabelActive]}>
                    {t("severe")}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.locationPill}>
              <Text style={styles.locationPillIcon}>📍</Text>
              <Text style={styles.locationPillText}>
                {location?.address || "Meskel Square, Ring Road"}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Incident Type Selector */}
        <Text style={styles.sectionTitle}>{t("incidentType")}</Text>
        <Card style={styles.typesCard}>
          {types.map((tItem: any, index) => {
            const isSelected = selectedType?.name === tItem.name;
            const labelStr = tItem.labelKey ? t(tItem.labelKey) : tItem.name;
            return (
              <Pressable
                key={tItem.id || index}
                style={[styles.typeRadioRow, index < types.length - 1 && styles.typeRadioBorder]}
                onPress={() => setSelectedType(tItem)}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={[styles.typeRadioLabel, isSelected && styles.typeRadioLabelSelected]}>
                  {labelStr}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        {/* Description Text Input */}
        <Text style={styles.sectionTitle}>{t("description")}</Text>
        <AppInput
          placeholder={t("describeWhatHappened")}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />

        {/* Current Location Section */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>{t("currentLocation")}</Text>
            <Pressable onPress={fetchLocation} hitSlop={8}>
              <Text style={styles.changeLink}>{t("changeLocation")}</Text>
            </Pressable>
          </View>
          <View style={styles.miniMap}>
            {locationLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <View style={styles.miniMapGrid}>
                  <View style={styles.miniMapRoad1} />
                  <View style={styles.miniMapRoad2} />
                </View>
                <View style={styles.miniMapPin}>
                  <Text style={styles.miniMapPinIcon}>📍</Text>
                </View>
                <Text style={styles.miniMapLabel}>
                  {location?.address || `${location?.latitude?.toFixed(4)}, ${location?.longitude?.toFixed(4)}`}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Report Anonymously Toggle */}
        <View style={styles.anonymousRow}>
          <View style={styles.anonymousText}>
            <Text style={styles.anonymousTitle}>{t("reportAnonymously")}</Text>
            <Text style={styles.anonymousSub}>{t("anonymousSub")}</Text>
          </View>
          <Pressable onPress={() => setIsAnonymous(!isAnonymous)}>
            <View style={[styles.switch, isAnonymous && styles.switchOn]}>
              <View style={[styles.switchKnob, isAnonymous && styles.switchKnobOn]} />
            </View>
          </Pressable>
        </View>

        {/* Submit Buttons */}
        <View style={styles.submitRow}>
          <AppButton
            title={t("submitReport")}
            onPress={() => submit(false)}
            loading={submitting && !isEmergency}
            style={isEmergency ? styles.submitHalf : styles.submitFull}
          />
          {isEmergency ? (
            <AppButton
              title={t("submitEmergencyReport")}
              variant="danger"
              onPress={() => submit(true)}
              loading={submitting && isEmergency}
              style={styles.submitHalf}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radius.input,
    marginBottom: spacing.md,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  uploadCardHeader: {
    ...typography.smallMedium,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  mediaButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mediaBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 4,
    borderRadius: radius.chip,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  mediaBtnRecording: {
    backgroundColor: "#fee2e2",
    borderColor: colors.danger,
  },
  mediaBtnIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  mediaBtnLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  thumbsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    justifyContent: "center",
  },
  slot: {
    width: 56,
    height: 56,
  },
  addSlot: {
    width: 56,
    height: 56,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed" as any,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  emptySlot: {
    width: 56,
    height: 56,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  plusIcon: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "600",
  },
  removeSlotBtn: {
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
  removeSlotText: {
    color: colors.white,
    fontWeight: "700",
  },
  attachedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.md,
  },
  attachedPillIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  attachedPillText: {
    ...typography.smallMedium,
    flex: 1,
    color: colors.primary,
    fontSize: 12,
  },
  removeText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },
  emergencyToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emergencyToggleActive: {
    borderColor: colors.danger,
    backgroundColor: "#fef2f2",
  },
  emergencyLabel: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: colors.textBody,
  },
  emergencyLabelActive: {
    color: colors.danger,
    fontWeight: "700",
  },
  emergencyPanel: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  cameraArea: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  cameraCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: colors.primarySoft,
  },
  cameraIcon: {
    fontSize: 36,
  },
  cameraSub: {
    ...typography.small,
    textAlign: "center",
    color: colors.textMuted,
    lineHeight: 20,
  },
  severityTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sliderTrack: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  sliderFillGreen: {
    backgroundColor: "#16a34a",
  },
  sliderFillYellow: {
    backgroundColor: "#f59e0b",
  },
  sliderFillRed: {
    backgroundColor: "#dc2626",
  },
  severityLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  severityLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabelText: {
    ...typography.small,
    color: colors.textMuted,
  },
  severityLabelActive: {
    fontWeight: "700",
    color: colors.text,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.chip,
    marginTop: spacing.lg,
  },
  locationPillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationPillText: {
    ...typography.smallMedium,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  typesCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  typeRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  typeRadioBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  typeRadioLabel: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  typeRadioLabelSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  locationSection: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  locationTitle: {
    ...typography.bodyMedium,
  },
  changeLink: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  miniMap: {
    height: 130,
    borderRadius: radius.card,
    backgroundColor: "#e8f0e8",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniMapGrid: {
    ...StyleSheet.absoluteFill,
  },
  miniMapRoad1: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#d0d8d0",
  },
  miniMapRoad2: {
    position: "absolute",
    left: "40%",
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "#d0d8d0",
  },
  miniMapPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  miniMapPinIcon: {
    fontSize: 18,
  },
  miniMapLabel: {
    ...typography.caption,
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
    fontSize: 11,
    color: colors.textBody,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.lg,
  },
  anonymousText: {
    flex: 1,
    marginRight: spacing.md,
  },
  anonymousTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
  },
  anonymousSub: {
    ...typography.caption,
    marginTop: 2,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  switch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  switchKnobOn: {
    alignSelf: "flex-end",
  },
  submitRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  submitFull: {
    flex: 1,
  },
  submitHalf: {
    flex: 1,
  },
});
