import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_colors.dart';
import '../core/i18n/context_ext.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/chat/presentation/screens/chat_screen.dart';
import '../features/chat/presentation/screens/conversations_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/reports/presentation/screens/assigned_reports_screen.dart';
import '../features/reports/presentation/screens/escalate_screen.dart';
import '../features/reports/presentation/screens/follow_up_screen.dart';
import '../features/reports/presentation/screens/nearby_reports_screen.dart';
import '../features/reports/presentation/screens/report_detail_screen.dart';
import '../features/settings/presentation/screens/change_pin_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import '../features/team/presentation/screens/team_screen.dart';
import '../features/work_reports/presentation/screens/work_reports_screen.dart';

class AppRouter {
  static const _tabs = [
    '/home',
    '/assigned',
    '/work-reports',
    '/conversations',
    '/notifications',
    '/settings',
  ];

  static final router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final auth = context.read<AuthBloc>().state;
      final location = state.matchedLocation;

      if (!auth.isSignedIn &&
          auth.status != AuthStatus.idle &&
          !_isAuthRoute(location)) {
        return '/splash';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/change-pin',
        builder: (context, state) => const ChangePinScreen(),
      ),
      GoRoute(
        path: '/report-detail/:reportId',
        builder: (context, state) => ReportDetailScreen(
          reportId: state.pathParameters['reportId']!,
          caseId: state.uri.queryParameters['caseId'],
        ),
      ),
      GoRoute(
        path: '/follow-up/:reportId',
        builder: (context, state) => FollowUpScreen(
          reportId: state.pathParameters['reportId']!,
          caseId: state.uri.queryParameters['caseId'],
        ),
      ),
      GoRoute(
        path: '/escalate/:reportId',
        builder: (context, state) => EscalateScreen(
          reportId: state.pathParameters['reportId']!,
          caseId: state.uri.queryParameters['caseId'],
        ),
      ),
      GoRoute(
        path: '/nearby',
        builder: (context, state) => const NearbyReportsScreen(),
      ),
      GoRoute(
        path: '/team',
        builder: (context, state) => const TeamScreen(),
      ),
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) => ChatScreen(
          conversationId: state.pathParameters['conversationId']!,
          title: state.uri.queryParameters['title'],
        ),
      ),
      ShellRoute(
        builder: (context, state, child) => _MainShell(
          selectedIndex: _tabIndex(state.uri.path),
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/assigned',
            builder: (context, state) => const AssignedReportsScreen(),
          ),
          GoRoute(
            path: '/work-reports',
            builder: (context, state) => const WorkReportsScreen(),
          ),
          GoRoute(
            path: '/conversations',
            builder: (context, state) => const ConversationsScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );

  static int _tabIndex(String path) {
    final i = _tabs.indexOf(path);
    return i < 0 ? 0 : i;
  }

  static bool _isAuthRoute(String location) {
    const authRoutes = [
      '/splash',
      '/login',
      '/change-pin',
    ];
    return authRoutes.any(location.startsWith);
  }
}

class _MainShell extends StatefulWidget {
  final Widget child;
  final int selectedIndex;

  const _MainShell({required this.child, required this.selectedIndex});

  @override
  State<_MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<_MainShell> {
  DateTime? _lastBackPressTime;

  @override
  Widget build(BuildContext context) {
    final t = context.l10n().t;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (widget.selectedIndex != 0) {
          context.go('/home');
          return;
        }
        final now = DateTime.now();
        if (_lastBackPressTime == null ||
            now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
          _lastBackPressTime = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit'),
              duration: Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ),
          );
          return;
        }
        SystemNavigator.pop();
      },
      child: Scaffold(
        body: widget.child,
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: widget.selectedIndex,
          onTap: (i) {
            final path = [
              '/home',
              '/assigned',
              '/work-reports',
              '/conversations',
              '/notifications',
              '/settings',
            ][i];
            context.go(path);
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.card,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          selectedFontSize: 11,
          unselectedFontSize: 10,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.home_outlined),
              activeIcon: const Icon(Icons.home),
              label: t('home'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.assignment_outlined),
              activeIcon: const Icon(Icons.assignment),
              label: t('assigned'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.fact_check_outlined),
              activeIcon: const Icon(Icons.fact_check),
              label: t('workReports'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.chat_bubble_outline),
              activeIcon: const Icon(Icons.chat_bubble),
              label: t('inbox'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.notifications_outlined),
              activeIcon: const Icon(Icons.notifications),
              label: t('alerts'),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline),
              activeIcon: const Icon(Icons.person),
              label: t('profile'),
            ),
          ],
        ),
      ),
    );
  }
}