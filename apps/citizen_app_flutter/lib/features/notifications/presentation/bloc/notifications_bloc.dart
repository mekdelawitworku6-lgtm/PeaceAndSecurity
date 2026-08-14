import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/app_notification.dart';
import '../../../../core/services/socket_service.dart';
import '../../data/repositories/notifications_repository.dart';

part 'notifications_event.dart';
part 'notifications_state.dart';

class NotificationsBloc extends Bloc<NotificationsEvent, NotificationsState> {
  final NotificationsRepository repository;
  StreamSubscription? _sub;
  StreamSubscription? _unreadSub;

  NotificationsBloc({required this.repository}) : super(const NotificationsState()) {
    on<NotificationsFetchRequested>(_onFetch);
    on<NotificationsFetchUnreadRequested>(_onFetchUnread);
    on<NotificationsMarkReadRequested>(_onMarkRead);
    on<NotificationsMarkAllReadRequested>(_onMarkAllRead);
    on<NotificationsSocketReceived>(_onSocketReceived);
    on<NotificationsUnreadReceived>(_onUnreadReceived);
    on<NotificationsErrorCleared>(_onClearError);

    _sub = SocketService.instance.onNotification.listen(
      (n) => add(NotificationsSocketReceived(n)),
    );
    _unreadSub = SocketService.instance.onUnreadCount.listen(
      (count) => add(NotificationsUnreadReceived(count)),
    );
  }

  @override
  Future<void> close() {
    _sub?.cancel();
    _unreadSub?.cancel();
    return super.close();
  }

  Future<void> _onFetch(
      NotificationsFetchRequested event, Emitter<NotificationsState> emit) async {
    try {
      final items = await repository.fetchNotifications();
      emit(state.copyWith(items: items, loading: false, error: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchUnread(
      NotificationsFetchUnreadRequested event, Emitter<NotificationsState> emit) async {
    try {
      final count = await repository.fetchUnreadCount();
      emit(state.copyWith(unreadCount: count, error: null));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  Future<void> _onMarkRead(
      NotificationsMarkReadRequested event, Emitter<NotificationsState> emit) async {
    try {
      await repository.markRead(event.id);
      emit(state.copyWith(
        items: state.items.map((n) => n.id == event.id ? n.copyWith(isRead: true) : n).toList(),
        unreadCount: state.items.any((n) => n.id == event.id && !n.isRead)
            ? (state.unreadCount > 0 ? state.unreadCount - 1 : 0)
            : state.unreadCount,
      ));
    } catch (_) {}
  }

  Future<void> _onMarkAllRead(
      NotificationsMarkAllReadRequested event, Emitter<NotificationsState> emit) async {
    try {
      await repository.markAllRead();
      emit(state.copyWith(
        items: state.items.map((n) => n.copyWith(isRead: true)).toList(),
        unreadCount: 0,
      ));
    } catch (_) {}
  }

  void _onSocketReceived(
      NotificationsSocketReceived event, Emitter<NotificationsState> emit) {
    final n = event.notification;
    final items = [...state.items];
    if (items.any((x) => x.id == n.id)) return;
    items.insert(0, n);
    emit(state.copyWith(
      items: items,
      unreadCount: n.isRead ? state.unreadCount : state.unreadCount + 1,
    ));
  }

  void _onUnreadReceived(
      NotificationsUnreadReceived event, Emitter<NotificationsState> emit) {
    emit(state.copyWith(unreadCount: event.count));
  }

  void _onClearError(NotificationsErrorCleared event, Emitter<NotificationsState> emit) {
    emit(state.copyWith(error: null));
  }

  String _msg(Object e) {
    final s = e.toString().replaceFirst('Exception: ', '');
    return s == 'null' || s.isEmpty ? 'Something went wrong' : s;
  }
}