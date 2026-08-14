part of 'auth_bloc.dart';

enum AuthStatus { idle, loading, signedIn, signedOut }

class AuthState extends Equatable {
  final AuthStatus status;
  final PatrolUser? user;
  final String? accessToken;
  final String? refreshToken;
  final String? error;
  final String? message;

  const AuthState({
    this.status = AuthStatus.idle,
    this.user,
    this.accessToken,
    this.refreshToken,
    this.error,
    this.message,
  });

  bool get isSignedIn => status == AuthStatus.signedIn;

  AuthState copyWith({
    AuthStatus? status,
    PatrolUser? user,
    String? accessToken,
    String? refreshToken,
    String? error,
    String? message,
  }) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        accessToken: accessToken ?? this.accessToken,
        refreshToken: refreshToken ?? this.refreshToken,
        error: error,
        message: message,
      );

  @override
  List<Object?> get props => [
        status,
        user,
        accessToken,
        refreshToken,
        error,
        message,
      ];
}