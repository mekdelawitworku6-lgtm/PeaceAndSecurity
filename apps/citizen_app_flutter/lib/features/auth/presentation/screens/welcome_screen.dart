import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            Container(
              width: 132,
              height: 132,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              AppConfig.appName,
              style: AppTypography.h1.copyWith(color: AppColors.white),
            ),
            const SizedBox(height: 4),
            Text(
              'Citizen App',
              style: AppTypography.h3.copyWith(color: AppColors.primarySoft),
            ),
            const SizedBox(height: 24),
            Container(
              width: 48,
              height: 3,
              color: AppColors.accent,
            ),
            const SizedBox(height: 24),
            Text(
              t('tagline'),
              style: AppTypography.bodyMedium.copyWith(color: AppColors.white),
            ),
            const SizedBox(height: 4),
            Text(
              t('serving'),
              style: AppTypography.small.copyWith(color: AppColors.primarySoft),
            ),
            const Spacer(),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  AppButton(
                    title: 'Login',
                    onPressed: () => context.go('/login'),
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    title: 'Create Account',
                    variant: AppButtonVariant.outline,
                    onPressed: () => context.go('/register'),
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