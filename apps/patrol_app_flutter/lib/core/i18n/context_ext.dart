import 'package:flutter/material.dart';

import 'app_localizations.dart';

extension L10nContext on BuildContext {
  AppLocalizations l10n() => AppLocalizations.of(this);
}