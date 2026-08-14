part of 'notifications_bloc.dart';

sealed class NotificationsEvent extends Equatable {
  const NotificationsEvent();

  @override
  List<Object?> get props => [];
}

class NotificationsFetchRequested extends NotificationsEvent {}

class NotificationsFetchUnreadRequested extends NotificationsEvent {}

class NotificationsMarkReadRequested extends NotificationsEvent {
  final String id;

  const NotificationsMarkReadRequested(this.id);

  @override
  List<Object?> get props => [id];
}

class NotificationsMarkAllReadRequested extends NotificationsEvent {}

class NotificationsSocketReceived extends NotificationsEvent {
  final AppNotification notification;

  const NotificationsSocketReceived(this.notification);

  @override
  List<Object?> get props => [notification];
}

class NotificationsUnreadReceived extends NotificationsEvent {
  final int count;

  const NotificationsUnreadReceived(this.count);

  @override
  List<Object?> get props => [count];
}

class NotificationsErrorCleared extends NotificationsEvent {}