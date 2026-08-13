import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { useState, useCallback, useRef } from "react";
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
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Native expo-audio fallback
  const nativeRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const nativeState = useAudioRecorderState(nativeRecorder);

  const start = useCallback(async () => {
    setError(null);
    setUri(null);
    setSeconds(0);

    if (Platform.OS === "web") {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setError("Audio recording is not supported in this browser.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const mr = new (window as any).MediaRecorder(stream);
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(blob);
          setUri(audioUrl);
          stream.getTracks().forEach((track) => track.stop());
        };

        mr.start(100);
        setRecording(true);

        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      } catch (e) {
        setError("Microphone access denied or unequipped.");
      }
    } else {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          setError("Microphone permission required.");
          return;
        }
        if (!nativeRecorder.isRecording) {
          await nativeRecorder.prepareToRecordAsync();
          nativeRecorder.record();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to record");
      }
    }
  }, [nativeRecorder]);

  const stop = useCallback(async () => {
    if (Platform.OS === "web") {
      if (mediaRecorderRef.current && recording) {
        mediaRecorderRef.current.stop();
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      try {
        if (nativeRecorder.isRecording) await nativeRecorder.stop();
        if (nativeRecorder.uri) setUri(nativeRecorder.uri);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to stop");
      }
    }
  }, [recording, nativeRecorder]);

  const reset = useCallback(() => {
    setUri(null);
    setSeconds(0);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  return {
    supported: true,
    recording: Platform.OS === "web" ? recording : nativeState.isRecording,
    seconds: Platform.OS === "web" ? seconds : nativeState.durationMillis / 1000,
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
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
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
      return { latitude, longitude, address: address || "Addis Ababa, Ethiopia" };
    }
  } catch {}
  // Default fallback for demo/guest mode
  return { latitude: 9.0107, longitude: 38.7612, address: "Meskel Square, Addis Ababa" };
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
