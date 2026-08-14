import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/app_notification.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../bloc/notifications_bloc.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<NotificationsBloc>().add(NotificationsFetchRequested());
        context
            .read<NotificationsBloc>()
            .add(NotificationsFetchUnreadRequested());
      }
    });
  }

  String _iconFor(String type) => switch (type) {
        'REPORT_SUBMITTED' => '📨',
        'REPORT_ASSIGNED' => '👮',
        'REPORT_STATUS_UPDATED' => '🔄',
        'PATROL_FOLLOW_UP' => '📝',
        _ => '🔔',
      };

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<NotificationsBloc>().state;
    final items = state.items;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(
            title: t('notifications'),
            showBack: false,
            right: state.unreadCount > 0
                ? TextButton(
                    onPressed: () => context
                        .read<NotificationsBloc>()
                        .add(NotificationsMarkAllReadRequested()),
                    child: Text(
                      t('markAllRead'),
                      style: AppTypography.smallMedium
                          .copyWith(color: AppColors.primary),
                    ),
                  )
                : null,
          ),
          Expanded(
            child: items.isEmpty
                ? EmptyState(
                    icon: '🔕',
                    title: t('noNotifications'),
                    subtitle: t('noNotificationsSub'),
                  )
                : RefreshIndicator(
                    onRefresh: () async {
                      context
                          .read<NotificationsBloc>()
                          .add(NotificationsFetchRequested());
                      context
                          .read<NotificationsBloc>()
                          .add(NotificationsFetchUnreadRequested());
                    },
                    color: AppColors.primary,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: items.length,
                      itemBuilder: (context, i) => _NotificationCard(
                        notification: items[i],
                        icon: _iconFor(items[i].type),
                        onTap: () {
                          final n = items[i];
                          if (!n.isRead) {
                            context
                                .read<NotificationsBloc>()
                                .add(NotificationsMarkReadRequested(n.id));
                          }
                          final reportId = n.data?['reportId'] as String?;
                          if (reportId != null) {
                            context.go(
                              '/report-detail/$reportId'
                              '?caseId=${n.data?['caseId'] ?? ''}',
                            );
                          }
                        },
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final AppNotification notification;
  final String icon;
  final VoidCallback onTap;

  const _NotificationCard({
    required this.notification,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final unread = !notification.isRead;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.all(14),
        child: Container(
          decoration: unread
              ? BoxDecoration(
                  border: Border.all(color: AppColors.primary, width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                )
              : null,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(999),
                ),
                alignment: Alignment.center,
                child: Text(icon, style: const TextStyle(fontSize: 18)),
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
                            notification.title,
                            style: AppTypography.smallMedium.copyWith(
                              color: unread ? AppColors.primary : AppColors.text,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          Formatters.timeAgo(notification.createdAt),
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.message,
                      style: AppTypography.small,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (unread) ...[
                const SizedBox(width: 8),
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: const BoxDecoration(
                    color: AppColors.info,
                    shape: BoxShape.circle,
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