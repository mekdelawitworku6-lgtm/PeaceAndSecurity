import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/config/app_config.dart';
import 'core/i18n/app_localizations.dart';
import 'core/services/session_manager.dart';
import 'core/services/socket_service.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/chat/data/repositories/chat_repository.dart';
import 'features/chat/presentation/bloc/chat_bloc.dart';
import 'features/notifications/data/repositories/notifications_repository.dart';
import 'features/notifications/presentation/bloc/notifications_bloc.dart';
import 'features/reports/data/repositories/reports_repository.dart';
import 'features/reports/presentation/bloc/reports_bloc.dart';
import 'features/settings/presentation/bloc/language_bloc.dart';
import 'router/app_router.dart';

class PatrolApp extends StatefulWidget {
  const PatrolApp({super.key});

  @override
  State<PatrolApp> createState() => _PatrolAppState();
}

class _PatrolAppState extends State<PatrolApp> {
  late final AppLocalizations _l10n;
  late final LanguageBloc _languageBloc;

  @override
  void initState() {
    super.initState();
    _l10n = AppLocalizations();
    _languageBloc = LanguageBloc(_l10n);
  }

  @override
  void dispose() {
    SocketService.instance.disconnect();
    _languageBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => AuthBloc(
            repository: AuthRepository(),
            sessionManager: SessionManager.instance,
          )..add(AuthHydrateRequested()),
        ),
        BlocProvider(create: (context) => ReportsBloc(repository: ReportsRepository())),
        BlocProvider(create: (context) => ChatBloc(repository: ChatRepository())),
        BlocProvider(
          create: (context) =>
              NotificationsBloc(repository: NotificationsRepository()),
        ),
        BlocProvider.value(value: _languageBloc),
      ],
      child: ValueListenableBuilder<String>(
        valueListenable: _l10n.notifier,
        builder: (context, lang, _) => AppLocalizationsScope(
          l10n: _l10n,
          child: MaterialApp.router(
            title: "Peace \u0026 Security Patrol",
            debugShowCheckedModeBanner: false,
            theme: AppConfig.theme,
            locale: _l10n.locale,
            supportedLocales: AppLocalizations.supportedLocales,
            localeListResolutionCallback: (locales, supported) {
              if (locales == null || locales.isEmpty) return null;
              final first = locales.first;
              if (first.languageCode == 'om' || first.languageCode == 'ti') {
                return const Locale('en');
              }
              return supported.firstWhere(
                (l) => l.languageCode == first.languageCode,
                orElse: () => const Locale('en'),
              );
            },
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            routerConfig: AppRouter.router,
            builder: (context, child) {
              return BlocListener<NotificationsBloc, NotificationsState>(
                listenWhen: (prev, curr) => curr.items.length > prev.items.length,
                listener: (context, state) {
                  final latest = state.items.firstOrNull;
                  if (latest != null) {
                    if (latest.type == 'REPORT_ASSIGNED' ||
                        latest.type.contains('ASSIGN')) {
                      context
                          .read<ReportsBloc>()
                          .add(ReportsFetchAssignedRequested());
                    }
                    final messenger = ScaffoldMessenger.maybeOf(context);
                    if (messenger != null) {
                      messenger.showSnackBar(
                        SnackBar(
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                latest.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                latest.message,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Colors.white70),
                              ),
                            ],
                          ),
                          backgroundColor: const Color(0xFF0F172A),
                          duration: const Duration(seconds: 6),
                          behavior: SnackBarBehavior.floating,
                          action: latest.data?['reportId'] != null
                              ? SnackBarAction(
                                  label: 'VIEW',
                                  textColor: const Color(0xFF38BDF8),
                                  onPressed: () {
                                    final reportId = latest.data!['reportId'];
                                    final caseId =
                                        latest.data?['caseId'] ?? '';
                                    AppRouter.router.push(
                                      '/report-detail/$reportId?caseId=$caseId',
                                    );
                                  },
                                )
                              : null,
                        ),
                      );
                    }
                  }
                },
                child: child ?? const SizedBox.shrink(),
              );
            },
          ),
        ),
      ),
    );
  }
}