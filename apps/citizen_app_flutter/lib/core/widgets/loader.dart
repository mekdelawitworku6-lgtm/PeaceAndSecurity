import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class Loader extends StatelessWidget {
  final String? label;

  const Loader({super.key, this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 36,
            height: 36,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: AppColors.primary,
            ),
          ),
          if (label != null) ...[
            const SizedBox(height: 12),
            Text(label!, style: AppTypography.small.copyWith(color: AppColors.textMuted)),
          ],
        ],
      ),
    );
  }
}