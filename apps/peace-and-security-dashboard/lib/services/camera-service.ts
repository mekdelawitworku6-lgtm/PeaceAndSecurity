import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class CameraService {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.CAMERAS.GET_ALL);
    return response.data;
  }

  async create(data: any) {
    const response = await apiClient.post(API_ENDPOINTS.CAMERAS.CREATE, data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await apiClient.patch(API_ENDPOINTS.CAMERAS.UPDATE(id), data);
    return response.data;
  }

  async deleteCamera(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.CAMERAS.DELETE(id));
    return response.data;
  }

  async getAlerts() {
    const response = await apiClient.get('cameras/alerts');
    return response.data;
  }

  async createAlert(data: any) {
    const response = await apiClient.post('cameras/alerts', data);
    return response.data;
  }
}

export const cameraService = new CameraService();
