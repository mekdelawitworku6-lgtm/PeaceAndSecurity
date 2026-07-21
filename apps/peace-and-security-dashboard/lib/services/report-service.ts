import { mockReports } from "../mock-store";
import { ServiceResponse } from "../api-types";

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v !== null ? String(v) : "";
}

class ReportService {
  async getAll(params?: any): Promise<ServiceResponse<any[]>> {
    const result = mockReports.query({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      status: params?.status,
      severity: params?.severity,
    });
    return {
      success: true,
      message: "ok",
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getNearby(params?: { radiusKm?: number; status?: string }): Promise<ServiceResponse<any>> {
    const all = mockReports.getAll();
    let filtered = all;
    if (params?.status) filtered = filtered.filter((r) => r.status === params.status);
    return { success: true, message: "ok", data: filtered.slice(0, 20) };
  }

  async getMyReports(): Promise<ServiceResponse<any[]>> {
    const all = mockReports.getAll();
    return { success: true, message: "ok", data: all.slice(0, 10) };
  }

  async trackReport(caseId: string): Promise<ServiceResponse<any>> {
    const all = mockReports.getAll();
    const report = all.find((r) => r.caseId === caseId);
    if (!report) return { success: false, message: "Report not found" };
    return { success: true, message: "ok", data: report };
  }

  async create(formData: FormData): Promise<ServiceResponse<any>> {
    const now = new Date().toISOString();
    const item = {
      caseId: `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
      reportTypeId: fd(formData, "reportTypeId"),
      violationType: fd(formData, "violationType") || "Others",
      reportDescription: fd(formData, "reportDescription") || fd(formData, "description"),
      address: fd(formData, "address"),
      area: fd(formData, "area"),
      latitude: parseFloat(fd(formData, "latitude")) || 9.0,
      longitude: parseFloat(fd(formData, "longitude")) || 38.7,
      status: "SUBMITTED",
      severity: fd(formData, "severity") || "Medium",
      decibelLevel: parseFloat(fd(formData, "decibelLevel")) || undefined,
      noiseAreaType: fd(formData, "noiseAreaType") || undefined,
      noisePollutionStatus: fd(formData, "noisePollutionStatus") || undefined,
      isAnonymous: fd(formData, "isAnonymous") === "true",
      reporterPhoneNumber: fd(formData, "reporterPhoneNumber"),
      reporter: null,
      assignedPatrol: null,
      createdAt: now,
      updatedAt: now,
      imageUrls: [],
      videoUrls: [],
      audioUrls: [],
      evidenceUrls: [],
      patrolImageUrls: [],
      patrolVideoUrls: [],
      patrolAudioUrls: [],
      patrolEvidenceUrls: [],
    };
    const created = mockReports.create(item);
    return { success: true, message: "Report created", data: created };
  }

  async getById(id: string): Promise<ServiceResponse<any>> {
    const report = mockReports.getById(id);
    if (!report) return { success: false, message: "Report not found" };
    return { success: true, message: "ok", data: report };
  }

  async getHistory(id: string): Promise<ServiceResponse<any[]>> {
    const history = mockReports.getHistory(id);
    return { success: true, message: "ok", data: history };
  }

  async updateReport(id: string, data: any): Promise<ServiceResponse<any>> {
    const updated = mockReports.update(id, { ...data, updatedAt: new Date().toISOString() });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Report updated", data: updated };
  }

  async deleteReport(id: string): Promise<ServiceResponse<any>> {
    mockReports.delete(id);
    return { success: true, message: "Report deleted" };
  }

  async assignPatrol(reportId: string, patrolId: string): Promise<ServiceResponse<any>> {
    const { mockPatrols } = await import("../mock-store");
    const patrol = mockPatrols.getById(patrolId);
    const updated = mockReports.update(reportId, {
      status: "ASSIGNED",
      assignedPatrol: patrol ? { id: patrol.id, fullName: patrol.fullName, assignedArea: patrol.assignedArea } : null,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Patrol assigned", data: updated };
  }

  async acceptReport(reportId: string): Promise<ServiceResponse<any>> {
    const updated = mockReports.update(reportId, { status: "IN_PROGRESS", updatedAt: new Date().toISOString() });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Report accepted", data: updated };
  }

  async submitFollowUp(reportId: string, _formData: FormData): Promise<ServiceResponse<any>> {
    const updated = mockReports.update(reportId, { status: "RESOLVED", updatedAt: new Date().toISOString() });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Follow-up submitted", data: updated };
  }

  async closeReport(reportId: string): Promise<ServiceResponse<any>> {
    const updated = mockReports.update(reportId, { status: "CLOSED", updatedAt: new Date().toISOString() });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Report closed", data: updated };
  }

  async reviewReport(id: string, status: string, rejectionReason?: string): Promise<ServiceResponse<any>> {
    const patch: any = { status: status.toUpperCase(), updatedAt: new Date().toISOString() };
    if (rejectionReason) patch.rejectionReason = rejectionReason;
    const updated = mockReports.update(id, patch);
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Report reviewed", data: updated };
  }

  async escalateReport(id: string, notes: string): Promise<ServiceResponse<any>> {
    const updated = mockReports.update(id, { escalationNotes: notes, updatedAt: new Date().toISOString() });
    if (!updated) return { success: false, message: "Report not found" };
    return { success: true, message: "Report escalated", data: updated };
  }
}

export const reportService = new ReportService();
