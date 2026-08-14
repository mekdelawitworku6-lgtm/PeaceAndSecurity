import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../notifications/presentation/bloc/notifications_bloc.dart';
import '../../../reports/presentation/bloc/reports_bloc.dart';
import '../../../settings/presentation/bloc/language_bloc.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(ReportsFetchAssignedRequested());
        context.read<NotificationsBloc>().add(NotificationsFetchUnreadRequested());
      }
    });
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning, {name}';
    if (hour < 17) return 'Good Afternoon, {name}';
    return 'Good Evening, {name}';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n();
    final t = l10n.t;
    final auth = context.watch<AuthBloc>().state;
    final reports = context.watch<ReportsBloc>().state;
    final notifications = context.watch<NotificationsBloc>().state;
    final langBloc = context.watch<LanguageBloc>();
    final user = auth.user;
    final name = user?.fullName.split(' ').firstOrNull ?? 'Officer';

    final assigned = reports.assignedReports;
    final inProgress =
        assigned.where((r) => r.status == 'IN_PROGRESS').length;
    final resolved = assigned.where((r) => r.status == 'RESOLVED').length;
    final closed = assigned.where((r) => r.status == 'CLOSED').length;
    final recent = assigned.take(3).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<ReportsBloc>().add(ReportsFetchAssignedRequested());
          context.read<NotificationsBloc>().add(NotificationsFetchUnreadRequested());
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _greeting().replaceFirst('{name}', name),
                        style: AppTypography.h3,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.assignedArea ?? t('patrolOfficer'),
                        style: AppTypography.small.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/notifications'),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          shape: BoxShape.circle,
                          boxShadow: AppShadows.card,
                        ),
                        child: Icon(
                          Icons.notifications_outlined,
                          color: AppColors.text,
                        ),
                      ),
                      if (notifications.unreadCount > 0)
                        Positioned(
                          top: -4,
                          right: -4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppColors.danger,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 18,
                              minHeight: 18,
                            ),
                            child: Center(
                              child: Text(
                                notifications.unreadCount > 99
                                    ? '99+'
                                    : '${notifications.unreadCount}',
                                style: AppTypography.caption.copyWith(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _StatGrid(
              total: assigned.length,
              inProgress: inProgress,
              resolved: resolved,
              closed: closed,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Text(
                  'Quick Actions',
                  style: AppTypography.h3,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _QuickAction(
                    icon: Icons.location_searching,
                    label: 'Nearby Reports',
                    color: AppColors.accent,
                    onTap: () => context.go('/nearby'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.assignment_outlined,
                    label: 'My Assigned',
                    color: AppColors.primary,
                    onTap: () => context.go('/assigned'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuickAction(
                    icon: Icons.chat_bubble_outline,
                    label: 'Inbox',
                    color: AppColors.info,
                    onTap: () => context.go('/conversations'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: Text('Recent Assigned', style: AppTypography.h3),
                ),
                TextButton(
                  onPressed: () => context.go('/assigned'),
                  child: Text(
                  'View all',
                  style: AppTypography.smallMedium.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            if (recent.isEmpty)
              EmptyState(
                iconData: Icons.assignment_outlined,
                title: 'No assigned reports',
                subtitle: t('noReportsSub'),
                actionLabel: t('refresh'),
                onAction: () =>
                    context.read<ReportsBloc>().add(ReportsFetchAssignedRequested()),
              )
            else
              ...recent.map(
                (r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _RecentReportCard(report: r),
                ),
              ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                '${langBloc.currentLanguage} · ${AppVersion.version}',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppVersion {
  static const String version = 'v1.0.0';
}

class _StatGrid extends StatelessWidget {
  final int total;
  final int inProgress;
  final int resolved;
  final int closed;

  const _StatGrid({
    required this.total,
    required this.inProgress,
    required this.resolved,
    required this.closed,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Assigned',
            value: total,
            icon: Icons.assignment_outlined,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'In Progress',
            value: inProgress,
            icon: Icons.work_outline,
            color: AppColors.accent,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'Resolved',
            value: resolved,
            icon: Icons.check_circle_outline,
            color: AppColors.success,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'Closed',
            value: closed,
            icon: Icons.lock_outline,
            color: AppColors.info,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 8),
          Text(
            '$value',
            style: AppTypography.h2.copyWith(color: color),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTypography.caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppShadows.card,
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: color),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentReportCard extends StatelessWidget {
  final Report report;

  const _RecentReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(14),
      onTap: () => context.push(
        '/report-detail/${report.id}?caseId=${report.caseId ?? ''}',
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  report.caseId ?? 'Report',
                  style: AppTypography.smallMedium,
                ),
              ),
              StatusBadge(status: report.status),
            ],
          ),
          const SizedBox(height: 6),
          if (report.reportDescription != null &&
              report.reportDescription!.isNotEmpty) ...[
            Text(
              report.reportDescription!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.small,
            ),
            const SizedBox(height: 6),
          ],
          Row(
            children: [
              Icon(Icons.place_outlined, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  report.address ?? report.area ?? '—',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption,
                ),
              ),
              Text(
                Formatters.formatDateTime(report.createdAt),
                style: AppTypography.caption,
              ),
            ],
          ),
        ],
      ),
    );
  }
}