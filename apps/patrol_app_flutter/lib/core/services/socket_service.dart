import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/app_config.dart';
import '../models/app_notification.dart';
import '../models/chat.dart';
import '../models/user.dart';

enum SocketEvents {
  notification,
  unreadCount,
  chatMessage,
  chatTyping,
  chatConversationCreated,
}

class SocketService {
  SocketService._internal();

  static final SocketService instance = SocketService._internal();

  io.Socket? _notificationSocket;
  io.Socket? _chatSocket;

  final _notificationController =
      StreamController<AppNotification>.broadcast();
  final _unreadController = StreamController<int>.broadcast();
  final _messageController = StreamController<Message>.broadcast();
  final _typingController =
      StreamController<({String conversationId, bool isTyping, String? senderName})>
          .broadcast();
  final _conversationCreatedController =
      StreamController<String>.broadcast();

  Stream<AppNotification> get onNotification =>
      _notificationController.stream;
  Stream<int> get onUnreadCount => _unreadController.stream;
  Stream<Message> get onMessage => _messageController.stream;
  Stream<({String conversationId, bool isTyping, String? senderName})>
      get onTyping => _typingController.stream;
  Stream<String> get onConversationCreated =>
      _conversationCreatedController.stream;

  bool get isChatConnected => _chatSocket?.connected ?? false;

  void connect({required String token, required PatrolUser user}) {
    disconnect();

    _notificationSocket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );
    void auth() {
      _notificationSocket?.emit('authenticate', {
        'userId': user.id,
        'role': user.role,
      });
    }

    _notificationSocket!.onConnect((_) => auth());
    _notificationSocket!.onReconnect((_) => auth());
    _notificationSocket!.on('notification', (data) {
      if (data is Map) {
        _notificationController.add(
          AppNotification.fromJson(data.cast<String, dynamic>()),
        );
      }
    });
    _notificationSocket!.on('unread_count', (data) {
      if (data is Map && data['count'] is num) {
        _unreadController.add((data['count'] as num).toInt());
      }
    });
    _notificationSocket!.connect();

    _chatSocket = io.io(
      '${AppConfig.socketUrl}/chat',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );
    _chatSocket!.on('chat:message', (data) {
      if (data is Map) {
        _messageController.add(
          Message.fromJson(data.cast<String, dynamic>()),
        );
      }
    });
    _chatSocket!.on('chat:typing', (data) {
      if (data is Map) {
        _typingController.add((
          conversationId: data['conversationId'] as String? ?? '',
          isTyping: data['isTyping'] as bool? ?? false,
          senderName: data['senderName'] as String?,
        ));
      }
    });
    _chatSocket!.on('chat:conversation_created', (data) {
      if (data is Map) {
        _conversationCreatedController.add(data['reportId'] as String? ?? '');
      }
    });
    _chatSocket!.connect();
  }

  void emitAuthenticate({required String userId, required String role}) {
    _notificationSocket?.emit('authenticate', {
      'userId': userId,
      'role': role,
    });
  }

  void joinConversation(String conversationId) {
    _chatSocket?.emit('chat:join', {'conversationId': conversationId});
  }

  void leaveConversation(String conversationId) {
    _chatSocket?.emit('chat:leave', {'conversationId': conversationId});
  }

  bool sendChatMessage({
    required String conversationId,
    required String content,
    required String senderType,
    String? senderId,
    String? senderName,
  }) {
    if (!isChatConnected) return false;
    _chatSocket!.emit('chat:send', {
      'conversationId': conversationId,
      'content': content,
      'senderType': senderType,
      'senderId': senderId,
      'senderName': senderName,
    });
    return true;
  }

  void emitTyping({
    required String conversationId,
    required bool isTyping,
    String? senderName,
  }) {
    _chatSocket?.emit('chat:typing', {
      'conversationId': conversationId,
      'isTyping': isTyping,
      'senderName': senderName,
    });
  }

  void emitChatRead({
    required String conversationId,
    String? readerId,
    String? readerName,
  }) {
    _chatSocket?.emit('chat:read', {
      'conversationId': conversationId,
      'readerId': readerId,
      'readerName': readerName,
    });
  }

  void disconnect() {
    _notificationSocket?.dispose();
    _notificationSocket = null;
    _chatSocket?.dispose();
    _chatSocket = null;
  }
}