import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../notifications/presentation/bloc/notifications_bloc.dart';
import '../../../reports/presentation/bloc/reports_bloc.dart';
import '../bloc/language_bloc.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

enum _SettingsTab { reports, preferences, notifications }

class _SettingsScreenState extends State<SettingsScreen> {
  _SettingsTab _activeTab = _SettingsTab.reports;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(ReportsFetchMyRequested());
        context.read<NotificationsBloc>().add(NotificationsFetchRequested());
        context
            .read<NotificationsBloc>()
            .add(NotificationsFetchUnreadRequested());
      }
    });
  }

  Future<void> _confirmLogout() async {
    final t = context.l10n().t;
    final isGuest = context.read<AuthBloc>().state.isGuest;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isGuest ? t('endSession') : 'Log out'),
        content: Text(isGuest ? t('endSessionConfirm') : t('logOutConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: Text(isGuest ? t('endSession') : 'Log out'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      context.read<AuthBloc>().add(AuthLogoutRequested());
      context.go('/splash');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthBloc>().state;
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          _buildProfileHeader(context, user),
          _TabBar(
            active: _activeTab,
            onChanged: (tab) => setState(() => _activeTab = tab),
          ),
          Expanded(
            child: switch (_activeTab) {
              _SettingsTab.reports => _ReportsTab(
                  onLogout: _confirmLogout,
                ),
              _SettingsTab.preferences => _PreferencesTab(
                  onLogout: _confirmLogout,
                ),
              _SettingsTab.notifications => const _NotificationsTab(),
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, dynamic user) {
    final t = context.l10n().t;
    final isGuest = context.watch<AuthBloc>().state.isGuest;
    final notifications = context.watch<NotificationsBloc>().state;
    final name = isGuest
        ? t('guest')
        : (user?.fullName ?? t('guest'));
    final subtitle = isGuest
        ? t('guestSub')
        : (user?.phoneNumber ?? '');
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: AppColors.primarySoft,
                backgroundImage: (!isGuest && (user?.profileImage?.isNotEmpty ?? false))
                    ? NetworkImage(assetUrl(user!.profileImage))
                    : null,
                onBackgroundImageError: (!isGuest && (user?.profileImage?.isNotEmpty ?? false))
                    ? (_, _) {}
                    : null,
                child: (!isGuest && (user?.profileImage?.isNotEmpty ?? false))
                    ? null
                    : Icon(
                        isGuest ? Icons.person_outline : Icons.person,
                        color: AppColors.primary,
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppTypography.h3),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: AppTypography.caption,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (isGuest)
                TextButton(
                  onPressed: () => context.push('/login'),
                  child: Text(
                    t('login'),
                    style: AppTypography.smallMedium.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                )
              else
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    IconButton(
                      onPressed: () =>
                          setState(() => _activeTab = _SettingsTab.notifications),
                      icon: const Icon(
                        Icons.notifications_none,
                        color: AppColors.text,
                      ),
                    ),
                    if (notifications.unreadCount > 0)
                      Positioned(
                        right: 4,
                        top: 4,
                        child: Container(
                          width: 9,
                          height: 9,
                          decoration: const BoxDecoration(
                            color: AppColors.danger,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TabBar extends StatelessWidget {
  final _SettingsTab active;
  final ValueChanged<_SettingsTab> onChanged;

  const _TabBar({required this.active, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final tabs = [
      (_SettingsTab.reports, 'Reports'),
      (_SettingsTab.preferences, t('settings')),
      (_SettingsTab.notifications, t('notifications')),
    ];
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: tabs.map((tab) {
          final selected = active == tab.$1;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(tab.$1),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: selected ? AppColors.primary : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  tab.$2,
                  textAlign: TextAlign.center,
                  style: AppTypography.smallMedium.copyWith(
                    color: selected ? AppColors.primary : AppColors.textMuted,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ReportsTab extends StatelessWidget {
  final VoidCallback onLogout;

  const _ReportsTab({required this.onLogout});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;
    final isGuest = context.watch<AuthBloc>().state.isGuest;
    final reports = state.myReports;

    if (isGuest) {
      return EmptyState(
        icon: '🔒',
        title: t('signInForReports'),
        subtitle: t('guestReportsSub'),
        actionLabel: t('login'),
        onAction: () => context.push('/login'),
      );
    }

    final active = reports
        .where((r) => const [
              'SUBMITTED',
              'UNDER_REVIEW',
              'ASSIGNED',
              'IN_PROGRESS',
            ].contains(r.status))
        .length;
    final resolved = reports
        .where((r) => const ['RESOLVED', 'CLOSED'].contains(r.status))
        .length;

    return RefreshIndicator(
      onRefresh: () async {
        context.read<ReportsBloc>().add(ReportsFetchMyRequested());
      },
      color: AppColors.primary,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'YOUR REPORTS',
                style: AppTypography.label.copyWith(
                  fontSize: 12,
                  letterSpacing: 0.5,
                  color: AppColors.textMuted,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'All Time ▾',
                  style: AppTypography.caption.copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (reports.isEmpty)
            const EmptyState(
              icon: '📭',
              title: 'No reports submitted yet',
            )
          else
            ...reports.take(8).map((r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ProfileReportRow(report: r),
                )),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryDark,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _SummaryStat(value: reports.length, label: 'Total Reports'),
                _SummaryStat(value: active, label: 'Active'),
                _SummaryStat(value: resolved, label: 'Resolved'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileReportRow extends StatelessWidget {
  final Report report;

  const _ProfileReportRow({required this.report});

  Color get _iconColor {
    final type = (report.violationType ?? '').toUpperCase();
    if (type.contains('ROBBERY') || type.contains('CRIME')) {
      return AppColors.danger;
    }
    if (type.contains('WEAPON') || type.contains('ILLEGAL')) {
      return AppColors.accent;
    }
    return AppColors.success;
  }

  IconData get _icon {
    final type = (report.violationType ?? '').toUpperCase();
    if (type.contains('ROBBERY') || type.contains('CRIME')) {
      return Icons.warning_amber_rounded;
    }
    if (type.contains('WEAPON') || type.contains('ILLEGAL')) {
      return Icons.shield_outlined;
    }
    return Icons.person_outline;
  }

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: () => context.push(
        '/report-detail/${report.id}?caseId=${report.caseId ?? ''}',
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: _iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Icon(_icon, size: 18, color: _iconColor),
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
                        report.typeLabel,
                        style: AppTypography.smallMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    StatusBadge(status: report.status),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '⏱ ${Formatters.timeAgo(report.createdAt)}',
                  style: AppTypography.caption,
                ),
                Text(
                  '📍 ${report.address ?? ''}',
                  style: AppTypography.caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryStat extends StatelessWidget {
  final int value;
  final String label;

  const _SummaryStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '$value',
          style: AppTypography.h2.copyWith(color: AppColors.white),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.primarySoft),
        ),
      ],
    );
  }
}

class _PreferencesTab extends StatelessWidget {
  final VoidCallback onLogout;

  const _PreferencesTab({required this.onLogout});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final langBloc = context.watch<LanguageBloc>();
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          t('selectLanguage'),
          style: AppTypography.label,
        ),
        const SizedBox(height: 8),
        AppCard(
          child: Column(
            children: [
              _LangRow(
                code: 'en',
                label: 'English',
                active: langBloc.state.lang == 'en',
              ),
              _LangRow(
                code: 'am',
                label: 'አማርኛ (Amharic)',
                active: langBloc.state.lang == 'am',
              ),
              _LangRow(
                code: 'om',
                label: 'Afaan Oromoo (Oromo)',
                active: langBloc.state.lang == 'om',
              ),
              _LangRow(
                code: 'ti',
                label: 'ትግርኛ (Tigrinya)',
                active: langBloc.state.lang == 'ti',
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(t('account'), style: AppTypography.label),
        const SizedBox(height: 8),
        AppCard(
          child: Column(
            children: [
              _SettingsRow(
                icon: Icons.lock_outline,
                label: t('changePin'),
                onTap: () => context.go('/change-pin'),
              ),
              const Divider(color: AppColors.divider, height: 1),
              _SettingsRow(
                icon: Icons.search,
                label: t('trackCase'),
                onTap: () => context.go('/track-case'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        AppButton(
          title: t('logOut'),
          variant: AppButtonVariant.danger,
          onPressed: onLogout,
        ),
      ],
    );
  }
}

class _LangRow extends StatelessWidget {
  final String code;
  final String label;
  final bool active;

  const _LangRow({required this.code, required this.label, required this.active});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.read<LanguageBloc>().setLanguage(code),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Text(label, style: AppTypography.bodyMedium),
            ),
            if (active)
              const Icon(Icons.check, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingsRow({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label, style: AppTypography.bodyMedium),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _NotificationsTab extends StatelessWidget {
  const _NotificationsTab();

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<NotificationsBloc>().state;
    final isGuest = context.watch<AuthBloc>().state.isGuest;
    final items = state.items;

    if (isGuest) {
      return EmptyState(
        icon: '🔕',
        title: t('signInForNotifications'),
        subtitle: t('guestNotificationsSub'),
        actionLabel: t('login'),
        onAction: () => context.push('/login'),
      );
    }

    if (items.isEmpty) {
      return const EmptyState(
        icon: '🔕',
        title: 'No notifications',
        subtitle: 'Updates about your reports will appear here.',
      );
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'NOTIFICATIONS',
              style: AppTypography.label.copyWith(
                fontSize: 12,
                letterSpacing: 0.5,
                color: AppColors.textMuted,
              ),
            ),
            if (state.unreadCount > 0)
              GestureDetector(
                onTap: () => context
                    .read<NotificationsBloc>()
                    .add(NotificationsMarkAllReadRequested()),
                child: Text(
                  t('markAllRead'),
                  style: AppTypography.smallMedium
                      .copyWith(color: AppColors.primary),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        ...items.take(15).map((n) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppCard(
                onTap: () {
                  if (!n.isRead) {
                    context
                        .read<NotificationsBloc>()
                        .add(NotificationsMarkReadRequested(n.id));
                  }
                  final reportId = n.data?['reportId'] as String?;
                  if (reportId != null) {
                    context.push(
                      '/report-detail/$reportId'
                      '?caseId=${n.data?['caseId'] ?? ''}',
                    );
                  }
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Icon(
                        Icons.notifications_none,
                        size: 18,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            n.title,
                            style: AppTypography.smallMedium.copyWith(
                              color: n.isRead
                                  ? AppColors.text
                                  : AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            n.message,
                            style: AppTypography.small,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            Formatters.timeAgo(n.createdAt),
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
                    ),
                    if (!n.isRead)
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
                ),
              ),
            )),
      ],
    );
  }
}