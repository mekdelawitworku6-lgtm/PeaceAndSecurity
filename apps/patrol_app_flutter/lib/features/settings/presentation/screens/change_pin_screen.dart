import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/screen.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';

class ChangePinScreen extends StatefulWidget {
  const ChangePinScreen({super.key});

  @override
  State<ChangePinScreen> createState() => _ChangePinScreenState();
}

class _ChangePinScreenState extends State<ChangePinScreen> {
  final _current = TextEditingController();
  final _newPin = TextEditingController();
  final _confirm = TextEditingController();

  @override
  void dispose() {
    _current.dispose();
    _newPin.dispose();
    _confirm.dispose();
    super.dispose();
  }

  void _submit() {
    if (!RegExp(r'^\d{4,6}$').hasMatch(_current.text.trim())) {
      _showAlert('Invalid PIN', 'Enter your current 4-6 digit PIN.');
      return;
    }
    if (!RegExp(r'^\d{4,6}$').hasMatch(_newPin.text.trim())) {
      _showAlert('Invalid PIN', 'New PIN must be 4-6 digits.');
      return;
    }
    if (_newPin.text.trim() != _confirm.text.trim()) {
      _showAlert('PIN mismatch', 'The new PINs do not match.');
      return;
    }
    context.read<AuthBloc>().add(AuthChangePinRequested(
          currentPin: _current.text.trim(),
          newPin: _newPin.text.trim(),
        ));
  }

  void _showAlert(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (prev, curr) =>
          prev.status == AuthStatus.loading &&
          curr.status == AuthStatus.signedIn &&
          curr.message != null,
      listener: (context, state) {
        _showAlert('PIN updated', state.message ?? 'Your PIN has been changed successfully.');
        _current.clear();
        _newPin.clear();
        _confirm.clear();
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: t('changePin'), showBack: true),
              Expanded(
                child: Screen(
                  scroll: true,
                  keyboard: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
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
                            style: AppTypography.small
                                .copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Text(
                        'Your PIN is used to log in. Keep it secret.',
                        style: AppTypography.body,
                      ),
                      const SizedBox(height: 24),
                      AppInput(
                        label: 'Current PIN',
                        hint: '4-6 digits',
                        secure: true,
                        controller: _current,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: 'New PIN',
                        hint: '4-6 digits',
                        secure: true,
                        controller: _newPin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: 'Confirm new PIN',
                        hint: 'Repeat new PIN',
                        secure: true,
                        controller: _confirm,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: t('changePin'),
                        loading: state.status == AuthStatus.loading,
                        onPressed: _submit,
                      ),
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