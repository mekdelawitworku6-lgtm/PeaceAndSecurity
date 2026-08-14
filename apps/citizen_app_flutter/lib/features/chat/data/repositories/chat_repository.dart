import '../../../../core/models/chat.dart';
import '../../../../core/network/api_client.dart';

class ChatRepository {
  final _api = ApiClient.instance;

  Future<List<Conversation>> fetchConversations() async {
    final res = await _api.get('/chat/conversations');
    final data = res['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(Conversation.fromJson)
          .toList();
    }
    return const [];
  }

  Future<Conversation> openConversation(String reportId) async {
    final res = await _api.get('/chat/conversations/report/$reportId');
    return Conversation.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<Message>> fetchMessages(String conversationId) async {
    final res = await _api.get(
      '/chat/conversations/$conversationId/messages',
      queryParameters: {'page': 1, 'limit': 50},
    );
    final data = res['data'];
    if (data is Map<String, dynamic>) {
      return MessagesPage.fromJson(data).data;
    }
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().map(Message.fromJson).toList();
    }
    return const [];
  }

  Future<Message> sendMessage({
    required String conversationId,
    required String content,
    required String senderType,
    String? senderName,
  }) async {
    final res = await _api.post(
      '/chat/conversations/$conversationId/messages',
      data: {
        'content': content,
        'senderType': senderType,
        'senderName': senderName,
      },
    );
    return Message.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> markConversationRead(String conversationId) async {
    await _api.patch('/chat/conversations/$conversationId/read');
  }
}