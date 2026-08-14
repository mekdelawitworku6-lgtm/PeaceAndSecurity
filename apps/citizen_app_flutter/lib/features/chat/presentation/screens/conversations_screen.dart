import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/chat.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../bloc/chat_bloc.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ChatBloc>().add(ChatFetchConversationsRequested());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ChatBloc>().state;
    final conversations = state.conversations;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(title: t('chats'), showBack: false),
          Expanded(
            child: conversations.isEmpty
                ? const EmptyState(
                    icon: '💬',
                    title: 'No conversations yet',
                    subtitle:
                        'Start chatting with the response team from any of your reports.',
                  )
                : RefreshIndicator(
                    onRefresh: () async {
                      context.read<ChatBloc>().add(ChatFetchConversationsRequested());
                    },
                    color: AppColors.primary,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: conversations.length,
                      itemBuilder: (context, i) {
                        final conv = conversations[i];
                        return _ConversationRow(
                          conv: conv,
                          onTap: () => context.push(
                            '/chat/${conv.id}?title=${Uri.encodeComponent(conv.title)}',
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _ConversationRow extends StatelessWidget {
  final Conversation conv;
  final VoidCallback onTap;

  const _ConversationRow({required this.conv, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final unread = conv.unreadCount;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.all(14),
        child: Container(
          decoration: unread > 0
              ? BoxDecoration(
                  border: Border.all(color: AppColors.primary, width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                )
              : null,
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primarySoft,
                child: const Icon(Icons.chat_bubble_outline,
                    size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            conv.title,
                            style: AppTypography.smallMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (conv.lastMessage != null)
                          Text(
                            Formatters.timeAgo(conv.lastMessage!.createdAt),
                            style: AppTypography.caption,
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      conv.lastMessage == null
                          ? 'No messages yet — start the conversation.'
                          : '${conv.lastMessage!.senderName ?? conv.lastMessage!.senderType ?? ''}: '
                              '${conv.lastMessage!.content}',
                      style: AppTypography.small.copyWith(
                        color: unread > 0 ? AppColors.text : AppColors.textMuted,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (unread > 0) ...[
                const SizedBox(width: 10),
                Container(
                  constraints: const BoxConstraints(minWidth: 20),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.danger,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    unread > 9 ? '9+' : '$unread',
                    style: const TextStyle(
                      color: AppColors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}