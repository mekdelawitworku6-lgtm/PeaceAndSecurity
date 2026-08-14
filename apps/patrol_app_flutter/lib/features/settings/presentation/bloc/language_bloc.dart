import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/i18n/app_localizations.dart';
import '../../../../core/services/session_manager.dart';

class LanguageState {
  final String lang;

  const LanguageState(this.lang);

  LanguageState copyWith(String? lang) => LanguageState(lang ?? this.lang);
}

class LanguageBloc extends Cubit<LanguageState> {
  final AppLocalizations l10n;

  LanguageBloc(this.l10n) : super(const LanguageState('en')) {
    _init();
  }

  Future<void> _init() async {
    final lang = await SessionManager.instance.getLanguage();
    l10n.setLanguage(lang);
    emit(LanguageState(lang));
  }

  Future<void> setLanguage(String lang) async {
    await SessionManager.instance.setLanguage(lang);
    l10n.setLanguage(lang);
    emit(LanguageState(lang));
  }

  String get currentLanguage => state.lang;
}