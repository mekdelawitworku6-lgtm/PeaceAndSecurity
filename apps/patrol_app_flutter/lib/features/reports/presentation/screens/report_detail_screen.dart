import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/audio_player_widget.dart';
import '../../../../core/widgets/media_thumb.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../chat/data/repositories/chat_repository.dart';
import '../bloc/reports_bloc.dart';

class ReportDetailScreen extends StatefulWidget {
  final String reportId;
  final String? caseId;

  const ReportDetailScreen({
    super.key,
    required this.reportId,
    this.caseId,
  });

  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  bool _chatting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ReportsBloc>().add(ReportsFetchDetailRequested(widget.reportId));
        context.read<ReportsBloc>().add(ReportsFetchHistoryRequested(widget.reportId));
      }
    });
  }

  Future<void> _openChat(String caseId, String typeLabel) async {
    setState(() => _chatting = true);
    try {
      final conv = await ChatRepository().openConversation(widget.reportId);
      if (mounted) {
        context.go('/chat/${conv.id}?title=${Uri.encodeComponent('$caseId · $typeLabel')}');
      }
    } catch (e) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Chat unavailable'),
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _chatting = false);
    }
  }

  void _confirmAction({
    required String title,
    required String message,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              onConfirm();
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final state = context.watch<ReportsBloc>().state;
    final report = state.detail;
    final logs = state.history;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(
            title: report?.caseId ?? widget.caseId ?? 'Report Detail',
            subtitle: report?.typeLabel,
          ),
          Expanded(
            child: report == null
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            StatusBadge(status: report.status),
                            if (report.isEmergency) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.danger.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  '🚨 EMERGENCY',
                                  style: AppTypography.smallMedium.copyWith(
                                    color: AppColors.danger,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (report.reporter != null &&
                            !report.isAnonymous) ...[
                          AppCard(
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: AppColors.primarySoft,
                                  child: Text(
                                    (report.reporter!.fullName ?? 'R')
                                        .substring(0, 1)
                                        .toUpperCase(),
                                    style: AppTypography.smallMedium.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        report.reporter!.fullName ??
                                            t('anonymousReporter'),
                                        style: AppTypography.smallMedium,
                                      ),
                                      if (report.reporter!.phoneNumber != null)
                                        Text(
                                          report.reporter!.phoneNumber!,
                                          style: AppTypography.caption,
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        if (report.imageUrls.isNotEmpty) ...[
                          _SectionTitle('Photos'),
                          const SizedBox(height: 8),
                          _MediaGrid(urls: report.imageUrls, kind: 'image'),
                          const SizedBox(height: 16),
                        ],
                        if (report.videoUrls.isNotEmpty) ...[
                          _SectionTitle('Videos'),
                          const SizedBox(height: 8),
                          _MediaGrid(urls: report.videoUrls, kind: 'video'),
                          const SizedBox(height: 16),
                        ],
                        if (report.audioUrls.isNotEmpty) ...[
                          _SectionTitle('Audio evidence'),
                          const SizedBox(height: 8),
                          ...List.generate(report.audioUrls.length, (i) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: AudioPlayerWidget(
                                  url: report.audioUrls[i],
                                  title: 'Recording ${i + 1}',
                                ),
                              )),
                          const SizedBox(height: 8),
                        ],
                        if (report.patrolImageUrls.isNotEmpty) ...[
                          _SectionTitle('Patrol photos'),
                          const SizedBox(height: 8),
                          _MediaGrid(urls: report.patrolImageUrls, kind: 'image'),
                          const SizedBox(height: 16),
                        ],
                        if (report.patrolAudioUrls.isNotEmpty) ...[
                          _SectionTitle('Patrol recordings'),
                          const SizedBox(height: 8),
                          ...List.generate(report.patrolAudioUrls.length, (i) =>
                              Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: AudioPlayerWidget(
                                  url: report.patrolAudioUrls[i],
                                  title: 'Patrol recording ${i + 1}',
                                ),
                              )),
                          const SizedBox(height: 8),
                        ],
                        AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _DetailRow('Type', report.typeLabel),
                              _DetailRow(t('address'), report.address ?? '—'),
                              _DetailRow(t('area'), report.area ?? '—'),
                              if (report.distanceKm != null)
                                _DetailRow(
                                  'Distance',
                                  '${report.distanceKm!.toStringAsFixed(2)} km',
                                ),
                              _DetailRow(
                                t('incident'),
                                Formatters.formatDateTime(report.incidentDateTime),
                              ),
                              _DetailRow(
                                t('reported'),
                                Formatters.formatDateTime(report.createdAt),
                              ),
                              _DetailRow(
                                t('anonymous'),
                                report.isAnonymous ? 'Yes' : 'No',
                              ),
                              if (report.decibelLevel != null)
                                _DetailRow(
                                  t('noiseLevel'),
                                  '${report.decibelLevel} dB '
                                  '(${report.noiseAreaType ?? '—'})',
                                ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                children: [
                                  if (report.isOngoing)
                                    _FlagChip(t('ongoing')),
                                  if (report.isEmergency)
                                    _FlagChip(
                                      t('emergency'),
                                      color: AppColors.danger,
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (report.reportDescription != null &&
                            report.reportDescription!.isNotEmpty) ...[
                          AppCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _SectionTitle(t('description')),
                                const SizedBox(height: 8),
                                Text(
                                  report.reportDescription!,
                                  style: AppTypography.body,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _SectionTitle(t('peopleInvolved')),
                              const SizedBox(height: 8),
                              if (report.suspectInfo != null ||
                                  report.victimInfo != null ||
                                  report.witnessInfo != null) ...[
                                if (report.suspectInfo != null)
                                  _DetailRow(t('suspect'), report.suspectInfo!),
                                if (report.victimInfo != null)
                                  _DetailRow(t('victim'), report.victimInfo!),
                                if (report.witnessInfo != null)
                                  _DetailRow(t('witness'), report.witnessInfo!),
                              ] else
                                Text(
                                  t('noDetailsProvided'),
                                  style: AppTypography.small.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (report.patrolNotes != null &&
                            report.patrolNotes!.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          AppCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _SectionTitle('Patrol notes'),
                                const SizedBox(height: 8),
                                Text(
                                  report.patrolNotes!,
                                  style: AppTypography.body,
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 12),
                        AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _SectionTitle(t('timeline')),
                              const SizedBox(height: 12),
                              if (logs.isEmpty)
                                Text(
                                  t('noTimeline'),
                                  style: AppTypography.small.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                )
                              else
                                ...List.generate(logs.length, (i) {
                                  final log = logs[i];
                                  final isFirst = i == 0;
                                  return IntrinsicHeight(
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: [
                                        Column(
                                          children: [
                                            Container(
                                              width: 10,
                                              height: 10,
                                              margin: const EdgeInsets.only(top: 4),
                                              decoration: BoxDecoration(
                                                color: isFirst
                                                    ? AppColors.primary
                                                    : AppColors.border,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            if (i != logs.length - 1)
                                              Expanded(
                                                child: Container(
                                                  width: 2,
                                                  color: AppColors.divider,
                                                ),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Padding(
                                            padding: const EdgeInsets.only(
                                                bottom: 16),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  Formatters.statusLabel(
                                                      log.status),
                                                  style: AppTypography.smallMedium,
                                                ),
                                                if (log.note != null &&
                                                    log.note!.isNotEmpty)
                                                  Text(
                                                    log.note!,
                                                    style: AppTypography.small,
                                                  ),
                                                Text(
                                                  Formatters.formatDateTime(
                                                      log.createdAt),
                                                  style: AppTypography.caption,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (state.actionMessage != null) ...[
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              state.actionMessage!,
                              style: AppTypography.smallMedium.copyWith(
                                color: AppColors.success,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        if (state.error != null) ...[
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFfee2e2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              state.error!,
                              style: AppTypography.small.copyWith(
                                color: AppColors.danger,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        _buildActionButtons(state, report),
                        const SizedBox(height: 12),
                        AppButton(
                          title: '💬 ${t('chatAboutReport')}',
                          variant: AppButtonVariant.ghost,
                          loading: _chatting,
                          onPressed: () => _openChat(
                            report.caseId ?? 'Report',
                            report.typeLabel,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(ReportsState state, dynamic report) {
    final status = report.status;
    final canAccept = status == 'SUBMITTED' || status == 'ASSIGNED';
    final canFollowUp = status == 'IN_PROGRESS' || status == 'RESOLVED';
    final canClose = status == 'IN_PROGRESS' || status == 'RESOLVED';
    final canEscalate = status == 'IN_PROGRESS' || status == 'ASSIGNED';

    return Column(
      children: [
        if (canAccept)
          AppButton(
            title: '✅ Accept Report',
            loading: state.actionLoading,
            onPressed: () => _confirmAction(
              title: 'Accept report',
              message: 'Accepting this report assigns it to you. Proceed?',
              onConfirm: () => context
                  .read<ReportsBloc>()
                  .add(ReportsAcceptRequested(report.id)),
            ),
          ),
        if (canFollowUp) ...[
          if (canAccept) const SizedBox(height: 10),
          AppButton(
            title: '📋 Submit Follow-up',
            loading: state.actionLoading,
            onPressed: () => context.push(
              '/follow-up/${report.id}?caseId=${report.caseId ?? ''}',
            ),
          ),
        ],
        if (canClose) ...[
          const SizedBox(height: 10),
          AppButton(
            title: '🚫 Close Report',
            variant: AppButtonVariant.outline,
            loading: state.actionLoading,
            onPressed: () => _confirmAction(
              title: 'Close report',
              message: 'Are you sure you want to close this report?',
              onConfirm: () => context
                  .read<ReportsBloc>()
                  .add(ReportsCloseRequested(report.id)),
            ),
          ),
        ],
        if (canEscalate) ...[
          const SizedBox(height: 10),
          AppButton(
            title: '⬆ Escalate Report',
            variant: AppButtonVariant.ghost,
            loading: state.actionLoading,
            onPressed: () => context.push(
              '/escalate/${report.id}?caseId=${report.caseId ?? ''}',
            ),
          ),
        ],
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: AppTypography.label.copyWith(
        fontSize: 12,
        letterSpacing: 0.5,
        color: AppColors.textMuted,
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: AppTypography.caption),
          ),
          Expanded(
            child: Text(value, style: AppTypography.small),
          ),
        ],
      ),
    );
  }
}

class _FlagChip extends StatelessWidget {
  final String text;
  final Color? color;

  const _FlagChip(this.text, {this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: (color ?? AppColors.primary).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: AppTypography.caption.copyWith(
          color: color ?? AppColors.primary,
        ),
      ),
    );
  }
}

class _MediaGrid extends StatelessWidget {
  final List<String> urls;
  final String kind;

  const _MediaGrid({required this.urls, required this.kind});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: urls
          .map((u) => MediaThumb(uri: u, kind: kind, size: 96))
          .toList(),
    );
  }
}