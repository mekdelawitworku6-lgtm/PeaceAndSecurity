import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/screen.dart';
import '../bloc/auth_bloc.dart';

class ForgotPinScreen extends StatefulWidget {
  final String initialPhone;

  const ForgotPinScreen({super.key, this.initialPhone = ''});

  @override
  State<ForgotPinScreen> createState() => _ForgotPinScreenState();
}

class _ForgotPinScreenState extends State<ForgotPinScreen> {
  final _phone = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<AuthBloc>().add(AuthErrorCleared());
    final digits = widget.initialPhone.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 9) _phone.text = digits;
  }

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  String _normalizePhone(String input) {
    var digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('251')) digits = digits.substring(3);
    if (digits.startsWith('0')) digits = digits.substring(1);
    return '${AppConfig.etPhoneCountryCode}$digits';
  }

  void _showAlert(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(context.l10n().t('invalidInput')),
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

  void _submit() {
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length != 9) {
      _showAlert(context.l10n().t('invalidPhone'));
      return;
    }
    context.read<AuthBloc>().add(AuthPinResetRequested(
          phoneNumber: _normalizePhone(digits),
        ));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (prev, curr) =>
          curr.pinResetToken != null &&
          curr.pinResetToken!.isNotEmpty &&
          curr.pinResetToken != prev.pinResetToken,
      listener: (context, state) {
        final token = state.pinResetToken!;
        final phone = state.pinResetPhone ?? _normalizePhone(_phone.text);
        context.go(Uri(
          path: '/reset-pin',
          queryParameters: {
            'resetToken': token,
            'phoneNumber': phone,
          },
        ).toString());
      },
      builder: (context, state) {
        final error = state.error;
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: t('forgotPin'), showBack: true),
              Expanded(
                child: Screen(
                  scroll: true,
                  keyboard: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (error != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfee2e2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            error,
                            style: AppTypography.small
                                .copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Text(t('forgotPin'), style: AppTypography.h2),
                      const SizedBox(height: 4),
                      Text(t('forgotPinSub'), style: AppTypography.body),
                      const SizedBox(height: 24),
                      AppInput(
                        label: t('phoneNumber'),
                        hint: '9XXXXXXXX',
                        prefixText: AppConfig.etPhoneCountryCode,
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        maxLength: 9,
                        onChanged: (_) =>
                            context.read<AuthBloc>().add(AuthErrorCleared()),
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: t('sendResetCode'),
                        loading: state.status == AuthStatus.loading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 16),
                      Align(
                        alignment: Alignment.center,
                        child: GestureDetector(
                          onTap: () => context.go('/login'),
                          child: Text(
                            t('login'),
                            style: AppTypography.smallMedium
                                .copyWith(color: AppColors.primary),
                          ),
                        ),
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

class ResetPinScreen extends StatefulWidget {
  final String resetToken;
  final String phoneNumber;

  const ResetPinScreen({
    super.key,
    required this.resetToken,
    required this.phoneNumber,
  });

  @override
  State<ResetPinScreen> createState() => _ResetPinScreenState();
}

class _ResetPinScreenState extends State<ResetPinScreen> {
  final _otp = TextEditingController();
  final _newPin = TextEditingController();
  final _confirmPin = TextEditingController();
  late String _resetToken;
  bool _codeResent = false;

  @override
  void initState() {
    super.initState();
    _resetToken = widget.resetToken;
  }

  @override
  void dispose() {
    _otp.dispose();
    _newPin.dispose();
    _confirmPin.dispose();
    super.dispose();
  }

  void _showAlert(String message) {
    final t = context.l10n().t;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t('invalidInput')),
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

  void _clearFeedback() {
    context.read<AuthBloc>().add(AuthErrorCleared());
    if (_codeResent) setState(() => _codeResent = false);
  }

  void _submit() {
    final t = context.l10n().t;
    final code = _otp.text.trim();
    final pin = _newPin.text.trim();
    final confirm = _confirmPin.text.trim();

    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      _showAlert(t('invalidCode'));
      return;
    }
    if (!RegExp(r'^\d{6}$').hasMatch(pin)) {
      _showAlert(t('invalidPin'));
      return;
    }
    if (pin != confirm) {
      _showAlert(t('pinMismatch'));
      return;
    }
    if (_resetToken.isEmpty) {
      context.go('/forgot-pin');
      return;
    }
    context.read<AuthBloc>().add(AuthPinResetConfirmRequested(
          resetToken: _resetToken,
          otpCode: code,
          newPin: pin,
        ));
  }

  void _resend() {
    if (widget.phoneNumber.isEmpty) {
      context.go('/forgot-pin');
      return;
    }
    context.read<AuthBloc>().add(AuthPinResetRequested(
          phoneNumber: widget.phoneNumber,
        ));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return BlocConsumer<AuthBloc, AuthState>(
      listenWhen: (prev, curr) =>
          (curr.pinResetToken != null &&
              curr.pinResetToken!.isNotEmpty &&
              curr.pinResetToken != prev.pinResetToken) ||
          (curr.pinResetDone && !prev.pinResetDone),
      listener: (context, state) {
        final token = state.pinResetToken;
        if (token != null && token.isNotEmpty && token != _resetToken) {
          setState(() {
            _resetToken = token;
            _codeResent = true;
          });
          context.read<AuthBloc>().add(AuthErrorCleared());
          return;
        }
        if (state.pinResetDone) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) => AlertDialog(
              title: Text(t('resetPin')),
              content: Text(t('pinResetSuccess')),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.read<AuthBloc>().add(AuthErrorCleared());
                    context.go('/login');
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      },
      builder: (context, state) {
        final error = state.error;
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(title: t('resetPin'), showBack: true),
              Expanded(
                child: Screen(
                  scroll: true,
                  keyboard: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (error != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFfee2e2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            error,
                            style: AppTypography.small
                                .copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      if (_codeResent) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primarySoft,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            t('resetCodeSent'),
                            style: AppTypography.small
                                .copyWith(color: AppColors.primary),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Text(t('resetPin'), style: AppTypography.h2),
                      const SizedBox(height: 4),
                      Text(
                        t('resetPinSub', {'phone': widget.phoneNumber}),
                        style: AppTypography.body,
                      ),
                      const SizedBox(height: 24),
                      AppInput(
                        label: t('verificationCode'),
                        hint: '123456',
                        controller: _otp,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        autoFocus: true,
                        onChanged: (_) => _clearFeedback(),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('newPin'),
                        hint: '6-digit PIN',
                        secure: true,
                        controller: _newPin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        onChanged: (_) => _clearFeedback(),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('confirmNewPin'),
                        hint: '6-digit PIN',
                        secure: true,
                        controller: _confirmPin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        onChanged: (_) => _clearFeedback(),
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: t('verifyContinue'),
                        loading: state.status == AuthStatus.loading,
                        onPressed: _submit,
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
