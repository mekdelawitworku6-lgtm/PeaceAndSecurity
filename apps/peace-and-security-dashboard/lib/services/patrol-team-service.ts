import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class PatrolTeamService {
  async getAll(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.PATROL_TEAMS.GET_ALL, { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.PATROL_TEAMS.GET_BY_ID(id));
    return response.data;
  }

  async create(data: { name: string; woredaId: string; memberIds?: string[] }) {
    const response = await apiClient.post(API_ENDPOINTS.PATROL_TEAMS.CREATE, data);
    return response.data;
  }

  async update(id: string, data: { name?: string; woredaId?: string }) {
    const response = await apiClient.patch(API_ENDPOINTS.PATROL_TEAMS.UPDATE(id), data);
    return response.data;
  }

  async delete(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.PATROL_TEAMS.DELETE(id));
    return response.data;
  }

  async addMembers(id: string, userIds: string[]) {
    const response = await apiClient.post(API_ENDPOINTS.PATROL_TEAMS.ADD_MEMBERS(id), { userIds });
    return response.data;
  }

  async removeMember(id: string, userId: string) {
    const response = await apiClient.delete(API_ENDPOINTS.PATROL_TEAMS.REMOVE_MEMBER(id, userId));
    return response.data;
  }
}

export const patrolTeamService = new PatrolTeamService();
