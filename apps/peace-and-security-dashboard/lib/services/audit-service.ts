import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class AuditService {
  async getAll(params?: { page?: number; limit?: number; entity?: string; entityId?: string; action?: string; performedByUserId?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_ALL, { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_BY_ID(id));
    return response.data;
  }

  async getByEntity(entityName: string, entityId: string) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_BY_ENTITY(entityName, entityId));
    return response.data;
  }

  async exportCsv(params: { entity?: string; action?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.EXPORT_CSV, { params, responseType: 'blob' });
    return response;
  }

  async exportPdf(params: { entity?: string; action?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.EXPORT_PDF, { params });
    return response;
  }
}

export const auditService = new AuditService();
