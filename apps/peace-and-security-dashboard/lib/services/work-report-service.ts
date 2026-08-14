import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';
import { ServiceResponse } from '../api-types';

export interface WorkReport {
  id: string;
  reporterId: string;
  reporterRole: string;
  reporterName?: string;
  title: string;
  description: string;
  reportDate?: string;
  latitude?: number;
  longitude?: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  reviewedById?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt?: string;
}

class WorkReportService {
  async getAll(params?: any): Promise<ServiceResponse<WorkReport[]>> {
    const response = await apiClient.get(API_ENDPOINTS.WORK_REPORTS.GET_ALL, { params });
    return response.data;
  }

  async getById(id: string): Promise<ServiceResponse<WorkReport>> {
    const response = await apiClient.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_ID(id));
    return response.data;
  }

  async create(data: {
    title: string;
    description: string;
    reportDate?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ServiceResponse<WorkReport>> {
    const response = await apiClient.post(API_ENDPOINTS.WORK_REPORTS.CREATE, data);
    return response.data;
  }

  async review(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewNote?: string,
  ): Promise<ServiceResponse<WorkReport>> {
    const response = await apiClient.patch(API_ENDPOINTS.WORK_REPORTS.REVIEW(id), {
      status,
      ...(reviewNote ? { reviewNote } : {}),
    });
    return response.data;
  }

  async remove(id: string): Promise<ServiceResponse> {
    const response = await apiClient.delete(API_ENDPOINTS.WORK_REPORTS.DELETE(id));
    return response.data;
  }
}

export const workReportService = new WorkReportService();