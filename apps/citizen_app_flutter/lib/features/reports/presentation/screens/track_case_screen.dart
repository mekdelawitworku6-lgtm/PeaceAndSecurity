import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/models/report.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../bloc/reports_bloc.dart';

class TrackCaseScreen extends StatefulWidget {
  const TrackCaseScreen({super.key});

  @override
  State<TrackCaseScreen> createState() => _TrackCaseScreenState();
}

class _TrackCaseScreenState extends State<TrackCaseScreen> {
  final _caseId = TextEditingController();
  String? _error;
  Report? _report;
  bool _tracking = false;

  @override
  void dispose() {
    _caseId.dispose();
    super.dispose();
  }

  void _track() {
    final id = _caseId.text.trim().toUpperCase();
    if (id.isEmpty) {
      setState(() => _error = 'Enter a case ID, e.g. REP-123456.');
      return;
    }
    setState(() {
      _tracking = true;
      _error = null;
      _report = null;
    });
    context.read<ReportsBloc>().add(ReportsTrackRequested(id));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final auth = context.watch<AuthBloc>().state;
    final isSignedIn = auth.isSignedIn && !auth.isGuest;

    return BlocConsumer<ReportsBloc, ReportsState>(
      listenWhen: (prev, curr) =>
          _tracking && !curr.detailLoading && (curr.detail != null || curr.error != null),
      listener: (context, state) {
        if (!_tracking) return;
        setState(() {
          _tracking = false;
          _report = state.detail;
          _error = state.detail == null
              ? (state.error ?? 'Report not found. Check the case ID and try again.')
              : null;
        });
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: t('trackCase'), showBack: true),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(t('trackCaseSub'), style: AppTypography.body),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('caseId'),
                        hint: 'REP-123456',
                        controller: _caseId,
                        capitalization: TextCapitalization.characters,
                      ),
                      const SizedBox(height: 16),
                      if (_error != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfee2e2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _error!,
                            style: AppTypography.small.copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      AppButton(
                        title: t('trackCase'),
                        loading: _tracking,
                        onPressed: _track,
                      ),
                      if (_report != null) ...[
                        const SizedBox(height: 24),
                        _TrackedReportCard(
                          report: _report!,
                          isSignedIn: isSignedIn,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TrackedReportCard extends StatelessWidget {
  final Report report;
  final bool isSignedIn;

  const _TrackedReportCard({required this.report, required this.isSignedIn});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            report.caseId ?? '—',
            style: AppTypography.h2.copyWith(color: AppColors.primary),
          ),
          const SizedBox(height: 6),
          Text(report.typeLabel, style: AppTypography.smallMedium),
          const SizedBox(height: 8),
          StatusBadge(status: report.status),
          const SizedBox(height: 10),
          Text(
            report.address ?? 'Location not disclosed',
            style: AppTypography.small,
          ),
          const SizedBox(height: 4),
          Text(
            'Submitted ${Formatters.formatDateTime(report.createdAt)}',
            style: AppTypography.caption,
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: [
              if (report.isEmergency)
                Text('🚨 ${t('emergency')}', style: AppTypography.caption),
              if (report.isOngoing)
                Text('${t('ongoing')} ·', style: AppTypography.caption),
              Text(
                report.isAnonymous ? 'Anonymous report' : 'Identified reporter',
                style: AppTypography.caption,
              ),
            ],
          ),
          if (isSignedIn) ...[
            const SizedBox(height: 16),
            AppButton(
              title: 'Open full report',
              onPressed: () => context.go(
                '/report-detail/${report.id}?caseId=${report.caseId ?? ''}',
              ),
            ),
          ] else
            const SizedBox(height: 12),
          if (!isSignedIn)
            Text(
              'Log in to chat with the response team about this case.',
              style: AppTypography.caption,
            ),
        ],
      ),
    );
  }
}