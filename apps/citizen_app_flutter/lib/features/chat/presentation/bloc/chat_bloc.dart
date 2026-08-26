import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/chat.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/services/socket_service.dart';
import '../../data/repositories/chat_repository.dart';

part 'chat_event.dart';
part 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository repository;
  StreamSubscription? _msgSub;
  StreamSubscription? _typingSub;
  StreamSubscription? _convCreatedSub;
  bool _isTyping = false;

  ChatBloc({required this.repository}) : super(const ChatState()) {
    on<ChatFetchConversationsRequested>(_onFetchConversations);
    on<ChatFetchMessagesRequested>(_onFetchMessages);
    on<ChatSendMessageRequested>(_onSendMessage);
    on<ChatMarkReadRequested>(_onMarkRead);
    on<ChatOpenConversationRequested>(_onOpenConversation);
    on<ChatSetActiveRequested>(_onSetActive);
    on<ChatJoinRequested>(_onJoin);
    on<ChatLeaveRequested>(_onLeave);
    on<ChatTypingChanged>(_onTypingChanged);
    on<ChatSocketMessageReceived>(_onSocketMessage);
    on<ChatSocketTypingReceived>(_onSocketTyping);
    on<ChatSocketConversationCreated>(_onSocketConversationCreated);
    on<ChatConversationsRefreshed>(_onConversationsRefreshed);
    on<ChatErrorCleared>(_onClearError);

    _msgSub = SocketService.instance.onMessage.listen(
      (msg) => add(ChatSocketMessageReceived(msg)),
    );
    _typingSub = SocketService.instance.onTyping.listen(
      (t) => add(ChatSocketTypingReceived(
        conversationId: t.conversationId,
        isTyping: t.isTyping,
        senderName: t.senderName,
      )),
    );
    _convCreatedSub = SocketService.instance.onConversationCreated.listen(
      (reportId) => add(ChatSocketConversationCreated(reportId)),
    );
  }

  @override
  Future<void> close() {
    _msgSub?.cancel();
    _typingSub?.cancel();
    _convCreatedSub?.cancel();
    return super.close();
  }

  Future<void> _onFetchConversations(
      ChatFetchConversationsRequested event, Emitter<ChatState> emit) async {
    try {
      final conversations = await repository.fetchConversations();
      emit(state.copyWith(conversations: conversations, loading: false, error: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchMessages(
      ChatFetchMessagesRequested event, Emitter<ChatState> emit) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final messages = await repository.fetchMessages(event.conversationId);
      emit(state.copyWith(
        messagesByConv: {...state.messagesByConv, event.conversationId: messages},
        loading: false,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onSendMessage(
      ChatSendMessageRequested event, Emitter<ChatState> emit) async {
    final user = SessionManager.instance.user;
    emit(state.copyWith(sending: true, error: null));

    final pending = Message(
      id: 'pending-${event.conversationId}-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: event.conversationId,
      senderId: user?.id,
      senderType: event.senderType,
      senderName: event.senderName,
      content: event.content,
      isRead: false,
      createdAt: DateTime.now().toIso8601String(),
    );

    emit(state.copyWith(
      sending: false,
      messagesByConv: {
        ...state.messagesByConv,
        event.conversationId: [
          ...state.messagesByConv[event.conversationId] ?? <Message>[],
          pending,
        ],
      },
    ));

    final sent = SocketService.instance.sendChatMessage(
      conversationId: event.conversationId,
      content: event.content,
      senderType: event.senderType,
      senderId: user?.id,
      senderName: event.senderName,
    );

    if (!sent) {
      try {
        final msg = await repository.sendMessage(
          conversationId: event.conversationId,
          content: event.content,
          senderType: event.senderType,
          senderName: event.senderName,
        );
        _replacePending(event.conversationId, pending.id, msg, emit);
      } catch (e) {
        _removePending(event.conversationId, pending.id, emit);
        emit(state.copyWith(error: _msg(e)));
      }
    }
  }

  Future<void> _onMarkRead(
      ChatMarkReadRequested event, Emitter<ChatState> emit) async {
    emit(state.copyWith(
      conversations: state.conversations
          .map((c) =>
              c.id == event.conversationId ? c.copyWith(unreadCount: 0) : c)
          .toList(),
    ));
    try {
      await repository.markConversationRead(event.conversationId);
      SocketService.instance.emitChatRead(
        conversationId: event.conversationId,
        readerId: SessionManager.instance.user?.id,
      );
    } catch (_) {}
  }

  Future<void> _onOpenConversation(
      ChatOpenConversationRequested event, Emitter<ChatState> emit) async {
    try {
      final conv = await repository.openConversation(event.reportId);
      emit(state.copyWith(
        conversations: [conv, ...state.conversations.where((c) => c.id != conv.id)],
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  void _onSetActive(ChatSetActiveRequested event, Emitter<ChatState> emit) {
    emit(state.copyWith(activeConversation: event.conversationId));
  }

  void _onJoin(ChatJoinRequested event, Emitter<ChatState> emit) {
    SocketService.instance.joinConversation(event.conversationId);
  }

  void _onLeave(ChatLeaveRequested event, Emitter<ChatState> emit) {
    SocketService.instance.leaveConversation(event.conversationId);
  }

  Future<void> _onTypingChanged(
      ChatTypingChanged event, Emitter<ChatState> emit) async {
    if (event.isTyping == _isTyping) return;
    _isTyping = event.isTyping;
    SocketService.instance.emitTyping(
      conversationId: event.conversationId,
      isTyping: event.isTyping,
      senderName: event.senderName,
    );
  }

  void _onSocketMessage(
      ChatSocketMessageReceived event, Emitter<ChatState> emit) {
    final msg = event.message;
    final current = [...state.messagesByConv[msg.conversationId] ?? <Message>[]];
    if (current.any((m) => m.id == msg.id)) return;

    // If we have a pending message matching this content and sender, replace it
    final pendingIdx = current.indexWhere((m) =>
        m.id.startsWith('pending-') &&
        m.content == msg.content &&
        m.senderType == msg.senderType);

    if (pendingIdx != -1) {
      current[pendingIdx] = msg;
    } else {
      current.add(msg);
    }

    final isActive = state.activeConversation == msg.conversationId;
    emit(state.copyWith(
      messagesByConv: {...state.messagesByConv, msg.conversationId: current},
      conversations: state.conversations.map((c) {
        if (c.id != msg.conversationId) return c;
        return c.copyWith(
          lastMessage: msg,
          updatedAt: msg.createdAt,
          unreadCount: isActive ? 0 : c.unreadCount + 1,
        );
      }).toList(),
    ));
  }

  void _onSocketTyping(
      ChatSocketTypingReceived event, Emitter<ChatState> emit) {
    emit(state.copyWith(
      typing: {
        ...state.typing,
        event.conversationId: TypingInfo(
          isTyping: event.isTyping,
          senderName: event.senderName,
        ),
      },
    ));
  }

  void _onSocketConversationCreated(
      ChatSocketConversationCreated event, Emitter<ChatState> emit) {
    add(ChatFetchConversationsRequested());
  }

  void _onConversationsRefreshed(
      ChatConversationsRefreshed event, Emitter<ChatState> emit) {
    add(ChatFetchConversationsRequested());
  }

  void _onClearError(ChatErrorCleared event, Emitter<ChatState> emit) {
    emit(state.copyWith(error: null));
  }

  void _replacePending(
      String convId, String pendingId, Message msg, Emitter<ChatState> emit) {
    final current = [...state.messagesByConv[convId] ?? <Message>[]];
    final idx = current.indexWhere((m) => m.id == pendingId);
    if (idx >= 0) {
      current[idx] = msg;
      emit(state.copyWith(
        messagesByConv: {...state.messagesByConv, convId: current},
      ));
    }
  }

  void _removePending(String convId, String pendingId, Emitter<ChatState> emit) {
    final current = [...state.messagesByConv[convId] ?? <Message>[]];
    emit(state.copyWith(
      messagesByConv: {
        ...state.messagesByConv,
        convId: current.where((m) => m.id != pendingId).toList(),
      },
    ));
  }

  String _msg(Object e) {
    final s = e.toString().replaceFirst('Exception: ', '');
    return s == 'null' || s.isEmpty ? 'Something went wrong' : s;
  }
}