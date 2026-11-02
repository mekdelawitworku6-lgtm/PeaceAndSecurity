import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class AppHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool showBack;
  final Widget? right;
  final VoidCallback? onBack;

  const AppHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.showBack = true,
    this.right,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              SizedBox(
                width: showBack ? 44 : 8,
                height: 44,
                child: showBack
                    ? IconButton(
                        onPressed: onBack ??
                            () {
                              if (context.canPop()) {
                                context.pop();
                              } else {
                                context.go('/home');
                              }
                            },
                        icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.primary),
                      )
                    : null,
              ),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: AppTypography.h3,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (subtitle != null)
                      Text(
                        subtitle!,
                        textAlign: TextAlign.center,
                        style: AppTypography.caption,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              Flexible(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: right,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}