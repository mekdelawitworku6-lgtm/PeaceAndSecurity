import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

interface AnalyticsData {
  stats: {
    totalReports: number;
    highPriorityReports: number;
    avgResponseTime: string;
    topLocation: string;
  };
  statusChart: { period: string; status: string; count: string }[];
  trendChart: { period: string; count: string }[];
  categoryChart: { name: string; value: string }[];
  timeRange: string;
}

class AnalyticsService {
  async getAnalytics(timeRange: string): Promise<{ data: AnalyticsData }> {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.GET(timeRange));
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
export type { AnalyticsData };
