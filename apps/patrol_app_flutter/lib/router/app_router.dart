import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_colors.dart';
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

class _MainShell extends StatelessWidget {
  final Widget child;
  final int selectedIndex;

  const _MainShell({required this.child, required this.selectedIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (i) {
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
        height: 64,
        backgroundColor: AppColors.card,
        indicatorColor: AppColors.primaryLight,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment),
            label: 'Assigned',
          ),
          NavigationDestination(
            icon: Icon(Icons.fact_check_outlined),
            selectedIcon: Icon(Icons.fact_check),
            label: 'Work Reports',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: 'Inbox',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            selectedIcon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}