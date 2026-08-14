import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_colors.dart';

class AppConfig {
  static const String _prodApiUrl =
      'https://peaceandsecurityadmin.possibletechplc.com/api';
  static const String _prodSocketUrl =
      'https://peaceandsecurityadmin.possibletechplc.com';

  static String get apiUrl {
    const fromEnv = String.fromEnvironment('API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (kDebugMode) {
      if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:5001/api';
      return 'http://localhost:5001/api';
    }
    return _prodApiUrl;
  }

  static String get socketUrl {
    const fromEnv = String.fromEnvironment('SOCKET_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (kDebugMode) {
      if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:5001';
      return 'http://localhost:5001';
    }
    return _prodSocketUrl;
  }

  static const String appVersion = '1.0.0';
  static const String appName = 'Peace & Security';
  static const String appTagline = 'Report. Respond. Resolve.';

  static bool get isDarkMode => false;

  static ThemeData get theme {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.card,
        error: AppColors.danger,
      ),
      scaffoldBackgroundColor: AppColors.background,
      fontFamily: null,
      splashFactory: InkSparkle.splashFactory,
    );
    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.card,
        foregroundColor: AppColors.text,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),
      tabBarTheme: const TabBarThemeData(
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textMuted,
        indicatorColor: AppColors.primary,
        labelStyle: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.card,
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
          borderSide: BorderSide(color: AppColors.danger),
        ),
      ),
    );
  }
}