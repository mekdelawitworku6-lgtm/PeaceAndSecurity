import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/chat.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../bloc/chat_bloc.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;
  final String? title;

  const ChatScreen({
    super.key,
    required this.conversationId,
    this.title,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _input = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;
  bool _lastTyping = false;

  @override
  void initState() {
    super.initState();
    final bloc = context.read<ChatBloc>();
    bloc.add(ChatSetActiveRequested(widget.conversationId));
    bloc.add(ChatJoinRequested(widget.conversationId));
    bloc.add(ChatFetchMessagesRequested(widget.conversationId));
    bloc.add(ChatMarkReadRequested(widget.conversationId));
  }

  @override
  void dispose() {
    final bloc = context.read<ChatBloc>();
    bloc.add(ChatSetActiveRequested(null));
    bloc.add(ChatLeaveRequested(widget.conversationId));
    _input.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send() {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    final user = SessionManager.instance.user;
    setState(() {
      _sending = true;
      _input.clear();
    });
    context.read<ChatBloc>().add(ChatSendMessageRequested(
          conversationId: widget.conversationId,
          content: text,
          senderType: 'patrol',
          senderName: user?.fullName,
        ));
    context.read<ChatBloc>().add(ChatTypingChanged(
          conversationId: widget.conversationId,
          isTyping: false,
          senderName: user?.fullName,
        ));
    setState(() => _lastTyping = false);
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) setState(() => _sending = false);
    });
  }

  void _onInputChanged(String value) {
    final typing = value.trim().isNotEmpty;
    if (typing == _lastTyping) return;
    _lastTyping = typing;
    context.read<ChatBloc>().add(ChatTypingChanged(
          conversationId: widget.conversationId,
          isTyping: typing,
          senderName: SessionManager.instance.user?.fullName,
        ));
  }

  @override
  Widget build(BuildContext context) {
    final user = SessionManager.instance.user;
    return BlocConsumer<ChatBloc, ChatState>(
      listenWhen: (prev, curr) =>
          prev.messagesByConv[widget.conversationId]?.length !=
          curr.messagesByConv[widget.conversationId]?.length,
      listener: (context, state) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
            );
          }
        });
      },
      builder: (context, state) {
        final messages =
            state.messagesByConv[widget.conversationId] ?? const <Message>[];
        final typing = state.typing[widget.conversationId];

        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: widget.title ?? 'Chat', showBack: true),
              Expanded(
                child: messages.isEmpty
                    ? const EmptyState(
                        icon: '✉',
                        title: 'No messages yet',
                        subtitle: 'Start the conversation below.',
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: messages.length,
                        itemBuilder: (context, i) {
                          final msg = messages[i];
                          final isMine = msg.senderType == 'patrol' ||
                              msg.senderId == user?.id;
                          return _MessageBubble(
                            message: msg,
                            isMine: isMine,
                            showSender: !isMine &&
                                (i == 0 ||
                                    messages[i - 1].senderId != msg.senderId),
                          );
                        },
                      ),
              ),
              if (typing != null && typing.isTyping) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '${typing.senderName ?? 'Someone'} is typing…',
                      style: AppTypography.caption.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ),
              ],
              _InputBar(
                controller: _input,
                onChanged: _onInputChanged,
                onSend: _send,
                sending: _sending,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final Message message;
  final bool isMine;
  final bool showSender;

  const _MessageBubble({
    required this.message,
    required this.isMine,
    required this.showSender,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isMine ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: Radius.circular(isMine ? 12 : 4),
            bottomRight: Radius.circular(isMine ? 4 : 12),
          ),
          border: isMine ? null : Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: isMine
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            if (showSender && message.senderName != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  message.senderName!,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            Text(
              message.content,
              style: AppTypography.small.copyWith(
                color: isMine ? AppColors.white : AppColors.text,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              Formatters.formatTime(message.createdAt),
              style: AppTypography.caption.copyWith(
                fontSize: 10,
                color: isMine ? AppColors.primarySoft : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback onSend;
  final bool sending;

  const _InputBar({
    required this.controller,
    required this.onChanged,
    required this.onSend,
    required this.sending,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: const BoxDecoration(
          color: AppColors.card,
          border: Border(top: BorderSide(color: AppColors.divider)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                onChanged: onChanged,
                maxLines: null,
                minLines: 1,
                maxLength: 1000,
                decoration: InputDecoration(
                  hintText: t('typeMessage'),
                  counterText: '',
                  isDense: true,
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Opacity(
              opacity: controller.text.trim().isEmpty || sending ? 0.5 : 1,
              child: GestureDetector(
                onTap: onSend,
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.arrow_upward,
                    color: AppColors.white,
                    size: 20,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}