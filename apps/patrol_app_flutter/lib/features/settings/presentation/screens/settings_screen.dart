import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/i18n/context_ext.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/media_helpers.dart';
import '../../../../core/widgets/app_card.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../bloc/language_bloc.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  Future<void> _confirmLogout() async {
    final t = context.l10n().t;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out'),
        content: Text(t('logOutConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(t('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: Text(t('logOut')),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      context.read<AuthBloc>().add(AuthLogoutRequested());
      context.go('/splash');
    }
  }

  Future<void> _showLanguageSheet() async {
    final t = context.l10n().t;
    final langBloc = context.read<LanguageBloc>();
    final current = langBloc.currentLanguage;
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                t('selectLanguage'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('English'),
              trailing: current == 'en' ? const Icon(Icons.check) : null,
              onTap: () {
                langBloc.setLanguage('en');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('አማርኛ'),
              trailing: current == 'am' ? const Icon(Icons.check) : null,
              onTap: () {
                langBloc.setLanguage('am');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('Afaan Oromoo'),
              trailing: current == 'om' ? const Icon(Icons.check) : null,
              onTap: () {
                langBloc.setLanguage('om');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('ትግርኛ'),
              trailing: current == 'ti' ? const Icon(Icons.check) : null,
              onTap: () {
                langBloc.setLanguage('ti');
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    final auth = context.watch<AuthBloc>().state;
    final user = auth.user;
    final phone = user?.phoneNumber;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
          Text(
            t('settings'),
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 16),
          AppCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primarySoft,
                  backgroundImage:
                      (user?.profileImage?.isNotEmpty ?? false)
                          ? NetworkImage(assetUrl(user!.profileImage!))
                          : null,
                  onBackgroundImageError:
                      (user?.profileImage?.isNotEmpty ?? false)
                          ? (_, _) {}
                          : null,
                  child: (user?.profileImage?.isNotEmpty ?? false)
                      ? null
                      : Text(
                          (user?.fullName.isNotEmpty ?? false)
                              ? user!.fullName.substring(0, 1).toUpperCase()
                              : 'P',
                          style: AppTypography.h3.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.fullName ?? t('patrolOfficer'),
                        style: AppTypography.smallMedium,
                      ),
                      if (user?.userCode != null)
                        Text(
                          t('idLabel', {'code': user!.userCode!}),
                          style: AppTypography.caption,
                        ),
                      if (phone != null)
                        Text(
                          phone,
                          style: AppTypography.caption,
                        ),
                      if (user?.assignedArea != null)
                        Text(
                          user!.assignedArea!,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (user?.officeAddress != null) ...[
            const SizedBox(height: 10),
            AppCard(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  const Icon(Icons.business_outlined,
                      size: 18, color: AppColors.textMuted),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      user!.officeAddress!,
                      style: AppTypography.small,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          _SettingsTile(
            icon: Icons.lock_outline,
            label: t('changePin'),
            onTap: () => context.push('/change-pin'),
          ),
          _SettingsTile(
            icon: Icons.language,
            label: t('selectLanguage'),
            onTap: _showLanguageSheet,
          ),
          _SettingsTile(
            icon: Icons.info_outline,
            label: t('about'),
            onTap: () => showAboutDialog(
              context: context,
              applicationName: 'Peace & Security Patrol',
              applicationVersion: 'v1.0.0',
              children: [
                Text(t('aboutApp')),
              ],
            ),
          ),
          const SizedBox(height: 20),
          AppCard(
            padding: const EdgeInsets.all(14),
            onTap: _confirmLogout,
            child: Row(
              children: [
                const Icon(Icons.logout, size: 20, color: AppColors.danger),
                const SizedBox(width: 10),
                Text(
                  t('logOut'),
                  style: AppTypography.smallMedium.copyWith(
                    color: AppColors.danger,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              '${AppConfigDisplay.name} v1.0.0',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMuted,
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }
}

class AppConfigDisplay {
  static const String name = 'Peace & Security Patrol';
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AppCard(
        padding: const EdgeInsets.all(14),
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.textMuted),
            const SizedBox(width: 10),
            Expanded(
              child: Text(label, style: AppTypography.smallMedium),
            ),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}