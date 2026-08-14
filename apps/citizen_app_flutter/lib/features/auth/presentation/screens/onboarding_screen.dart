import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _guestLoading = false;

  void _continueAsGuest() async {
    setState(() => _guestLoading = true);
    final bloc = context.read<AuthBloc>();
    bloc.add(AuthGuestModeRequested());
    final completer = Completer<void>();
    final sub = bloc.stream.listen((s) {
      if (s.isSignedIn && s.isGuest && !completer.isCompleted) {
        completer.complete();
      }
    });
    await completer.future.timeout(const Duration(seconds: 5), onTimeout: () {});
    await sub.cancel();
    if (!mounted) return;
    setState(() => _guestLoading = false);
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  _TickerCard(
                    dot: true,
                    title: t('liveTicker1'),
                    sub: t('sharedWithPolice'),
                    scale: 1,
                    opacity: 1,
                  ),
                  const SizedBox(height: 10),
                  _TickerCard(
                    dot: true,
                    title: t('liveTicker2'),
                    sub: t('sharedWithPolice'),
                    scale: 0.96,
                    opacity: 0.85,
                  ),
                  const SizedBox(height: 10),
                  _TickerCard(
                    dot: true,
                    title: t('liveTicker3'),
                    sub: t('sharedWithSecurity'),
                    scale: 0.92,
                    opacity: 0.7,
                  ),
                ],
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              decoration: const BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 28,
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.primarySoft,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.primarySoft,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    t('onboardingTitle'),
                    textAlign: TextAlign.center,
                    style: AppTypography.h2,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    t('onboardingSub'),
                    textAlign: TextAlign.center,
                    style: AppTypography.body,
                  ),
                  const SizedBox(height: 24),
                  AppButton(
                    title: t('getStarted'),
                    onPressed: () => context.go('/welcome'),
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    title: t('continueAsGuest'),
                    variant: AppButtonVariant.outline,
                    loading: _guestLoading,
                    onPressed: _continueAsGuest,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TickerCard extends StatelessWidget {
  final bool dot;
  final String title;
  final String sub;
  final double scale;
  final double opacity;

  const _TickerCard({
    required this.dot,
    required this.title,
    required this.sub,
    required this.scale,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Transform.scale(
      scale: scale,
      child: Opacity(
        opacity: opacity,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppShadows.card,
          ),
          child: Row(
            children: [
              if (dot)
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppColors.danger,
                    shape: BoxShape.circle,
                  ),
                ),
              if (dot) const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.smallMedium),
                    const SizedBox(height: 2),
                    Text(sub, style: AppTypography.caption),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}