import { mockCameras } from "../mock-store";

class CameraService {
  async getAll() {
    return mockCameras.getAll();
  }

  async create(data: any) {
    const item = { ...data, isActive: true, lastMaintenanceDate: new Date().toISOString() };
    return mockCameras.create(item);
  }

  async update(id: string, data: any) {
    return mockCameras.update(id, data);
  }

  async deleteCamera(id: string) {
    mockCameras.delete(id);
    return { success: true };
  }

  async getAlerts() {
    return { data: [], success: true };
  }

  async createAlert(_data: any) {
    return { success: true };
  }
}

export const cameraService = new CameraService();
