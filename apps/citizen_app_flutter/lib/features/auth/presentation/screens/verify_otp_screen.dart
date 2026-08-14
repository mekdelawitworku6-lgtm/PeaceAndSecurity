import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/screen.dart';
import '../bloc/auth_bloc.dart';

class VerifyOtpScreen extends StatefulWidget {
  final String registrationToken;
  final String phoneNumber;
  final String pin;
  final String devOtp;

  const VerifyOtpScreen({
    super.key,
    required this.registrationToken,
    required this.phoneNumber,
    required this.pin,
    this.devOtp = '',
  });

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final _otp = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.devOtp.isNotEmpty) {
      _otp.text = widget.devOtp;
    }
  }

  @override
  void dispose() {
    _otp.dispose();
    super.dispose();
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

  void _verify() {
    final code = _otp.text.trim();
    if (!RegExp(r'^\d{4,6}$').hasMatch(code)) {
      _showAlert('Invalid code', 'Enter the 4-6 digit verification code.');
      return;
    }
    context.read<AuthBloc>().add(AuthVerifyRegistrationRequested(
          registrationToken: widget.registrationToken,
          otpCode: code,
          pin: widget.pin,
        ));
  }

  void _resend() {
    context.read<AuthBloc>().add(AuthResendOtpRequested(
          registrationToken: widget.registrationToken,
        ));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (prev, curr) => curr.isSignedIn,
      listener: (context, state) {
        if (state.message != null) {
          _showAlert('Code sent', state.message!);
          context.read<AuthBloc>().add(AuthErrorCleared());
        } else {
          context.go('/home');
        }
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: t('verifyPhone'), showBack: true),
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
                            style: AppTypography.small.copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      RichText(
                        text: TextSpan(
                          style: AppTypography.body,
                          children: [
                            TextSpan(
                              text: t('verifySub', {
                                'phone': widget.phoneNumber,
                              }),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      widget.devOtp.isEmpty
                          ? Text(t('devCodeHint'), style: AppTypography.caption)
                          : Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.primarySoft,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Dev code auto-filled: ${widget.devOtp}',
                                style: AppTypography.smallMedium.copyWith(
                                    color: AppColors.primary),
                              ),
                            ),
                      const SizedBox(height: 24),
                      AppInput(
                        label: t('verificationCode'),
                        hint: '123456',
                        controller: _otp,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        autoFocus: true,
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: t('verifyContinue'),
                        loading: state.status == AuthStatus.loading,
                        onPressed: _verify,
                      ),
                      const SizedBox(height: 12),
                      AppButton(
                        title: t('resendCode'),
                        variant: AppButtonVariant.outline,
                        onPressed: _resend,
                      ),
                      const SizedBox(height: 16),
                      Text(t('verifyHint'), style: AppTypography.caption),
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