import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class UserService {
  async getAllUsers(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.USERS.GET_ALL, { params });
    return response.data;
  }

  async registerUser(formData: FormData) {
    const response = await apiClient.post(API_ENDPOINTS.USERS.REGISTER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateUser(id: string, formData: FormData) {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.GET_BY_ID(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateProfile(formData: FormData) {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE_PROFILE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async toggleUserStatus(id: string) {
    const response = await apiClient.put(API_ENDPOINTS.USERS.TOGGLE_STATUS(id));
    return response.data;
  }

  async getUserProfile() {
    const response = await apiClient.get(API_ENDPOINTS.USERS.GET_PROFILE);
    return response.data;
  }

  async getUserById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
    return response.data;
  }

  async resetUserPassword(id: string) {
    const response = await apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id));
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  }
}

export const userService = new UserService();
