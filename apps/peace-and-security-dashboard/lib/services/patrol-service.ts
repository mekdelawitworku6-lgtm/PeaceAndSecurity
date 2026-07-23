import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class PatrolService {
  async getAllPatrols(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.PATROLS.GET_ALL, { params });
    return response.data;
  }

  async registerPatrol(formData: FormData) {
    const response = await apiClient.post(API_ENDPOINTS.PATROLS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updatePatrol(id: string, formData: FormData) {
    const body: any = {};
    formData.forEach((v, k) => {
      body[k] = String(v);
    });
    const response = await apiClient.patch(API_ENDPOINTS.PATROLS.UPDATE(id), body);
    return response.data;
  }

  async getPatrolById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.PATROLS.GET_BY_ID(id));
    return response.data;
  }

  async deletePatrol(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.PATROLS.DELETE(id));
    return response.data;
  }

  async getNearby(params: any) {
    const response = await apiClient.get(API_ENDPOINTS.PATROLS.GET_NEARBY, { params });
    return response.data;
  }
}

export const patrolService = new PatrolService();
