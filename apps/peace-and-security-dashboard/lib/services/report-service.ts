import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';
import { ServiceResponse } from '../api-types';

class ReportService {
  async getAll(params?: any): Promise<ServiceResponse<any[]>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.GET_ALL, { params });
    return response.data;
  }

  async getNearby(params?: { radiusKm?: number; status?: string }): Promise<ServiceResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.GET_NEARBY, { params });
    return response.data;
  }

  async getMyReports(): Promise<ServiceResponse<any[]>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.MY_REPORTS);
    return response.data;
  }

  async trackReport(caseId: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.TRACK(caseId));
    return response.data;
  }

  async create(formData: FormData): Promise<ServiceResponse<any>> {
    const response = await apiClient.post(API_ENDPOINTS.REPORTS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getById(id: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.GET_BY_ID(id));
    return response.data;
  }

  async getHistory(id: string): Promise<ServiceResponse<any[]>> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.GET_HISTORY(id));
    return response.data;
  }

  async updateReport(id: string, data: any): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.UPDATE(id), data);
    return response.data;
  }

  async deleteReport(id: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.delete(API_ENDPOINTS.REPORTS.DELETE(id));
    return response.data;
  }

  async assignPatrol(reportId: string, patrolId: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.ASSIGN(reportId), { patrolId });
    return response.data;
  }

  async acceptReport(reportId: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.ACCEPT(reportId));
    return response.data;
  }

  async submitFollowUp(reportId: string, formData: FormData): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.FOLLOW_UP(reportId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async closeReport(reportId: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.CLOSE(reportId));
    return response.data;
  }

  async reviewReport(id: string, status: string, rejectionReason?: string): Promise<ServiceResponse<any>> {
    const body: any = { status: status.toUpperCase() };
    if (rejectionReason) body.rejectionReason = rejectionReason;
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.REVIEW(id), body);
    return response.data;
  }

  async escalateReport(id: string, notes: string): Promise<ServiceResponse<any>> {
    const response = await apiClient.patch(API_ENDPOINTS.REPORTS.ESCALATE(id), { notes });
    return response.data;
  }
}

export const reportService = new ReportService();
