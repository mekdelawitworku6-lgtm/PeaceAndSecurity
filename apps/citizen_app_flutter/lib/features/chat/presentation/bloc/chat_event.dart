part of 'chat_bloc.dart';

sealed class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class ChatFetchConversationsRequested extends ChatEvent {}

class ChatFetchMessagesRequested extends ChatEvent {
  final String conversationId;

  const ChatFetchMessagesRequested(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class ChatSendMessageRequested extends ChatEvent {
  final String conversationId;
  final String content;
  final String senderType;
  final String? senderName;

  const ChatSendMessageRequested({
    required this.conversationId,
    required this.content,
    required this.senderType,
    this.senderName,
  });

  @override
  List<Object?> get props => [conversationId, content, senderType, senderName];
}

class ChatMarkReadRequested extends ChatEvent {
  final String conversationId;

  const ChatMarkReadRequested(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class ChatOpenConversationRequested extends ChatEvent {
  final String reportId;

  const ChatOpenConversationRequested(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ChatSetActiveRequested extends ChatEvent {
  final String? conversationId;

  const ChatSetActiveRequested(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class ChatJoinRequested extends ChatEvent {
  final String conversationId;

  const ChatJoinRequested(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class ChatLeaveRequested extends ChatEvent {
  final String conversationId;

  const ChatLeaveRequested(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class ChatTypingChanged extends ChatEvent {
  final String conversationId;
  final bool isTyping;
  final String? senderName;

  const ChatTypingChanged({
    required this.conversationId,
    required this.isTyping,
    this.senderName,
  });

  @override
  List<Object?> get props => [conversationId, isTyping, senderName];
}

class ChatSocketMessageReceived extends ChatEvent {
  final Message message;

  const ChatSocketMessageReceived(this.message);

  @override
  List<Object?> get props => [message];
}

class ChatSocketTypingReceived extends ChatEvent {
  final String conversationId;
  final bool isTyping;
  final String? senderName;

  const ChatSocketTypingReceived({
    required this.conversationId,
    required this.isTyping,
    this.senderName,
  });

  @override
  List<Object?> get props => [conversationId, isTyping, senderName];
}

class ChatSocketConversationCreated extends ChatEvent {
  final String reportId;

  const ChatSocketConversationCreated(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ChatConversationsRefreshed extends ChatEvent {}

class ChatErrorCleared extends ChatEvent {}