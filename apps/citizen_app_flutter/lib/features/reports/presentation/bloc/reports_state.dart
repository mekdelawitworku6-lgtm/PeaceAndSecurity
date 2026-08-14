part of 'reports_bloc.dart';

class ReportsState extends Equatable {
  final List<Report> myReports;
  final List<Report> nearbyReports;
  final Report? detail;
  final List<ReportLog> history;
  final List<ReportType> reportTypes;
  final bool loading;
  final bool detailLoading;
  final bool submitting;
  final String? error;

  const ReportsState({
    this.myReports = const [],
    this.nearbyReports = const [],
    this.detail,
    this.history = const [],
    this.reportTypes = const [],
    this.loading = false,
    this.detailLoading = false,
    this.submitting = false,
    this.error,
  });

  ReportsState copyWith({
    List<Report>? myReports,
    List<Report>? nearbyReports,
    Report? detail,
    List<ReportLog>? history,
    List<ReportType>? reportTypes,
    bool? loading,
    bool? detailLoading,
    bool? submitting,
    String? error,
  }) =>
      ReportsState(
        myReports: myReports ?? this.myReports,
        nearbyReports: nearbyReports ?? this.nearbyReports,
        detail: detail ?? this.detail,
        history: history ?? this.history,
        reportTypes: reportTypes ?? this.reportTypes,
        loading: loading ?? this.loading,
        detailLoading: detailLoading ?? this.detailLoading,
        submitting: submitting ?? this.submitting,
        error: error,
      );

  @override
  List<Object?> get props => [
        myReports,
        nearbyReports,
        detail,
        history,
        reportTypes,
        loading,
        detailLoading,
        submitting,
        error,
      ];
}