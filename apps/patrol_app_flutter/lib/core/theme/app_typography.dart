import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTypography {
  static const h1 = TextStyle(fontSize: 26, fontWeight: FontWeight.w800, height: 1.23, color: AppColors.text);
  static const h2 = TextStyle(fontSize: 22, fontWeight: FontWeight.w700, height: 1.27, color: AppColors.text);
  static const h3 = TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.33, color: AppColors.text);
  static const body = TextStyle(fontSize: 15, fontWeight: FontWeight.w400, height: 1.47, color: AppColors.textBody);
  static const bodyMedium = TextStyle(fontSize: 15, fontWeight: FontWeight.w600, height: 1.47, color: AppColors.text);
  static const small = TextStyle(fontSize: 13, fontWeight: FontWeight.w400, height: 1.38, color: AppColors.textBody);
  static const smallMedium = TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.38, color: AppColors.text);
  static const caption = TextStyle(fontSize: 12, fontWeight: FontWeight.w400, height: 1.33, color: AppColors.textMuted);
  static const label = TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.38, color: AppColors.text);
}