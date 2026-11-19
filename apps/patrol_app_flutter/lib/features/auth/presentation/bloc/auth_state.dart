part of 'auth_bloc.dart';

enum AuthStatus { idle, loading, signedIn, signedOut }

class AuthState extends Equatable {
  final AuthStatus status;
  final PatrolUser? user;
  final String? accessToken;
  final String? refreshToken;
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
    this.pinResetToken,
    this.pinResetPhone,
    this.pinResetDone = false,
    this.error,
    this.message,
  });

  bool get isSignedIn => status == AuthStatus.signedIn;

  AuthState copyWith({
    AuthStatus? status,
    PatrolUser? user,
    String? accessToken,
    String? refreshToken,
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
        pinResetToken,
        pinResetPhone,
        pinResetDone,
        error,
        message,
      ];
}