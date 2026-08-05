import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { KeyboardSafeScreen } from "../../components/KeyboardSafeScreen";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { Card } from "../../components/Card";
import { MediaThumb } from "../../components/MediaThumb";
import { colors, radius, typography } from "../../theme";
import {
  pickImages,
  pickLocation,
  useRecorder,
  type PickedLocation,
} from "../../utils/media";
import { formatDuration } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store";
import { followUpReport, selectReportsError, selectSubmitting } from "../../store/reportsSlice";
import type { PickedMedia } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type FollowUpRoute = RouteProp<RootStackParamList, "FollowUp">;

const MAX_PHOTOS = 5;

export function FollowUpScreen() {
  const navigation = useNavigation();
  const route = useRoute<FollowUpRoute>();
  const { reportId, caseId } = route.params;
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectSubmitting);
  const error = useAppSelector(selectReportsError);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [photos, setPhotos] = useState<PickedMedia[]>([]);
  const recorder = useRecorder();

  const fetchLocation = useCallback(async (silent = false) => {
    if (!silent) setLocLoading(true);
    try {
      const loc = await pickLocation();
      setLocation(loc);
    } catch (e) {
      if (!silent) {
        Alert.alert(
          "Location unavailable",
          e instanceof Error ? e.message : "Could not fetch your location.",
        );
      }
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation(true);
  }, [fetchLocation]);

  const addPhotos = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const picked = await pickImages(remaining);
    if (picked.length > 0) setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStopRecording = async () => {
    await recorder.stop();
  };

  const audioMedia: PickedMedia | null = recorder.uri
    ? { uri: recorder.uri, name: `recording-${Date.now()}.m4a`, type: "audio/m4a" }
    : null;

  const canSubmit = notes.trim().length > 0 && !!location;

  const submit = async () => {
    if (!location) {
      Alert.alert("Location required", "Please allow location access to submit follow-up.");
      return;
    }
    const evidence = [...photos];
    if (audioMedia) evidence.push(audioMedia);
    const res = await dispatch(
      followUpReport({
        id: reportId,
        payload: {
          notes: notes.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
          evidence,
        },
      }),
    );
    const r = res as { meta?: { requestStatus?: string } };
    if (r.meta?.requestStatus === "fulfilled") {
      Alert.alert("Follow-up submitted", `Case ${caseId ?? reportId} updated.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <KeyboardSafeScreen>
      <AppHeader title="Follow Up" />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.section}>
        <Text style={styles.label}>Inspection notes *</Text>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe what you found at the location…"
          multiline
          maxLength={1000}
        />
        <Text style={styles.hint}>GPS verification requires you to be within 50 m of the report.</Text>
      </Card>

      <Card style={styles.section}>
        <View style={styles.locTop}>
          <Text style={styles.label}>Location</Text>
          <Pressable onPress={() => fetchLocation()} hitSlop={8}>
            <Text style={styles.link}>{locLoading ? "Locating…" : "Refresh"}</Text>
          </Pressable>
        </View>
        {location ? (
          <>
            <Text style={styles.body}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            {location.address ? <Text style={styles.meta}>{location.address}</Text> : null}
          </>
        ) : (
          <Text style={styles.meta}>Fetching your current location…</Text>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.label}>Evidence</Text>
        <View style={styles.thumbs}>
          {photos.map((p, i) => (
            <View key={`${p.uri}-${i}`} style={styles.thumbWrap}>
              <MediaThumb uri={p.uri} kind="image" size={80} />
              <Pressable style={styles.remove} onPress={() => removePhoto(i)} hitSlop={8}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <AppButton
          title={`Add Photos (${photos.length}/${MAX_PHOTOS})`}
          variant="outline"
          onPress={addPhotos}
          disabled={photos.length >= MAX_PHOTOS}
          style={styles.smallBtn}
        />
        {recorder.supported ? (
          <View style={styles.recorder}>
            {!recorder.recording && !recorder.uri ? (
              <AppButton
                title="Record Audio"
                variant="ghost"
                onPress={recorder.start}
                style={styles.smallBtn}
              />
            ) : null}
            {recorder.recording ? (
              <View style={styles.recordingRow}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>Recording {formatDuration(recorder.seconds)}</Text>
                <AppButton title="Stop" variant="danger" onPress={handleStopRecording} style={styles.stopBtn} />
              </View>
            ) : null}
            {recorder.uri && !recorder.recording ? (
              <View style={styles.recordingRow}>
                <Text style={styles.recText}>Audio recorded ({formatDuration(recorder.seconds)})</Text>
                <Pressable
                  onPress={() => {
                    recorder.reset();
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.link}>Remove</Text>
                </Pressable>
              </View>
            ) : null}
            {recorder.error ? <Text style={styles.error}>{recorder.error}</Text> : null}
          </View>
        ) : (
          <Text style={styles.hint}>Audio recording is available in the mobile app only.</Text>
        )}
      </Card>

      <AppButton
        title="Submit Follow-up"
        onPress={submit}
        loading={submitting}
        disabled={!canSubmit}
        style={styles.submit}
      />
      {Platform.OS === "web" ? <View style={styles.webSpacer} /> : null}
    </KeyboardSafeScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },
  label: {
    ...typography.label,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
  },
  meta: {
    ...typography.small,
    marginTop: 4,
  },
  hint: {
    ...typography.small,
    marginTop: 6,
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
  locTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  thumbs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  thumbWrap: {
    position: "relative",
  },
  remove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  smallBtn: {
    height: 44,
    marginBottom: 10,
  },
  recorder: {
    marginTop: 4,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    marginRight: 8,
  },
  recText: {
    ...typography.body,
    flex: 1,
  },
  stopBtn: {
    height: 40,
    paddingHorizontal: 16,
  },
  submit: {
    marginTop: 4,
  },
  webSpacer: {
    height: 60,
  },
});
