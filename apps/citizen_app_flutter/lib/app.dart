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

class CitizenApp extends StatefulWidget {
  const CitizenApp({super.key});

  @override
  State<CitizenApp> createState() => _CitizenAppState();
}

class _CitizenAppState extends State<CitizenApp> {
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
            title: 'Peace & Security',
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
          ),
        ),
      ),
    );
  }
}