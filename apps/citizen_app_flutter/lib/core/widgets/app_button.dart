import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_radius.dart';

enum AppButtonVariant { primary, outline, danger, ghost }

class AppButton extends StatelessWidget {
  final String title;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool loading;
  final bool disabled;
  final bool small;
  final bool fullWidth;

  const AppButton({
    super.key,
    required this.title,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.loading = false,
    this.disabled = false,
    this.small = false,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveDisabled = disabled || loading;
    final (bg, fg, border) = switch (variant) {
      AppButtonVariant.primary => (AppColors.primary, AppColors.white, null),
      AppButtonVariant.outline => (Colors.transparent, AppColors.primary, AppColors.primary),
      AppButtonVariant.danger => (AppColors.danger, AppColors.white, null),
      AppButtonVariant.ghost => (AppColors.primaryLight, AppColors.primary, null),
    };

    final height = small ? 38.0 : 52.0;

    return Opacity(
      opacity: effectiveDisabled ? 0.5 : 1,
      child: SizedBox(
        width: fullWidth ? double.infinity : null,
        height: height,
        child: Material(
          color: bg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.button),
            side: border != null ? BorderSide(color: border, width: 1.5) : BorderSide.none,
          ),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: effectiveDisabled ? null : onPressed,
            child: loading
                ? Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: fg,
                      ),
                    ),
                  )
                : Center(
                    child: Text(
                      title,
                      style: TextStyle(
                        color: fg,
                        fontSize: small ? 13 : 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}