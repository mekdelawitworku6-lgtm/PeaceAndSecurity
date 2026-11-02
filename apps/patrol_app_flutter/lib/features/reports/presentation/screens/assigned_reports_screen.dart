import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../bloc/reports_bloc.dart';

class AssignedReportsScreen extends StatefulWidget {
  const AssignedReportsScreen({super.key});

  @override
  State<AssignedReportsScreen> createState() => _AssignedReportsScreenState();
}

class _AssignedReportsScreenState extends State<AssignedReportsScreen> {
  String _filter = 'All';

  static const _filters = [
    'All',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'ESCALATED',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(ReportsFetchAssignedRequested());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Text(
                'Assigned Reports',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 34,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: _filters.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final f = _filters[i];
                  final active = f == _filter;
                  return GestureDetector(
                    onTap: () => setState(() => _filter = f),
                    child: Container(
                      alignment: Alignment.center,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: active ? AppColors.primary : AppColors.card,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: active ? AppColors.primary : AppColors.border,
                        ),
                      ),
                      child: Text(
                        f == 'All' ? t('all') : f,
                        style: AppTypography.caption.copyWith(
                          color: active ? AppColors.white : AppColors.text,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: state.loading && state.assignedReports.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : _filtered(state.assignedReports).isEmpty
                      ? EmptyState(
                          iconData: Icons.assignment_outlined,
                          title: t('noReportsYet'),
                          subtitle: t('noReportsSub'),
                          actionLabel: t('refresh'),
                          onAction: () => context
                              .read<ReportsBloc>()
                              .add(ReportsFetchAssignedRequested()),
                        )
                      : RefreshIndicator(
                          onRefresh: () async => context
                              .read<ReportsBloc>()
                              .add(ReportsFetchAssignedRequested()),
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                            itemCount: _filtered(state.assignedReports).length,
                            itemBuilder: (context, i) {
                              final r = _filtered(state.assignedReports)[i];
                              return _ReportListItem(report: r);
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  List<dynamic> _filtered(List<dynamic> reports) {
    if (_filter == 'All') return reports;
    return reports.where((r) => r.status == _filter).toList();
  }
}

class _ReportListItem extends StatelessWidget {
  final dynamic report;

  const _ReportListItem({required this.report});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
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
                Icon(Icons.place_outlined,
                    size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    report.address ?? report.area ?? '—',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption,
                  ),
                ),
                if (report.distanceKm != null)
                  Text(
                    '${report.distanceKm!.toStringAsFixed(1)} km',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.schedule, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  Formatters.formatDateTime(report.createdAt),
                  style: AppTypography.caption,
                ),
                if (report.isEmergency) ...[
                  const Spacer(),
                  Text(
                    '🚨 ${t('emergency')}',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.danger,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}