/**
 * Mock reports API — returns fake data, no backend calls.
 */
import {
  createMockReport,
  MOCK_MY_REPORTS,
  MOCK_NEARBY_REPORTS,
  MOCK_REPORT_HISTORY,
  MOCK_REPORT_TYPES,
} from "./mockData";
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

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  await delay(800);
  return createMockReport(payload);
}

export async function fetchMyReportsApi(): Promise<Report[]> {
  await delay();
  return [...MOCK_MY_REPORTS];
}

export async function fetchReportDetailApi(id: string): Promise<Report> {
  await delay();
  const found = [...MOCK_MY_REPORTS, ...MOCK_NEARBY_REPORTS].find((r) => r.id === id);
  if (found) return found;
  return MOCK_MY_REPORTS[0];
}

export async function fetchReportHistoryApi(_id: string): Promise<ReportLog[]> {
  await delay();
  return [...MOCK_REPORT_HISTORY];
}

export async function trackReportApi(caseId: string): Promise<Report> {
  await delay(600);
  const found = [...MOCK_MY_REPORTS, ...MOCK_NEARBY_REPORTS].find((r) => r.caseId === caseId);
  if (found) return found;
  // Return a plausible default if not found
  return {
    ...MOCK_MY_REPORTS[0],
    caseId,
  };
}

export async function fetchNearbyReportsApi(
  _lat = 9.0107,
  _lng = 38.7612,
  _radiusKm = 25,
): Promise<Report[]> {
  await delay();
  return [...MOCK_NEARBY_REPORTS];
}

export async function fetchReportTypesApi(): Promise<ReportType[]> {
  await delay(200);
  return [...MOCK_REPORT_TYPES];
}
