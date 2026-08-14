import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../models/user.dart';

class SessionManager {
  SessionManager._internal();

  static final SessionManager instance = SessionManager._internal();

  static const _authKey = 'auth_state';
  static const _langKey = '@citizen_app_lang';

  String? accessToken;
  String? refreshToken;
  Citizen? user;
  bool isGuest = false;
  bool isHydrated = false;

  VoidCallback? _onUnauthorized;

  void setOnUnauthorized(VoidCallback callback) => _onUnauthorized = callback;
  void onUnauthorized() => _onUnauthorized?.call();

  String _deviceId = '';
  String get deviceId {
    if (_deviceId.isEmpty) {
      _deviceId = 'cit-${const Uuid().v4()}';
    }
    return _deviceId;
  }

  Future<void> saveSession({
    required String access,
    required String refresh,
    required Citizen user,
  }) async {
    accessToken = access;
    refreshToken = refresh;
    this.user = user;
    isGuest = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _authKey,
      jsonEncode({
        'user': user.toJson(),
        'accessToken': access,
        'refreshToken': refresh,
      }),
    );
  }

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_authKey);
    if (raw != null) {
      try {
        final map = jsonDecode(raw) as Map<String, dynamic>;
        user = Citizen.fromJson(map['user'] as Map<String, dynamic>);
        accessToken = map['accessToken'] as String?;
        refreshToken = map['refreshToken'] as String?;
        if (accessToken != null && accessToken!.isNotEmpty && user != null) {
          isHydrated = true;
          return;
        }
      } catch (_) {}
    }
    user = null;
    accessToken = null;
    refreshToken = null;
    isHydrated = true;
  }

  Future<void> clear() async {
    accessToken = null;
    refreshToken = null;
    user = null;
    isGuest = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_authKey);
  }

  Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_langKey) ?? 'en';
  }

  Future<void> setLanguage(String lang) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_langKey, lang);
  }
}

typedef VoidCallback = void Function();