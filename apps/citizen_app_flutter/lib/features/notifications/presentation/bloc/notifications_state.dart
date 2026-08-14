part of 'notifications_bloc.dart';

class NotificationsState extends Equatable {
  final List<AppNotification> items;
  final int unreadCount;
  final bool loading;
  final String? error;

  const NotificationsState({
    this.items = const [],
    this.unreadCount = 0,
    this.loading = false,
    this.error,
  });

  NotificationsState copyWith({
    List<AppNotification>? items,
    int? unreadCount,
    bool? loading,
    String? error,
  }) =>
      NotificationsState(
        items: items ?? this.items,
        unreadCount: unreadCount ?? this.unreadCount,
        loading: loading ?? this.loading,
        error: error,
      );

  @override
  List<Object?> get props => [items, unreadCount, loading, error];
}