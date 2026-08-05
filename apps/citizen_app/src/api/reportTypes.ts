import { client } from "./client";
import type { ReportType } from "../types";

export async function fetchReportTypesApi(): Promise<ReportType[]> {
  const res = await client.get<{ data: ReportType[] }>("/report-types");
  return res.data.data ?? [];
}
