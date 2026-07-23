import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class CitizenService {
  async getAllCitizens(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.CITIZENS.GET_ALL, { params });
    return response.data;
  }

  async registerCitizen(formData: FormData) {
    const body: any = {};
    formData.forEach((v, k) => {
      body[k] = String(v);
    });
    const response = await apiClient.post(API_ENDPOINTS.CITIZENS.CREATE, body);
    return response.data;
  }

  async updateCitizen(id: string, formData: FormData) {
    const body: any = {};
    formData.forEach((v, k) => {
      body[k] = String(v);
    });
    const response = await apiClient.patch(API_ENDPOINTS.CITIZENS.UPDATE(id), body);
    return response.data;
  }

  async getCitizenById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.CITIZENS.GET_BY_ID(id));
    return response.data;
  }

  async deleteCitizen(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.CITIZENS.DELETE(id));
    return response.data;
  }
}

export const citizenService = new CitizenService();
