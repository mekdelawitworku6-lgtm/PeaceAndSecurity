import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../bloc/reports_bloc.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(ReportsFetchMyRequested());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;
    final reports = state.myReports;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(
            title: t('reports'),
            showBack: false,
            right: GestureDetector(
              onTap: () => context.go('/create-report'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add, size: 14, color: AppColors.white),
                    const SizedBox(width: 2),
                    Text(
                      'Report Incident',
                      style: AppTypography.smallMedium.copyWith(
                        color: AppColors.white,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                context.read<ReportsBloc>().add(ReportsFetchMyRequested());
              },
              color: AppColors.primary,
              child: reports.isEmpty && state.loading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primary),
                    )
                  : reports.isEmpty
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: const [
                            SizedBox(height: 80),
                            EmptyState(
                              title: 'No reports submitted yet',
                              subtitle:
                                  'Use "Report Incident" to report security issues in your area.',
                            ),
                          ],
                        )
                      : ListView.builder(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.all(16),
                          itemCount: reports.length,
                          itemBuilder: (context, i) => _ReportListItem(
                            report: reports[i],
                            onTap: () => context.push(
                              '/report-detail/${reports[i].id}'
                              '?caseId=${reports[i].caseId ?? ''}',
                            ),
                          ),
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportListItem extends StatelessWidget {
  final Report report;
  final VoidCallback onTap;

  const _ReportListItem({required this.report, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
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
              '${report.caseId ?? '—'} · ${Formatters.formatDateTime(report.createdAt)}',
              style: AppTypography.caption,
            ),
            const SizedBox(height: 4),
            Text(
              report.address ??
                  '${report.latitude.toStringAsFixed(4)}, '
                  '${report.longitude.toStringAsFixed(4)}',
              style: AppTypography.small,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (report.isEmergency) ...[
              const SizedBox(height: 6),
              Text(
                'Emergency report',
                style: AppTypography.smallMedium.copyWith(color: AppColors.danger),
              ),
            ],
          ],
        ),
      ),
    );
  }
}