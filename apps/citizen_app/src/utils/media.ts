import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { useState, useCallback } from "react";
import { Platform } from "react-native";
import type { LocationGeocodedAddress } from "expo-location";
import type { PickedMedia } from "../types";

export function toPickedMedia(assets: ImagePicker.ImagePickerAsset[]): PickedMedia[] {
  return assets.map((a) => ({
    uri: a.uri,
    name: a.fileName ?? a.uri.split("/").pop() ?? `file-${Date.now()}`,
    type: a.mimeType ?? undefined,
    file: a.file,
  }));
}

export async function pickImages(limit: number): Promise<PickedMedia[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.8,
  });
  if (result.canceled) return [];
  return toPickedMedia(result.assets);
}

export async function pickVideo(): Promise<PickedMedia[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    allowsMultipleSelection: false,
    quality: 0.8,
  });
  if (result.canceled) return [];
  return toPickedMedia(result.assets);
}

export interface RecorderControls {
  supported: boolean;
  recording: boolean;
  seconds: number;
  uri: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
  error: string | null;
}

export function useRecorder(): RecorderControls {
  const supported = Platform.OS !== "web";
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (!supported) return;
    setError(null);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setError("Microphone permission is required to record audio.");
        return;
      }
      if (!recorder.isRecording) {
        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start recording");
    }
  }, [supported, recorder]);

  const stop = useCallback(async () => {
    if (!supported) return;
    try {
      if (recorder.isRecording) await recorder.stop();
      const u = recorder.uri;
      if (u) setUri(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to stop recording");
    }
  }, [supported, recorder]);

  const reset = useCallback(() => {
    setUri(null);
    setError(null);
  }, []);

  return {
    supported,
    recording: supported ? state.isRecording : false,
    seconds: supported ? state.durationMillis / 1000 : 0,
    uri,
    start,
    stop,
    reset,
    error,
  };
}

function formatAddress(geo: LocationGeocodedAddress): string {
  const parts = [geo.name, geo.street, geo.subregion, geo.city, geo.region].filter(
    (p): p is string => !!p,
  );
  return parts.join(", ");
}

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export async function pickLocation(): Promise<PickedLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission is required to submit a report.");
  }
  const pos = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = pos.coords;
  let address = "";
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      address = formatAddress(results[0]);
    }
  } catch {
    address = "";
  }
  return { latitude, longitude, address };
}

export function appendMedia(
  formData: FormData,
  field: string,
  media: PickedMedia[],
  defaultType = "image/jpeg",
): void {
  media.forEach((m, i) => {
    if (Platform.OS === "web") {
      if (m.file) {
        formData.append(field, m.file, m.file.name || m.name || `file-${i}`);
      }
    } else {
      const name = m.name || `file-${Date.now()}-${i}.${(m.type || defaultType).split("/")[1] || "jpg"}`;
      formData.append(field, { uri: m.uri, name, type: m.type || defaultType } as unknown as Blob);
    }
  });
}

export function appendString(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

export function appendBoolean(formData: FormData, key: string, value: boolean): void {
  formData.append(key, value ? "true" : "false");
}

export function getDevicePlatform(): "android" | "ios" | "web" {
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "ios") return "ios";
  return "web";
}

export function getDeviceId(): string {
  const key = "__citizen_device_id__";
  const existing = (globalThis as any)[key] as string | undefined;
  if (existing) return existing;
  const id =
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  (globalThis as any)[key] = id;
  return id;
}
