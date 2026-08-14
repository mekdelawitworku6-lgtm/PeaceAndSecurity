import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFF0d2d82);
  static const primaryDark = Color(0xFF081a4d);
  static const primaryLight = Color(0xFFeef1fb);
  static const primarySoft = Color(0xFFdbe2f7);
  static const background = Color(0xFFf6f8fc);
  static const card = Color(0xFFFFFFFF);
  static const border = Color(0xFFe4e9f2);
  static const divider = Color(0xFFeef1f6);
  static const text = Color(0xFF0f172a);
  static const textBody = Color(0xFF475569);
  static const textMuted = Color(0xFF94a3b8);
  static const accent = Color(0xFFf59e0b);
  static const success = Color(0xFF16a34a);
  static const danger = Color(0xFFdc2626);
  static const info = Color(0xFF2563eb);
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);

  static const statusColors = <String, Color>{
    'SUBMITTED': Color(0xFF2563eb),
    'UNDER_REVIEW': Color(0xFF6366f1),
    'ASSIGNED': Color(0xFFf59e0b),
    'IN_PROGRESS': Color(0xFF8b5cf6),
    'RESOLVED': Color(0xFF16a34a),
    'CLOSED': Color(0xFF64748b),
    'REJECTED': Color(0xFFdc2626),
    'ESCALATED': Color(0xFFea580c),
  };

  static Color statusColor(String? status) =>
      statusColors[status] ?? statusColors['CLOSED']!;
}

class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
}

class AppShadows {
  static const card = <BoxShadow>[
    BoxShadow(
      color: Color(0x140d2d82),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];
}