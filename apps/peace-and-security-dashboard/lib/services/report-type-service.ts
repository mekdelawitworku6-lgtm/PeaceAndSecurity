import { mockReportTypes } from "../mock-store";

class ReportTypeService {
  async getAll(params?: { search?: string; isActive?: string }) {
    return mockReportTypes.getAll(params?.search);
  }

  async create(data: any) {
    const item = { ...data, isActive: true, createdAt: new Date().toISOString() };
    return mockReportTypes.create(item);
  }

  async update(id: string, data: any) {
    return mockReportTypes.update(id, { ...data, updatedAt: new Date().toISOString() });
  }

  async deleteReportType(id: string) {
    mockReportTypes.delete(id);
    return { success: true };
  }
}

export const reportTypeService = new ReportTypeService();
