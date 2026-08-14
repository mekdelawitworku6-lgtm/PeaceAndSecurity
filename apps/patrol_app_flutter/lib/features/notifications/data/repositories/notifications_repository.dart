import '../../../../core/models/app_notification.dart';
import '../../../../core/network/api_client.dart';

class NotificationsRepository {
  final _api = ApiClient.instance;

  Future<List<AppNotification>> fetchNotifications({int limit = 50}) async {
    final res = await _api.get('/notifications', queryParameters: {'limit': limit});
    final data = res['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(AppNotification.fromJson)
          .toList();
    }
    return const [];
  }

  Future<int> fetchUnreadCount() async {
    final res = await _api.get('/notifications/unread-count');
    final data = res['data'];
    if (data is Map<String, dynamic>) {
      return (data['count'] as num?)?.toInt() ?? 0;
    }
    return 0;
  }

  Future<void> markRead(String id) async {
    await _api.post('/notifications/$id/mark-read');
  }

  Future<void> markAllRead() async {
    await _api.post('/notifications/mark-all-read');
  }
}