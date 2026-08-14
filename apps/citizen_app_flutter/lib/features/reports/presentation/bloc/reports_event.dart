part of 'reports_bloc.dart';


sealed class ReportsEvent extends Equatable {
  const ReportsEvent();

  @override
  List<Object?> get props => [];
}

class ReportsFetchMyRequested extends ReportsEvent {}

class ReportsFetchNearbyRequested extends ReportsEvent {
  final double lat;
  final double lng;
  final double radiusKm;

  const ReportsFetchNearbyRequested({
    this.lat = 9.0107,
    this.lng = 38.7612,
    this.radiusKm = 25,
  });

  @override
  List<Object?> get props => [lat, lng, radiusKm];
}

class ReportsFetchDetailRequested extends ReportsEvent {
  final String id;

  const ReportsFetchDetailRequested(this.id);

  @override
  List<Object?> get props => [id];
}

class ReportsFetchHistoryRequested extends ReportsEvent {
  final String id;

  const ReportsFetchHistoryRequested(this.id);

  @override
  List<Object?> get props => [id];
}

class ReportsTrackRequested extends ReportsEvent {
  final String caseId;

  const ReportsTrackRequested(this.caseId);

  @override
  List<Object?> get props => [caseId];
}

class ReportsCreateRequested extends ReportsEvent {
  final CreateReportPayload payload;

  const ReportsCreateRequested(this.payload);

  @override
  List<Object?> get props => [payload];
}

class ReportsFetchTypesRequested extends ReportsEvent {}

class ReportsFetchStatsRequested extends ReportsEvent {}

class ReportsResetDetailRequested extends ReportsEvent {}

class ReportsErrorCleared extends ReportsEvent {}