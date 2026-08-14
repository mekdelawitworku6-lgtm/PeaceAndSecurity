import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/report.dart';
import '../../data/repositories/reports_repository.dart';

part 'reports_event.dart';
part 'reports_state.dart';

class ReportsBloc extends Bloc<ReportsEvent, ReportsState> {
  final ReportsRepository repository;

  ReportsBloc({required this.repository}) : super(const ReportsState()) {
    on<ReportsFetchAssignedRequested>(_onFetchAssigned);
    on<ReportsFetchNearbyRequested>(_onFetchNearby);
    on<ReportsFetchDetailRequested>(_onFetchDetail);
    on<ReportsFetchHistoryRequested>(_onFetchHistory);
    on<ReportsAcceptRequested>(_onAccept);
    on<ReportsCloseRequested>(_onClose);
    on<ReportsEscalateRequested>(_onEscalate);
    on<ReportsFollowUpRequested>(_onFollowUp);
    on<ReportsActionCompleted>(_onActionCompleted);
    on<ReportsResetDetailRequested>(_onResetDetail);
    on<ReportsErrorCleared>(_onClearError);
  }

  Future<void> _onFetchAssigned(
      ReportsFetchAssignedRequested event, Emitter<ReportsState> emit) async {
    if (state.assignedReports.isEmpty) {
      emit(state.copyWith(loading: true));
    }
    try {
      final reports = await repository.fetchAssignedReports();
      emit(state.copyWith(
        assignedReports: reports,
        loading: false,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchNearby(
      ReportsFetchNearbyRequested event, Emitter<ReportsState> emit) async {
    if (state.nearbyReports.isEmpty) {
      emit(state.copyWith(loading: true));
    }
    try {
      final result = await repository.fetchNearbyReports(
        radiusKm: event.radiusKm,
      );
      emit(state.copyWith(
        nearbyReports: result.reports,
        nearbyRadiusKm: result.radiusKm ?? event.radiusKm,
        loading: false,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchDetail(
      ReportsFetchDetailRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final report = await repository.fetchReportDetail(event.reportId);
      emit(state.copyWith(detail: report, loading: false));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchHistory(
      ReportsFetchHistoryRequested event, Emitter<ReportsState> emit) async {
    try {
      final history = await repository.fetchReportHistory(event.reportId);
      emit(state.copyWith(history: history, error: null));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  Future<void> _onAccept(
      ReportsAcceptRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(
      actionLoading: true,
      actionReportId: event.reportId,
      error: null,
      actionMessage: null,
    ));
    try {
      final report = await repository.acceptReport(event.reportId);
      emit(state.copyWith(
        detail: report,
        actionLoading: false,
        actionMessage: 'Report accepted. Start your inspection.',
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        actionLoading: false,
        error: _msg(e),
      ));
    }
  }

  Future<void> _onClose(
      ReportsCloseRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(
      actionLoading: true,
      actionReportId: event.reportId,
      error: null,
      actionMessage: null,
    ));
    try {
      final report = await repository.closeReport(event.reportId);
      emit(state.copyWith(
        detail: report,
        actionLoading: false,
        actionMessage: 'Report closed.',
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        actionLoading: false,
        error: _msg(e),
      ));
    }
  }

  Future<void> _onEscalate(
      ReportsEscalateRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(
      actionLoading: true,
      actionReportId: event.reportId,
      error: null,
      actionMessage: null,
    ));
    try {
      final report =
          await repository.escalateReport(event.reportId, event.notes);
      emit(state.copyWith(
        detail: report,
        actionLoading: false,
        actionMessage: 'Report escalated.',
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        actionLoading: false,
        error: _msg(e),
      ));
    }
  }

  Future<void> _onFollowUp(
      ReportsFollowUpRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(
      actionLoading: true,
      actionReportId: event.reportId,
      error: null,
      actionMessage: null,
    ));
    try {
      final report =
          await repository.submitFollowUp(event.reportId, event.payload);
      emit(state.copyWith(
        detail: report,
        actionLoading: false,
        actionMessage: 'Follow-up submitted.',
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        actionLoading: false,
        error: _msg(e),
      ));
    }
  }

  void _onActionCompleted(
      ReportsActionCompleted event, Emitter<ReportsState> emit) {
    emit(state.copyWith(
      actionMessage: null,
      actionReportId: null,
      error: null,
    ));
  }

  void _onResetDetail(ReportsResetDetailRequested event, Emitter<ReportsState> emit) {
    emit(state.copyWith(clearDetail: true, history: const [], error: null));
  }

  void _onClearError(ReportsErrorCleared event, Emitter<ReportsState> emit) {
    emit(state.copyWith(error: null));
  }

  String _msg(Object e) {
    if (e is String) return e;
    if (e is Exception) {
      final s = e.toString().replaceFirst('Exception: ', '');
      if (s.isNotEmpty && s != 'null') return s;
    }
    return 'Something went wrong';
  }
}