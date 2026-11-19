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
  final String? pinResetToken;
  final String? pinResetPhone;
  final bool pinResetDone;
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
    this.pinResetToken,
    this.pinResetPhone,
    this.pinResetDone = false,
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
    String? pinResetToken,
    String? pinResetPhone,
    bool? pinResetDone,
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
        pinResetToken: pinResetToken ?? this.pinResetToken,
        pinResetPhone: pinResetPhone ?? this.pinResetPhone,
        pinResetDone: pinResetDone ?? this.pinResetDone,
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
        pinResetToken,
        pinResetPhone,
        pinResetDone,
        error,
        message,
      ];
}