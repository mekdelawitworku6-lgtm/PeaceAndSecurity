import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class GeoService {
  async getCities(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.CITIES.GET_ALL, { params });
    return response.data;
  }

  async getCityById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.CITIES.GET_BY_ID(id));
    return response.data;
  }

  async createCity(data: { name: string; code: string; nameAm?: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.post(API_ENDPOINTS.GEO.CITIES.CREATE, data);
    return response.data;
  }

  async updateCity(id: string, data: { name?: string; code?: string; nameAm?: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.patch(API_ENDPOINTS.GEO.CITIES.UPDATE(id), data);
    return response.data;
  }

  async deleteCity(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.GEO.CITIES.DELETE(id));
    return response.data;
  }

  async getSubcities(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.SUBCITIES.GET_ALL, { params });
    return response.data;
  }

  async getSubcityById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.SUBCITIES.GET_BY_ID(id));
    return response.data;
  }

  async getSubcitiesByCity(cityId: string) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.SUBCITIES.GET_BY_CITY(cityId));
    return response.data;
  }

  async createSubcity(data: { name: string; code: string; nameAm?: string; cityId: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.post(API_ENDPOINTS.GEO.SUBCITIES.CREATE, data);
    return response.data;
  }

  async updateSubcity(id: string, data: { name?: string; code?: string; nameAm?: string; cityId?: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.patch(API_ENDPOINTS.GEO.SUBCITIES.UPDATE(id), data);
    return response.data;
  }

  async deleteSubcity(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.GEO.SUBCITIES.DELETE(id));
    return response.data;
  }

  async getWoredas(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.WOREDAS.GET_ALL, { params });
    return response.data;
  }

  async getWoredaById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.WOREDAS.GET_BY_ID(id));
    return response.data;
  }

  async getWoredasBySubcity(subcityId: string) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.WOREDAS.GET_BY_SUBCITY(subcityId));
    return response.data;
  }

  async createWoreda(data: { name: string; code: string; nameAm?: string; subcityId: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.post(API_ENDPOINTS.GEO.WOREDAS.CREATE, data);
    return response.data;
  }

  async updateWoreda(id: string, data: { name?: string; code?: string; nameAm?: string; subcityId?: string; description?: string; latitude?: number; longitude?: number; isActive?: boolean }) {
    const response = await apiClient.patch(API_ENDPOINTS.GEO.WOREDAS.UPDATE(id), data);
    return response.data;
  }

  async deleteWoreda(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.GEO.WOREDAS.DELETE(id));
    return response.data;
  }
}

export const geoService = new GeoService();
