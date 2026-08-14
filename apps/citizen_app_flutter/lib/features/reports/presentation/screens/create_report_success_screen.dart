import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../../core/widgets/status_badge.dart';

class CreateReportSuccessScreen extends StatelessWidget {
  final String reportId;
  final String caseId;
  final String status;
  final double latitude;
  final double longitude;
  final String address;
  final String submittedOn;
  final String assignedTo;

  const CreateReportSuccessScreen({
    super.key,
    required this.reportId,
    required this.caseId,
    required this.status,
    this.latitude = 9.03,
    this.longitude = 38.74,
    this.address = '',
    this.submittedOn = '',
    this.assignedTo = '',
  });

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final displayCaseId = caseId.isEmpty ? 'PSB-2026-0564' : caseId;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(
                  onPressed: () => context.go('/home'),
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                ),
              ),
              const Spacer(),
              Center(
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 48,
                        color: AppColors.white,
                      ),
                    ),
                    Positioned(
                      right: -8,
                      top: -8,
                      child: Container(
                        width: 30,
                        height: 30,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: const Text(
                          '🎉',
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                t('reportSubmitted'),
                textAlign: TextAlign.center,
                style: AppTypography.h1,
              ),
              const SizedBox(height: 6),
              Text(
                t('reportSubmittedSub'),
                textAlign: TextAlign.center,
                style: AppTypography.body,
              ),
              const SizedBox(height: 24),
              AppCard(
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          t('reportId'),
                          style: AppTypography.label.copyWith(
                            fontSize: 11,
                            letterSpacing: 1,
                            color: AppColors.textMuted,
                          ),
                        ),
                        StatusBadge(status: status),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      displayCaseId,
                      style: AppTypography.h2.copyWith(color: AppColors.primary),
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: AppColors.divider),
                    const SizedBox(height: 12),
                    _MetaRow(
                      text: address.isEmpty
                          ? 'Bole Sub-City, Addis Ababa, Ethiopia'
                          : address,
                    ),
                    const SizedBox(height: 8),
                    _MetaRow(
                      text: submittedOn.isEmpty
                          ? t('submittedOn', {
                              'date': Formatters.formatDateTime(
                                  DateTime.now().toIso8601String()),
                            })
                          : t('submittedOn', {
                              'date': Formatters.formatDateTime(submittedOn),
                            }),
                    ),
                    const SizedBox(height: 8),
                    _MetaRow(text: assignedTo.isEmpty ? t('assignedTo') : assignedTo),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              AppButton(
                title: '↗ ${t('shareReport')}',
                onPressed: () {
                  // Share via platform share sheet
                  _share(context, displayCaseId);
                },
              ),
              const SizedBox(height: 12),
              AppButton(
                title: '🗺 ${t('viewOnMap')}',
                variant: AppButtonVariant.outline,
                onPressed: () async {
                  final url = 'https://www.google.com/maps/search/?api=1'
                      '&query=$latitude,$longitude';
                  final launched = await launchUrl(
                    Uri.parse(url),
                    mode: LaunchMode.externalApplication,
                  );
                  if (!launched && context.mounted) context.go('/map');
                },
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/home'),
                child: Text(
                  t('returnHome'),
                  style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  void _share(BuildContext context, String caseId) {
    final message =
        'I submitted a safety report on Addis Ababa Peace & Security. '
        'Case ID: $caseId';
    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Report details copied to clipboard')),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final String text;

  const _MetaRow({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 5,
          height: 5,
          decoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text, style: AppTypography.small),
        ),
      ],
    );
  }
}