import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_header.dart';
import '../../../../core/widgets/app_input.dart';
import '../../../../core/widgets/screen.dart';
import '../bloc/auth_bloc.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullName = TextEditingController();
  final _phoneNumber = TextEditingController();
  final _pin = TextEditingController();
  final _confirmPin = TextEditingController();
  PickedMedia? _profileImage;

  @override
  void dispose() {
    _fullName.dispose();
    _phoneNumber.dispose();
    _pin.dispose();
    _confirmPin.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final images = await MediaHelpers.pickImages(1);
    if (images.isNotEmpty) {
      setState(() => _profileImage = images.first);
    }
  }

  String _normalizePhone(String input) {
    var digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('251')) digits = digits.substring(3);
    if (digits.startsWith('0')) digits = digits.substring(1);
    return '+251$digits';
  }

  Future<void> _submit() async {
    final name = _fullName.text.trim();
    final phone = _normalizePhone(_phoneNumber.text.trim());
    final pin = _pin.text.trim();
    final confirm = _confirmPin.text.trim();

    if (name.length < 3) {
      _showAlert('Missing info', 'Please enter your full name.');
      return;
    }
    if (!RegExp(r'^\+?[0-9]{9,15}$').hasMatch(phone)) {
      _showAlert('Invalid phone', 'Enter a valid phone number, e.g. +251911000031.');
      return;
    }
    if (!RegExp(r'^\d{4,6}$').hasMatch(pin)) {
      _showAlert('Invalid PIN', 'PIN must be 4-6 digits.');
      return;
    }
    if (pin != confirm) {
      _showAlert('PIN mismatch', 'The two PINs do not match.');
      return;
    }

    final bloc = context.read<AuthBloc>();
    bloc.add(AuthRegisterRequested(
      fullName: name,
      phoneNumber: phone,
      pin: pin,
      profileImage: _profileImage,
    ));
    final state = bloc.state;
    final token = state.registrationToken;
    if (token != null) {
      context.go('/verify-otp?registrationToken=$token&phoneNumber=$phone&pin=$pin');
    }
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
          curr.registrationToken != null && prev.registrationToken == null,
      listener: (context, state) {
        final token = state.registrationToken;
        if (token != null) {
          context.go(
            '/verify-otp?registrationToken=$token'
            '&phoneNumber=${Uri.encodeComponent(state.pendingPhone ?? '')}'
            '&pin=${Uri.encodeComponent(state.pendingPin ?? '')}',
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          backgroundColor: AppColors.background,
          body: Column(
            children: [
              AppHeader(
                title: 'Create Account',
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
                      Text(t('registerSub'), style: AppTypography.body),
                      const SizedBox(height: 16),
                      Center(
                        child: GestureDetector(
                          onTap: _pickPhoto,
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 32,
                                backgroundColor: AppColors.primarySoft,
                                child: _profileImage == null
                                    ? const Icon(Icons.person, size: 32, color: AppColors.primary)
                                    : null,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _profileImage == null
                                    ? 'Add profile photo (optional)'
                                    : 'Change photo',
                                style: AppTypography.smallMedium.copyWith(color: AppColors.primary),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('fullName'),
                        hint: 'Abebe Kebede',
                        controller: _fullName,
                        capitalization: TextCapitalization.words,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('phoneNumber'),
                        controller: _phoneNumber,
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: 'PIN (4-6 digits)',
                        hint: 'Enter a PIN',
                        secure: true,
                        controller: _pin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                      ),
                      const SizedBox(height: 16),
                      AppInput(
                        label: t('confirmPin'),
                        hint: 'Repeat your PIN',
                        secure: true,
                        controller: _confirmPin,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'A verification code will be sent to your phone. '
                        'For local dev it appears in the backend console.',
                        style: AppTypography.caption,
                      ),
                      const SizedBox(height: 16),
                      AppButton(
                        title: 'Register',
                        loading: state.status == AuthStatus.loading,
                        onPressed: _submit,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Already have an account?', style: AppTypography.small),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () => context.go('/login'),
                            child: Text(
                              'Log in',
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