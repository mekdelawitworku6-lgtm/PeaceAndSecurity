import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-config';

class ChatService {
  async getConversations(params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS.GET_ALL, { params });
    return response.data;
  }

  async getConversationById(id: string) {
    const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS.GET_BY_ID(id));
    return response.data;
  }

  async createConversation(data: { reportId?: string; citizenId?: string; patrolUserId?: string; title?: string }) {
    const response = await apiClient.post(API_ENDPOINTS.CHAT.CONVERSATIONS.CREATE, data);
    return response.data;
  }

  async getMessages(conversationId: string, params?: any) {
    const response = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES.GET_ALL(conversationId), { params });
    return response.data;
  }

  async sendMessage(conversationId: string, data: { content: string; messageType?: string }) {
    const response = await apiClient.post(API_ENDPOINTS.CHAT.MESSAGES.SEND(conversationId), data);
    return response.data;
  }
}

export const chatService = new ChatService();
