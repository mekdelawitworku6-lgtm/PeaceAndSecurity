import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/screen.dart';
import '../bloc/reports_bloc.dart';

class EscalateScreen extends StatefulWidget {
  final String reportId;
  final String? caseId;

  const EscalateScreen({
    super.key,
    required this.reportId,
    this.caseId,
  });

  @override
  State<EscalateScreen> createState() => _EscalateScreenState();
}

class _EscalateScreenState extends State<EscalateScreen> {
  final _notes = TextEditingController();

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  void _submit() {
    final notes = _notes.text.trim();
    if (notes.isEmpty) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Notes required'),
          content: const Text('Please explain why this report is being escalated.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }
    context.read<ReportsBloc>().add(ReportsEscalateRequested(
          reportId: widget.reportId,
          notes: notes,
        ));
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<ReportsBloc>().state;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          AppHeader(
            title: 'Escalate Report',
            subtitle: widget.caseId ?? widget.reportId,
            showBack: true,
          ),
          Expanded(
            child: Screen(
              scroll: true,
              keyboard: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Escalation notes (required)',
                    style: AppTypography.label,
                  ),
                  const SizedBox(height: 8),
                  AppInput(
                    label: '',
                    hint: 'Explain why this report needs higher-level attention…',
                    controller: _notes,
                    multiline: true,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Escalating sends this report to your supervising office for review.',
                    style: AppTypography.small.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                  if (state.error != null) ...[
                    const SizedBox(height: 12),
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
                  ],
                  const SizedBox(height: 24),
                  AppButton(
                    title: 'Escalate',
                    variant: AppButtonVariant.danger,
                    loading: state.actionLoading,
                    onPressed: _submit,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}