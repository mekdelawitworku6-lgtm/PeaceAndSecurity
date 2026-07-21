import { mockDashboard } from "../mock-store";
import { ServiceResponse } from "../api-types";

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
    const stats = mockDashboard.getStats();
    return { success: true, message: "ok", data: stats as PeaceSecurityStats };
  }

  async getFleetLocations(): Promise<ServiceResponse<any>> {
    const data = mockDashboard.getFleetLocations();
    return { success: true, message: "ok", data: data.data };
  }

  async getRecentReports(): Promise<ServiceResponse<any[]>> {
    const all = mockDashboard.getFleetLocations();
    return { success: true, message: "ok", data: all.data.reports };
  }
}

export const dashboardService = new DashboardService();
