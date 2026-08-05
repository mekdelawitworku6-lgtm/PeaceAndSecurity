import { client } from "./client";
import { buildFollowUpFormData, type FollowUpFormPayload } from "../utils/media";
import type {
  NearbyReportsResponse,
  PickedMedia,
  Report,
  ReportLog,
} from "../types";

export async function fetchAssignedReportsApi(): Promise<Report[]> {
  const res = await client.get<{ data: Report[] }>("/reports/assigned-to-me");
  return res.data.data ?? [];
}

export async function fetchNearbyReportsApi(radiusKm: number): Promise<NearbyReportsResponse> {
  const res = await client.get<{ data: NearbyReportsResponse }>("/reports/nearby", {
    params: { radiusKm },
  });
  return res.data.data;
}

export async function fetchReportDetailApi(id: string): Promise<Report> {
  const res = await client.get<{ data: Report }>(`/reports/${id}`);
  return res.data.data;
}

export async function fetchReportHistoryApi(id: string): Promise<ReportLog[]> {
  const res = await client.get<{ data: ReportLog[] }>(`/reports/${id}/history`);
  return res.data.data ?? [];
}

export async function acceptReportApi(id: string): Promise<Report> {
  const res = await client.patch<{ data: Report }>(`/reports/${id}/accept`);
  return res.data.data;
}

export async function closeReportApi(id: string): Promise<Report> {
  const res = await client.patch<{ data: Report }>(`/reports/${id}/close`);
  return res.data.data;
}

export async function escalateReportApi(id: string, notes: string): Promise<Report> {
  const res = await client.patch<{ data: Report }>(`/reports/${id}/escalate`, { notes });
  return res.data.data;
}

export async function submitFollowUpApi(
  id: string,
  payload: FollowUpFormPayload,
): Promise<Report> {
  const fd = buildFollowUpFormData(payload);
  const res = await client.patch<{ data: Report }>(`/reports/${id}/follow-up`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export type { PickedMedia };
