import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class AuditService {
  async getAll(params?: { page?: number; limit?: number; entityName?: string; entityId?: string; action?: string; performedByUserId?: string; from?: string; to?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_ALL, { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_BY_ID(id));
    return response.data;
  }

  async getByEntity(entityName: string, params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.GET_BY_ENTITY(entityName), { params });
    return response.data;
  }

  async exportLogs(params: { from?: string; to?: string; entityName?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUDIT_LOGS.EXPORT, { params, responseType: 'blob' });
    return response;
  }
}

export const auditService = new AuditService();
