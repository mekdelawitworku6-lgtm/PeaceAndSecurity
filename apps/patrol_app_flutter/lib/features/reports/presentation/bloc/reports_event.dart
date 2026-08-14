part of 'reports_bloc.dart';

sealed class ReportsEvent extends Equatable {
  const ReportsEvent();

  @override
  List<Object?> get props => [];
}

class ReportsFetchAssignedRequested extends ReportsEvent {}

class ReportsFetchNearbyRequested extends ReportsEvent {
  final double radiusKm;

  const ReportsFetchNearbyRequested({this.radiusKm = 10});

  @override
  List<Object?> get props => [radiusKm];
}

class ReportsFetchDetailRequested extends ReportsEvent {
  final String reportId;

  const ReportsFetchDetailRequested(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ReportsFetchHistoryRequested extends ReportsEvent {
  final String reportId;

  const ReportsFetchHistoryRequested(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ReportsAcceptRequested extends ReportsEvent {
  final String reportId;

  const ReportsAcceptRequested(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ReportsCloseRequested extends ReportsEvent {
  final String reportId;

  const ReportsCloseRequested(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ReportsEscalateRequested extends ReportsEvent {
  final String reportId;
  final String notes;

  const ReportsEscalateRequested({required this.reportId, required this.notes});

  @override
  List<Object?> get props => [reportId, notes];
}

class ReportsFollowUpRequested extends ReportsEvent {
  final String reportId;
  final FollowUpPayload payload;

  const ReportsFollowUpRequested({
    required this.reportId,
    required this.payload,
  });

  @override
  List<Object?> get props => [reportId, payload.notes];
}

class ReportsActionCompleted extends ReportsEvent {
  final String reportId;

  const ReportsActionCompleted(this.reportId);

  @override
  List<Object?> get props => [reportId];
}

class ReportsResetDetailRequested extends ReportsEvent {}

class ReportsErrorCleared extends ReportsEvent {}