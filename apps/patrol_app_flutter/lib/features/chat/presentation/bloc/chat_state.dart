part of 'chat_bloc.dart';

class TypingInfo extends Equatable {
  final bool isTyping;
  final String? senderName;

  const TypingInfo({this.isTyping = false, this.senderName});

  @override
  List<Object?> get props => [isTyping, senderName];
}

class ChatState extends Equatable {
  final List<Conversation> conversations;
  final Map<String, List<Message>> messagesByConv;
  final String? activeConversation;
  final Map<String, TypingInfo> typing;
  final bool loading;
  final bool sending;
  final String? error;

  const ChatState({
    this.conversations = const [],
    this.messagesByConv = const {},
    this.activeConversation,
    this.typing = const {},
    this.loading = false,
    this.sending = false,
    this.error,
  });

  ChatState copyWith({
    List<Conversation>? conversations,
    Map<String, List<Message>>? messagesByConv,
    String? activeConversation,
    Map<String, TypingInfo>? typing,
    bool? loading,
    bool? sending,
    String? error,
  }) =>
      ChatState(
        conversations: conversations ?? this.conversations,
        messagesByConv: messagesByConv ?? this.messagesByConv,
        activeConversation: activeConversation ?? this.activeConversation,
        typing: typing ?? this.typing,
        loading: loading ?? this.loading,
        sending: sending ?? this.sending,
        error: error,
      );

  @override
  List<Object?> get props => [
        conversations,
        messagesByConv,
        activeConversation,
        typing,
        loading,
        sending,
        error,
      ];
}