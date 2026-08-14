part of 'auth_bloc.dart';

enum AuthStatus { idle, loading, signedIn, signedOut }

class AuthState extends Equatable {
  final AuthStatus status;
  final Citizen? user;
  final String? accessToken;
  final String? refreshToken;
  final String? registrationToken;
  final String? pendingPhone;
  final String? pendingPin;
  final String? pendingDevOtp;
  final bool isGuest;
  final String? error;
  final String? message;

  const AuthState({
    this.status = AuthStatus.idle,
    this.user,
    this.accessToken,
    this.refreshToken,
    this.registrationToken,
    this.pendingPhone,
    this.pendingPin,
    this.pendingDevOtp,
    this.isGuest = false,
    this.error,
    this.message,
  });

  bool get isSignedIn => status == AuthStatus.signedIn;

  AuthState copyWith({
    AuthStatus? status,
    Citizen? user,
    String? accessToken,
    String? refreshToken,
    String? registrationToken,
    String? pendingPhone,
    String? pendingPin,
    String? pendingDevOtp,
    bool? isGuest,
    String? error,
    String? message,
  }) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        accessToken: accessToken ?? this.accessToken,
        refreshToken: refreshToken ?? this.refreshToken,
        registrationToken: registrationToken ?? this.registrationToken,
        pendingPhone: pendingPhone ?? this.pendingPhone,
        pendingPin: pendingPin ?? this.pendingPin,
        pendingDevOtp: pendingDevOtp ?? this.pendingDevOtp,
        isGuest: isGuest ?? this.isGuest,
        error: error,
        message: message,
      );

  @override
  List<Object?> get props => [
        status,
        user,
        accessToken,
        refreshToken,
        registrationToken,
        pendingPhone,
        pendingPin,
        pendingDevOtp,
        isGuest,
        error,
        message,
      ];
}