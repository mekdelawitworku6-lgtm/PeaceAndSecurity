import { client } from "./client";
import { APP_VERSION } from "../config";
import {
  appendBoolean,
  appendMedia,
  appendString,
  getDeviceId,
  getDevicePlatform,
} from "../utils/media";
import type {
  NoiseAreaType,
  PickedMedia,
  Report,
  ReportLog,
  ReportType,
} from "../types";

export interface CreateReportPayload {
  violationType: string;
  reportDescription: string;
  latitude: number;
  longitude: number;
  address?: string;
  isAnonymous?: boolean;
  incidentDateTime?: string;
  isOngoing?: boolean;
  isEmergency?: boolean;
  suspectInfo?: string;
  victimInfo?: string;
  witnessInfo?: string;
  decibelLevel?: number;
  noiseAreaType?: NoiseAreaType;
  images?: PickedMedia[];
  video?: PickedMedia[];
  audio?: PickedMedia[];
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const fd = new FormData();
  appendString(fd, "violationType", payload.violationType);
  appendString(fd, "reportType", payload.violationType);
  appendString(fd, "reportDescription", payload.reportDescription);
  appendString(fd, "latitude", payload.latitude);
  appendString(fd, "longitude", payload.longitude);
  appendString(fd, "address", payload.address);
  appendBoolean(fd, "isAnonymous", !!payload.isAnonymous);
  appendBoolean(fd, "isOngoing", !!payload.isOngoing);
  appendBoolean(fd, "isEmergency", !!payload.isEmergency);
  appendString(fd, "incidentDateTime", payload.incidentDateTime);
  appendString(fd, "suspectInfo", payload.suspectInfo);
  appendString(fd, "victimInfo", payload.victimInfo);
  appendString(fd, "witnessInfo", payload.witnessInfo);
  appendString(fd, "decibelLevel", payload.decibelLevel);
  appendString(fd, "noiseAreaType", payload.noiseAreaType);
  appendString(fd, "deviceId", getDeviceId());
  appendString(fd, "devicePlatform", getDevicePlatform());
  appendString(fd, "appVersion", APP_VERSION);
  appendMedia(fd, "images", payload.images ?? [], "image/jpeg");
  appendMedia(fd, "video", payload.video ?? [], "video/mp4");
  appendMedia(fd, "audio", payload.audio ?? [], "audio/m4a");

  const res = await client.post<{ data: Report }>("/reports", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function fetchMyReportsApi(): Promise<Report[]> {
  const res = await client.get<{ data: Report[] }>("/reports/my-reports");
  return res.data.data ?? [];
}

export async function fetchReportDetailApi(id: string): Promise<Report> {
  const res = await client.get<{ data: Report }>(`/reports/${id}`);
  return res.data.data;
}

export async function fetchReportHistoryApi(id: string): Promise<ReportLog[]> {
  const res = await client.get<{ data: ReportLog[] }>(`/reports/${id}/history`);
  return res.data.data ?? [];
}

export async function trackReportApi(caseId: string): Promise<Report> {
  const res = await client.get<{ data: Report }>(`/reports/track/${caseId}`);
  return res.data.data;
}

export async function fetchReportTypesApi(): Promise<ReportType[]> {
  const res = await client.get<{ data: ReportType[] }>("/report-types");
  return res.data.data ?? [];
}
