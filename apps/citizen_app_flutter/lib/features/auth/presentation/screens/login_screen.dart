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

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phone = TextEditingController();
  final _pin = TextEditingController();

  @override
  void dispose() {
    _phone.dispose();
    _pin.dispose();
    super.dispose();
  }

  void _submit() {
    if (_phone.text.trim().isEmpty || _pin.text.trim().isEmpty) {
      _showAlert('Missing info', 'Please enter your phone number and PIN.');
      return;
    }
    context.read<AuthBloc>().add(AuthLoginRequested(
          phoneNumber: _phone.text.trim(),
          pin: _pin.text.trim(),
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
      listenWhen: (prev, curr) => curr.isSignedIn,
      listener: (context, state) => context.go('/home'),
      builder: (context, state) {
        final error = state.error;
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(
                title: 'Login',
                showBack: true,
                onBack: () => context.go('/welcome'),
              ),
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
                            style: AppTypography.small.copyWith(color: AppColors.danger),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Text(t('welcomeBack'), style: AppTypography.h2),
                      const SizedBox(height: 4),
                      Text(t('loginSub'), style: AppTypography.body),
                      const SizedBox(height: 24),
                      AppInput(
                        label: t('phoneNumber'),
                        hint: '+251911000031',
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        onChanged: (_) =>
                            context.read<AuthBloc>().add(AuthErrorCleared()),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('pin'),
                        hint: '4-6 digit PIN',
                        secure: true,
                        controller: _pin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        onChanged: (_) =>
                            context.read<AuthBloc>().add(AuthErrorCleared()),
                      ),
                      const SizedBox(height: 24),
                      AppButton(
                        title: 'Login',
                        loading: state.status == AuthStatus.loading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(t('newHere'), style: AppTypography.small),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () => context.go('/register'),
                            child: Text(
                              'Create an account',
                              style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                            ),
                          ),
                        ],
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