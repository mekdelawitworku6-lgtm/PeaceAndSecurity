part of 'reports_bloc.dart';

class ReportsState extends Equatable {
  final List<Report> assignedReports;
  final List<Report> nearbyReports;
  final double nearbyRadiusKm;
  final Report? detail;
  final List<ReportLog> history;
  final bool loading;
  final bool actionLoading;
  final String? actionReportId;
  final String? actionMessage;
  final String? error;

  const ReportsState({
    this.assignedReports = const [],
    this.nearbyReports = const [],
    this.nearbyRadiusKm = 10,
    this.detail,
    this.history = const [],
    this.loading = false,
    this.actionLoading = false,
    this.actionReportId,
    this.actionMessage,
    this.error,
  });

  ReportsState copyWith({
    List<Report>? assignedReports,
    List<Report>? nearbyReports,
    double? nearbyRadiusKm,
    Report? detail,
    bool clearDetail = false,
    List<ReportLog>? history,
    bool? loading,
    bool? actionLoading,
    String? actionReportId,
    String? actionMessage,
    String? error,
  }) =>
      ReportsState(
        assignedReports: assignedReports ?? this.assignedReports,
        nearbyReports: nearbyReports ?? this.nearbyReports,
        nearbyRadiusKm: nearbyRadiusKm ?? this.nearbyRadiusKm,
        detail: clearDetail ? null : detail ?? this.detail,
        history: history ?? this.history,
        loading: loading ?? this.loading,
        actionLoading: actionLoading ?? this.actionLoading,
        actionReportId: actionReportId ?? this.actionReportId,
        actionMessage: actionMessage ?? this.actionMessage,
        error: error,
      );

  Report? get actionReport {
    if (actionReportId == null || detail?.id != actionReportId) return null;
    return detail;
  }

  @override
  List<Object?> get props => [
        assignedReports,
        nearbyReports,
        nearbyRadiusKm,
        detail,
        history,
        loading,
        actionLoading,
        actionReportId,
        actionMessage,
        error,
      ];
}