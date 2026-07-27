import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class ReportTypeService {
  async getAll(params?: { search?: string; isActive?: string; page?: number; limit?: number }) {
    const response = await apiClient.get(API_ENDPOINTS.REPORT_TYPES.GET_ALL, { params });
    return response.data;
  }

  async create(data: any, config?: { skipToast?: boolean }) {
    const response = await apiClient.post(API_ENDPOINTS.REPORT_TYPES.CREATE, data, { skipToast: config?.skipToast } as any);
    return response.data;
  }

  async update(id: string, data: any, config?: { skipToast?: boolean }) {
    const response = await apiClient.patch(API_ENDPOINTS.REPORT_TYPES.UPDATE(id), data, { skipToast: config?.skipToast } as any);
    return response.data;
  }

  async deleteReportType(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.REPORT_TYPES.DELETE(id));
    return response.data;
  }
}

export const reportTypeService = new ReportTypeService();
