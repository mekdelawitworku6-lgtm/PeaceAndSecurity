import apiClient from '@/lib/api-client';
import { ServiceResponse } from '../api-types';

export interface PeaceSecurityStats {
  reports: {
    total: number;
    resolved: number;
    pending: number;
    byType: { name: string; count: string | number }[];
    byStatus: { status: string; count: string | number }[];
    trend: { date: string; count: number }[];
  };
  users: {
    citizens: number;
    patrols: number;
    admins: number;
  };
  cameras: {
    total: number;
    active: number;
  };
  reportTypes: number;
}

class DashboardService {
  async getDashboardStats(): Promise<ServiceResponse<PeaceSecurityStats>> {
    const response = await apiClient.get('dashboard/stats');
    return response.data;
  }

  async getFleetLocations(): Promise<ServiceResponse<any>> {
    const response = await apiClient.get('dashboard/fleet-locations');
    return response.data;
  }

  async getRecentReports(): Promise<ServiceResponse<any[]>> {
    const response = await apiClient.get('dashboard/recent-reports');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
