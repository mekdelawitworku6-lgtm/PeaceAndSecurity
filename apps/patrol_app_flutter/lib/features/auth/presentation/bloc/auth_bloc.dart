import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/user.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/services/socket_service.dart';
import '../../data/repositories/auth_repository.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository repository;
  final SessionManager sessionManager;

  AuthBloc({required this.repository, required this.sessionManager})
      : super(const AuthState()) {
    on<AuthHydrateRequested>(_onHydrate);
    on<AuthLoginRequested>(_onLogin);
    on<AuthChangePinRequested>(_onChangePin);
    on<AuthLogoutRequested>(_onLogout);
    on<AuthErrorCleared>(_onClearError);
  }

  Future<void> _onHydrate(
      AuthHydrateRequested event, Emitter<AuthState> emit) async {
    await sessionManager.hydrate();
    var user = sessionManager.user;
    final token = sessionManager.accessToken;
    if (user != null && token != null && token.isNotEmpty) {
      try {
        final fresh = await repository.fetchMyProfile();
        user = fresh;
        await sessionManager.saveSession(
          access: sessionManager.accessToken!,
          refresh: sessionManager.refreshToken!,
          user: fresh,
        );
      } catch (_) {}
      _connectSockets(user);
      emit(state.copyWith(
        status: AuthStatus.signedIn,
        user: user,
        accessToken: token,
        refreshToken: sessionManager.refreshToken,
      ));
    } else {
      emit(state.copyWith(status: AuthStatus.signedOut));
    }
  }

  Future<void> _onLogin(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, error: null));
    try {
      final result = await repository.login(
        phoneNumber: event.phoneNumber,
        pin: event.pin,
      );
      await sessionManager.saveSession(
        access: result.accessToken,
        refresh: result.refreshToken,
        user: result.user,
      );
      _connectSockets(result.user);
      emit(state.copyWith(
        status: AuthStatus.signedIn,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        error: _message(e, 'Login failed'),
      ));
    }
  }

  Future<void> _onChangePin(
      AuthChangePinRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, error: null));
    try {
      await repository.changePin(
        currentPin: event.currentPin,
        newPin: event.newPin,
      );
      emit(state.copyWith(
        status: AuthStatus.signedIn,
        message: 'Your PIN has been changed successfully.',
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedIn,
        error: _message(e, 'Failed to change PIN'),
      ));
    }
  }

  Future<void> _onLogout(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    SocketService.instance.disconnect();
    await sessionManager.clear();
    emit(state.copyWith(
      status: AuthStatus.signedOut,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    ));
  }

  void _onClearError(AuthErrorCleared event, Emitter<AuthState> emit) {
    emit(state.copyWith(error: null, message: null));
  }

  void _connectSockets(PatrolUser user) {
    final token = sessionManager.accessToken;
    if (token != null && token.isNotEmpty) {
      SocketService.instance.connect(token: token, user: user);
    }
  }

  String _message(Object e, String fallback) {
    if (e is String) return e;
    if (e is Exception) {
      final s = e.toString().replaceFirst('Exception: ', '');
      if (s.isNotEmpty && s != 'null') return s;
    }
    return fallback;
  }
}