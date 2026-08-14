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
        context.read<ReportsBloc>().add(ReportsFetchMyRequested());
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
    final name = user?.fullName.split(' ').firstOrNull ?? 'AAPSB';

    final recent = reports.myReports.take(3).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<ReportsBloc>().add(ReportsFetchMyRequested());
          context.read<NotificationsBloc>().add(NotificationsFetchUnreadRequested());
        },
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              _buildHeader(context, name, notifications.unreadCount, langBloc.state.lang),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _ActionCard(
                            icon: Icons.report_gmailerrorred,
                            title: t('reportIncident'),
                            sub: t('typesAvailable'),
                            onTap: () => context.go('/create-report'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _ActionCard(
                            icon: Icons.map_outlined,
                            title: t('viewIncidentMap'),
                            sub: t('activeMarks'),
                            onTap: () => context.go('/map'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(t('recentReports'), style: AppTypography.h3),
                        GestureDetector(
                          onTap: () => context.go('/reports'),
                          child: Text(
                            t('seeAll'),
                            style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (reports.loading && reports.myReports.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(
                          child: CircularProgressIndicator(color: AppColors.primary),
                        ),
                      )
                    else if (recent.isEmpty)
                      Card(
                        child: EmptyState(
                          icon: '📭',
                          title: t('noReportsYet'),
                          subtitle: t('noReportsSub'),
                          actionLabel: t('reportIncident'),
                          onAction: () => context.go('/create-report'),
                        ),
                      )
                    else
                      ...recent.map((r) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _RecentReportRow(
                              report: r,
                              onTap: () => context.push(
                                '/report-detail/${r.id}?caseId=${r.caseId ?? ''}',
                              ),
                            ),
                          )),
                    const SizedBox(height: 24),
                    Text(t('impactStats'), style: AppTypography.h3),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            value: '1,284',
                            label: t('reportsThisMonth'),
                            delta: '+12% vs last month',
                            color: AppColors.success,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            value: '1.8h',
                            label: t('avgResponseTime'),
                            delta: '-14m improvement',
                            color: AppColors.info,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    String name,
    int unreadCount,
    String lang,
  ) {
    final t = context.l10n().t;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
      decoration: const BoxDecoration(
        color: AppColors.primaryDark,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 21,
            backgroundColor: Colors.white.withValues(alpha: 0.15),
            child: const Icon(Icons.shield_outlined, color: AppColors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _greeting().replaceAll('{name}', name),
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.white,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  t('addisAbabaCitizens'),
                  style: AppTypography.caption.copyWith(color: AppColors.primarySoft),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: _showLanguageModal,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                lang.toUpperCase(),
                style: AppTypography.smallMedium.copyWith(color: AppColors.white),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                onPressed: () => context.go('/notifications'),
                icon: const Icon(Icons.notifications_none, color: AppColors.white, size: 24),
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: AppColors.danger,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      unreadCount > 9 ? '9+' : '$unreadCount',
                      style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _showLanguageModal() {
    setState(() {});
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final l10n = ctx.l10n();
        final langBloc = ctx.read<LanguageBloc>();
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(l10n.t('selectLanguage'), style: AppTypography.h3),
                const SizedBox(height: 16),
                ...['en', 'am', 'om'].map((code) {
                  final label = switch (code) {
                    'en' => 'English',
                    'am' => 'አማርኛ (Amharic)',
                    'om' => 'Afaan Oromoo (Oromo)',
                    _ => code,
                  };
                  final active = langBloc.state.lang == code;
                  return ListTile(
                    title: Text(label, style: AppTypography.bodyMedium),
                    trailing: active
                        ? const Icon(Icons.check, color: AppColors.primary)
                        : null,
                    onTap: () {
                      langBloc.setLanguage(code);
                      Navigator.pop(ctx);
                    },
                  );
                }),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(
                    l10n.t('close'),
                    style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

extension _FirstOrNull on List<String> {
  String? get firstOrNull => isEmpty ? null : first;
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String sub;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.sub,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 125,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.primaryDark,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.white, size: 20),
            ),
            const Spacer(),
            Text(
              title,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.white,
                fontSize: 14,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: AppTypography.caption.copyWith(color: AppColors.primarySoft),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentReportRow extends StatelessWidget {
  final Report report;
  final VoidCallback onTap;

  const _RecentReportRow({required this.report, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
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
          const SizedBox(height: 6),
          Text(
            '${Formatters.timeAgo(report.createdAt)} • '
            '${report.address ?? 'Meskel Square, Addis Ababa'}',
            style: AppTypography.caption,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final String delta;
  final Color color;

  const _StatCard({
    required this.value,
    required this.label,
    required this.delta,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: AppTypography.h2.copyWith(color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(label, style: AppTypography.small),
          const SizedBox(height: 6),
          Text(
            delta,
            style: AppTypography.caption.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}