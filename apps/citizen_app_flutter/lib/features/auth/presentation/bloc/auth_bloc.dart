import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/user.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/services/socket_service.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository repository;
  final SessionManager sessionManager;

  AuthBloc({required this.repository, required this.sessionManager})
      : super(const AuthState()) {
    on<AuthHydrateRequested>(_onHydrate);
    on<AuthLoginRequested>(_onLogin);
    on<AuthRegisterRequested>(_onRegister);
    on<AuthVerifyRegistrationRequested>(_onVerifyRegistration);
    on<AuthResendOtpRequested>(_onResendOtp);
    on<AuthPinResetRequested>(_onPinResetRequested);
    on<AuthPinResetConfirmRequested>(_onPinResetConfirm);
    on<AuthChangePinRequested>(_onChangePin);
    on<AuthGuestModeRequested>(_onGuestMode);
    on<AuthLogoutRequested>(_onLogout);
    on<AuthErrorCleared>(_onClearError);
  }

  Future<void> _onHydrate(AuthHydrateRequested event, Emitter<AuthState> emit) async {
    await sessionManager.hydrate();
    final user = sessionManager.user;
    final token = sessionManager.accessToken;
    if (user != null && token != null && token.isNotEmpty) {
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

  Future<void> _onRegister(
      AuthRegisterRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, error: null));
    try {
      final res = await repository.register(
        fullName: event.fullName,
        phoneNumber: event.phoneNumber,
        pin: event.pin,
        profileImage: event.profileImage,
      );
      final regToken = res['registrationToken'] as String?;
      final devOtp = res['devOtp'] as String?;
      if (regToken == null) {
        throw Exception('No registration token returned. Please try again.');
      }
      emit(state.copyWith(
        status: AuthStatus.idle,
        registrationToken: regToken,
        pendingPhone: event.phoneNumber,
        pendingPin: event.pin,
        pendingDevOtp: devOtp,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        error: _message(e, 'Registration failed'),
      ));
    }
  }

  Future<void> _onVerifyRegistration(
      AuthVerifyRegistrationRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, error: null));
    try {
      final verify = await repository.verifyOtp(
        registrationToken: event.registrationToken,
        otpCode: event.otpCode,
      );
      final setPinToken = verify['setPinToken'] as String?;
      if (setPinToken == null) {
        throw Exception('No set-pin token returned. Please try again.');
      }
      final login = await repository.setPin(
        setPinToken: setPinToken,
        pin: event.pin,
      );
      await sessionManager.saveSession(
        access: login.accessToken,
        refresh: login.refreshToken,
        user: login.user,
      );
      _connectSockets(login.user);
      emit(state.copyWith(
        status: AuthStatus.signedIn,
        user: login.user,
        accessToken: login.accessToken,
        refreshToken: login.refreshToken,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        error: _message(e, 'Verification failed'),
      ));
    }
  }

  Future<void> _onResendOtp(AuthResendOtpRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(error: null));
    try {
      await repository.resendOtp(registrationToken: event.registrationToken);
      emit(state.copyWith(message: 'A new verification code has been sent to your phone.'));
    } catch (e) {
      emit(state.copyWith(error: _message(e, 'Resend failed')));
    }
  }

  Future<void> _onPinResetRequested(
      AuthPinResetRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(
      status: AuthStatus.loading,
      error: null,
      message: null,
      pinResetDone: false,
    ));
    try {
      final res = await repository.pinResetRequest(phoneNumber: event.phoneNumber);
      final token = res['resetToken'] as String?;
      if (token == null || token.isEmpty) {
        throw Exception('No reset token returned. Please try again.');
      }
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        pinResetToken: token,
        pinResetPhone: event.phoneNumber,
        error: null,
        message: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        error: _message(e, 'Failed to send reset code'),
        message: null,
      ));
    }
  }

  Future<void> _onPinResetConfirm(
      AuthPinResetConfirmRequested event, Emitter<AuthState> emit) async {
    emit(state.copyWith(status: AuthStatus.loading, error: null, message: null));
    try {
      await repository.pinResetConfirm(
        resetToken: event.resetToken,
        otpCode: event.otpCode,
        newPin: event.newPin,
      );
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        pinResetToken: null,
        pinResetPhone: null,
        pinResetDone: true,
        error: null,
        message: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.signedOut,
        error: _message(e, 'Failed to reset PIN'),
        message: null,
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

  Future<void> _onGuestMode(AuthGuestModeRequested event, Emitter<AuthState> emit) async {
    sessionManager.isGuest = true;
    emit(state.copyWith(status: AuthStatus.signedIn, isGuest: true));
  }

  Future<void> _onLogout(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    try {
      await repository.logout();
    } catch (_) {}
    SocketService.instance.disconnect();
    await sessionManager.clear();
    emit(state.copyWith(
      status: AuthStatus.signedOut,
      user: null,
      accessToken: null,
      refreshToken: null,
      registrationToken: null,
      pendingPhone: null,
      pendingPin: null,
      pendingDevOtp: null,
      isGuest: false,
      pinResetToken: null,
      pinResetPhone: null,
      pinResetDone: false,
      error: null,
    ));
  }

  void _onClearError(AuthErrorCleared event, Emitter<AuthState> emit) {
    emit(state.copyWith(
      error: null,
      message: null,
      pinResetToken: null,
      pinResetPhone: null,
      pinResetDone: false,
    ));
  }

  void _connectSockets(Citizen user) {
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