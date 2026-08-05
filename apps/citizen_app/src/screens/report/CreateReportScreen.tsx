import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
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
import type { NoiseAreaType, PickedMedia, ReportType } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";
import type { RootScreenProps } from "../../navigation/types";

type Props = RootScreenProps<"CreateReport">;

const TYPE_EMOJI: Record<string, string> = {
  NOISE: "🔊",
  LITTERING: "🚮",
  VANDALISM: "🏚️",
  AIR_POLLUTION: "🌫️",
  WATER_POLLUTION: "🌊",
  SOIL_CONTAMINATION: "🧪",
  ILLEGAL_DUMPING: "🚜",
  DEFORESTATION: "🌲",
  HAZARDOUS_WASTE: "☢️",
  WILDLIFE_POACHING: "🦏",
  OTHERS: "📢",
};

const TYPE_ICON = (name: string) => TYPE_EMOJI[name.toUpperCase()] || name.charAt(0).toUpperCase();

export default function CreateReportScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectReportsSubmitting);

  const [types, setTypes] = useState<ReportType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [isOngoing, setIsOngoing] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [suspectInfo, setSuspectInfo] = useState("");
  const [victimInfo, setVictimInfo] = useState("");
  const [witnessInfo, setWitnessInfo] = useState("");
  const [decibelLevel, setDecibelLevel] = useState("");
  const [noiseAreaType, setNoiseAreaType] = useState<NoiseAreaType | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [images, setImages] = useState<PickedMedia[]>([]);
  const [video, setVideo] = useState<PickedMedia[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRecorder();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchReportTypesApi();
        if (mounted) setTypes(list.filter((t) => t.isActive !== false));
      } catch (e) {
        if (mounted) setError(handleError(e));
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
    setLocationError(null);
    try {
      const loc = await pickLocation();
      setLocation(loc);
    } catch (e) {
      setLocationError(handleError(e));
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const isNoise = !!selectedType && /noise|sound/i.test(selectedType.name);

  const addImages = async () => {
    const remaining = 5 - images.length;
    if (remaining <= 0) return;
    const picked = await pickImages(remaining);
    if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, 5));
  };

  const addVideo = async () => {
    const picked = await pickVideo();
    if (picked.length) setVideo(picked.slice(0, 1));
  };

  const thresholdFor = (area: NoiseAreaType): number => {
    if (isNoise && selectedType) {
      if (area === "RESIDENTIAL" && selectedType.residentialDecibelThreshold != null) {
        return selectedType.residentialDecibelThreshold;
      }
      if (area === "COMMERCIAL" && selectedType.commercialDecibelThreshold != null) {
        return selectedType.commercialDecibelThreshold;
      }
    }
    return area === "RESIDENTIAL" ? 45 : 55;
  };

  const validate = (): string | null => {
    if (!selectedType) return "Please select a report type.";
    if (!description.trim() || description.trim().length < 5) {
      return "Please describe the incident (at least 5 characters).";
    }
    if (!location) return "Location is required. Tap “Use my location”.";
    if (isNoise) {
      if (!noiseAreaType) return "Noise reports require an area type (Residential / Commercial).";
      const level = Number(decibelLevel);
      const threshold = thresholdFor(noiseAreaType);
      if (isNaN(level) || level < threshold) {
        return `Decibel level must be at least ${threshold} dB for a ${noiseAreaType.toLowerCase()} area.`;
      }
    }
    const hasMedia = images.length > 0 || video.length > 0;
    if (!isAnonymous && !hasMedia && !isNoise) {
      return "At least one photo or video is required for this report (or submit anonymously).";
    }
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    let incidentDateTime: string | undefined;
    if (dateStr.trim()) {
      const time = timeStr.trim() || "00:00";
      const iso = new Date(`${dateStr.trim()}T${time}`);
      if (!isNaN(iso.getTime())) incidentDateTime = iso.toISOString();
    }

    const res = await dispatch(
      createReport({
        violationType: selectedType!.name,
        reportDescription: description.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        address: location!.address,
        isAnonymous,
        incidentDateTime,
        isOngoing,
        isEmergency,
        suspectInfo: suspectInfo.trim() || undefined,
        victimInfo: victimInfo.trim() || undefined,
        witnessInfo: witnessInfo.trim() || undefined,
        decibelLevel: isNoise ? Number(decibelLevel) : undefined,
        noiseAreaType: isNoise ? (noiseAreaType as NoiseAreaType) : undefined,
        images,
        video,
        audio: recorder.uri ? [{ uri: recorder.uri, name: "recording.m4a", type: "audio/m4a" }] : undefined,
      }),
    );
    if (createReport.fulfilled.match(res)) {
      navigation.replace("CreateReportSuccess", {
        reportId: res.payload.id,
        caseId: res.payload.caseId || "",
        status: res.payload.status,
      });
    } else {
      setError(res.payload || "Failed to submit the report.");
    }
  };

  if (typesLoading) {
    return (
      <Screen>
        <AppHeader title="Report Incident" />
        <Loader label="Loading report types…" />
      </Screen>
    );
  }

  const toggle = (value: boolean, onChange: (v: boolean) => void, label: string, sub: string) => (
    <Pressable style={styles.toggleRow} onPress={() => onChange(!value)}>
      <View style={styles.toggleTexts}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <View style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
      </View>
    </Pressable>
  );

  return (
    <Screen scroll keyboard>
      <AppHeader title="Report Incident" />
      <View style={styles.body}>
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>What happened?</Text>
        <View style={styles.typeGrid}>
          {types.map((t) => {
            const active = selectedType?.id === t.id;
            return (
              <Pressable
                key={t.id}
                style={[styles.typeItem, active && styles.typeItemActive]}
                onPress={() => {
                  setSelectedType(t);
                  setError(null);
                }}
              >
                <Text style={styles.typeIcon}>{TYPE_ICON(t.name)}</Text>
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]} numberOfLines={1}>
                  {t.name.replace(/_/g, " ")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AppInput
          label="Description *"
          placeholder="Describe what happened… (1-500 characters)"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Incident date &amp; time</Text>
          <View style={styles.row2}>
            <AppInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={dateStr}
              onChangeText={setDateStr}
              containerStyle={styles.col}
            />
            <AppInput
              label="Time"
              placeholder="HH:MM"
              value={timeStr}
              onChangeText={setTimeStr}
              containerStyle={styles.col}
            />
          </View>
          {toggle(isOngoing, setIsOngoing, "Still ongoing", "The incident is currently happening")}
          {toggle(isEmergency, setIsEmergency, "Emergency", "Immediate response required")}
        </Card>

        {isNoise ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Noise level</Text>
            <Text style={styles.note}>
              Minimum required: {thresholdFor("RESIDENTIAL")} dB (residential) · {thresholdFor("COMMERCIAL")} dB
              (commercial)
            </Text>
            <AppInput
              label="Measured decibel level"
              placeholder="e.g. 65"
              value={decibelLevel}
              onChangeText={setDecibelLevel}
              keyboardType="number-pad"
            />
            <Text style={styles.toggleLabel}>Area type</Text>
            <View style={styles.row2}>
              {(["RESIDENTIAL", "COMMERCIAL"] as NoiseAreaType[]).map((a) => {
                const active = noiseAreaType === a;
                return (
                  <Pressable
                    key={a}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => setNoiseAreaType(a)}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {a.charAt(0) + a.slice(1).toLowerCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ) : null}

        <Pressable onPress={() => setShowMore((s) => !s)} style={styles.moreBtn}>
          <Text style={styles.moreText}>More details {showMore ? "▴" : "▾"}</Text>
        </Pressable>
        {showMore ? (
          <Card style={styles.card}>
            <AppInput
              label="Suspect information"
              placeholder="Description of any suspects…"
              value={suspectInfo}
              onChangeText={setSuspectInfo}
              multiline
              maxLength={1000}
            />
            <AppInput
              label="Victim information"
              placeholder="Description of any victims…"
              value={victimInfo}
              onChangeText={setVictimInfo}
              multiline
              maxLength={1000}
            />
            <AppInput
              label="Witness information"
              placeholder="Description of any witnesses…"
              value={witnessInfo}
              onChangeText={setWitnessInfo}
              multiline
              maxLength={1000}
            />
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          {location ? (
            <>
              <Text style={styles.locAddress}>{location.address || "No address resolved"}</Text>
              <Text style={styles.locCoords}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </>
          ) : locationLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.locLoading} />
          ) : locationError ? (
            <Text style={styles.note}>{locationError}</Text>
          ) : null}
          <AppButton
            title="Use my location"
            variant="outline"
            small
            onPress={fetchLocation}
            loading={locationLoading}
            disabled={!!location}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Evidence</Text>
          <Text style={styles.note}>
            At least one photo or video is required unless you submit anonymously.
          </Text>

          <View style={styles.evidenceActions}>
            <AppButton title={`Add Photos (${images.length}/5)`} variant="ghost" small onPress={addImages} disabled={images.length >= 5} />
            <AppButton title={video.length ? "Replace Video" : "Add Video"} variant="ghost" small onPress={addVideo} />
          </View>

          {images.length > 0 ? (
            <View style={styles.mediaRow}>
              {images.map((img, i) => (
                <View key={i}>
                  <MediaThumb uri={img.uri} size={72} />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {video.length > 0 ? (
            <View style={styles.mediaRow}>
              <View>
                <MediaThumb uri={video[0].uri} type="video" size={96} />
                <Pressable style={styles.removeBtn} onPress={() => setVideo([])}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.audioRow}>
            {recorder.supported ? (
              <>
                {recorder.uri ? (
                  <>
                    <MediaThumb uri={recorder.uri} type="audio" size={56} />
                    <Pressable style={styles.removeBtn} onPress={recorder.reset}>
                      <Text style={styles.removeText}>×</Text>
                    </Pressable>
                    <AppButton title="Re-record" variant="ghost" small onPress={recorder.start} />
                  </>
                ) : (
                  <AppButton
                    title={recorder.recording ? `Recording… ${Math.round(recorder.seconds)}s` : "Record Audio"}
                    variant="outline"
                    small
                    onPress={recorder.recording ? recorder.stop : recorder.start}
                    loading={recorder.recording}
                  />
                )}
                {recorder.error ? <Text style={styles.note}>{recorder.error}</Text> : null}
              </>
            ) : (
              <Text style={styles.note}>Audio recording is available in the mobile app.</Text>
            )}
          </View>
        </Card>

        {toggle(isAnonymous, setIsAnonymous, "Report anonymously", "Your identity will be hidden")}

        <AppButton title="Submit Report" onPress={submit} loading={submitting} style={styles.submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  typeItem: {
    width: "31%",
    marginRight: "2%",
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  typeItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeLabel: {
    ...typography.small,
    fontWeight: "600",
    marginTop: spacing.xs,
    textAlign: "center",
  },
  typeLabelActive: {
    color: colors.primary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.md,
  },
  note: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: spacing.md,
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
  row2: {
    flexDirection: "row",
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  toggleTexts: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    ...typography.bodyMedium,
  },
  toggleSub: {
    ...typography.caption,
    marginTop: 1,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: "center",
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  switchKnobOn: {
    alignSelf: "flex-end",
  },
  segBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  segBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  segText: {
    ...typography.bodyMedium,
  },
  segTextActive: {
    color: colors.primary,
  },
  moreBtn: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  moreText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  locAddress: {
    ...typography.body,
  },
  locCoords: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  locLoading: {
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  evidenceActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mediaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
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
  submit: {
    marginTop: spacing.md,
  },
});
