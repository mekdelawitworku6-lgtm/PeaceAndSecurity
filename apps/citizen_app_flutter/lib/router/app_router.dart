import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../core/i18n/context_ext.dart';
import '../core/theme/app_colors.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/auth/presentation/screens/forgot_pin_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/onboarding_screen.dart';
import '../features/auth/presentation/screens/register_screen.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/verify_otp_screen.dart';
import '../features/auth/presentation/screens/welcome_screen.dart';
import '../features/chat/presentation/screens/chat_screen.dart';
import '../features/chat/presentation/screens/conversations_screen.dart';
import '../features/map/presentation/screens/map_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/reports/presentation/screens/create_report_screen.dart';
import '../features/reports/presentation/screens/create_report_success_screen.dart';
import '../features/reports/presentation/screens/my_reports_screen.dart';
import '../features/reports/presentation/screens/report_detail_screen.dart';
import '../features/reports/presentation/screens/track_case_screen.dart';
import '../features/settings/presentation/screens/change_pin_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';

class AppRouter {
  static const _tabs = ['/home', '/map', '/reports', '/settings'];

  static final router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final auth = context.read<AuthBloc>().state;
      final location = state.matchedLocation;

      if (!auth.isSignedIn &&
          !auth.isGuest &&
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
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/forgot-pin',
        builder: (context, state) => ForgotPinScreen(
          initialPhone: state.uri.queryParameters['phone'] ?? '',
        ),
      ),
      GoRoute(
        path: '/reset-pin',
        builder: (context, state) {
          final params = state.uri.queryParameters;
          return ResetPinScreen(
            resetToken: params['resetToken'] ?? '',
            phoneNumber: params['phoneNumber'] ?? '',
          );
        },
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/verify-otp',
        builder: (context, state) {
          final params = state.uri.queryParameters;
          return VerifyOtpScreen(
            registrationToken: params['registrationToken'] ?? '',
            phoneNumber: params['phoneNumber'] ?? '',
            pin: params['pin'] ?? '',
            devOtp: params['devOtp'] ?? '',
          );
        },
      ),
      GoRoute(
        path: '/track-case',
        builder: (context, state) => const TrackCaseScreen(),
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
        path: '/create-report',
        builder: (context, state) => const CreateReportScreen(),
      ),
      GoRoute(
        path: '/create-report-success/:reportId',
        builder: (context, state) => CreateReportSuccessScreen(
          reportId: state.pathParameters['reportId']!,
          caseId: state.uri.queryParameters['caseId'] ?? '',
          status: state.uri.queryParameters['status'] ?? 'SUBMITTED',
          latitude:
              double.tryParse(state.uri.queryParameters['lat'] ?? '') ?? 9.03,
          longitude:
              double.tryParse(state.uri.queryParameters['lng'] ?? '') ?? 38.74,
          address: state.uri.queryParameters['address'] ?? '',
          submittedOn: state.uri.queryParameters['submittedOn'] ?? '',
          assignedTo: state.uri.queryParameters['assignedTo'] ?? '',
        ),
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
            path: '/map',
            builder: (context, state) => const MapScreen(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const MyReportsScreen(),
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

  static int _tabIndex(String path) => _tabs.indexOf(path).clamp(0, 3);

  static bool _isAuthRoute(String location) {
    const authRoutes = [
      '/splash',
      '/onboarding',
      '/welcome',
      '/login',
      '/forgot-pin',
      '/reset-pin',
      '/register',
      '/verify-otp',
      '/track-case',
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
        bottomNavigationBar: NavigationBar(
          selectedIndex: widget.selectedIndex,
          onDestinationSelected: (i) {
            final path = ['/home', '/map', '/reports', '/settings'][i];
            context.go(path);
          },
          height: 64,
          backgroundColor: AppColors.card,
          indicatorColor: AppColors.primaryLight,
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.home_outlined),
              selectedIcon: const Icon(Icons.home),
              label: t('home'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.map_outlined),
              selectedIcon: const Icon(Icons.map),
              label: t('map'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.description_outlined),
              selectedIcon: const Icon(Icons.description),
              label: t('reports'),
            ),
            NavigationDestination(
              icon: const Icon(Icons.person_outline),
              selectedIcon: const Icon(Icons.person),
              label: t('profile'),
            ),
          ],
        ),
      ),
    );
  }
}