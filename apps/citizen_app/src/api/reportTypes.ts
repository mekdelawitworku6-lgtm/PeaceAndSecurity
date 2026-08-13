/**
 * Mock report types API — returns fake data, no backend calls.
 */
import { MOCK_REPORT_TYPES } from "./mockData";
import type { ReportType } from "../types";

export async function fetchReportTypesApi(): Promise<ReportType[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...MOCK_REPORT_TYPES];
}
