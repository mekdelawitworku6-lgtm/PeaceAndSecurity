part of 'auth_bloc.dart';

sealed class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthHydrateRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String phoneNumber;
  final String pin;

  const AuthLoginRequested({required this.phoneNumber, required this.pin});

  @override
  List<Object?> get props => [phoneNumber, pin];
}

class AuthChangePinRequested extends AuthEvent {
  final String currentPin;
  final String newPin;

  const AuthChangePinRequested({required this.currentPin, required this.newPin});

  @override
  List<Object?> get props => [currentPin, newPin];
}

class AuthLogoutRequested extends AuthEvent {}

class AuthErrorCleared extends AuthEvent {}