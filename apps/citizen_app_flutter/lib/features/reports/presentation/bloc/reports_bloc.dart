import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/models/report.dart';
import '../../../../core/models/report_type.dart';
import '../../data/repositories/reports_repository.dart';

part 'reports_event.dart';
part 'reports_state.dart';

class ReportsBloc extends Bloc<ReportsEvent, ReportsState> {
  final ReportsRepository repository;

  ReportsBloc({required this.repository}) : super(const ReportsState()) {
    on<ReportsFetchMyRequested>(_onFetchMy);
    on<ReportsFetchNearbyRequested>(_onFetchNearby);
    on<ReportsFetchDetailRequested>(_onFetchDetail);
    on<ReportsFetchHistoryRequested>(_onFetchHistory);
    on<ReportsTrackRequested>(_onTrack);
    on<ReportsCreateRequested>(_onCreate);
    on<ReportsFetchTypesRequested>(_onFetchTypes);
    on<ReportsFetchStatsRequested>(_onFetchStats);
    on<ReportsResetDetailRequested>(_onResetDetail);
    on<ReportsErrorCleared>(_onClearError);
  }

  Future<void> _onFetchMy(ReportsFetchMyRequested event, Emitter<ReportsState> emit) async {
    if (state.myReports.isEmpty) {
      emit(state.copyWith(loading: true));
    }
    try {
      final reports = await repository.fetchMyReports();
      emit(state.copyWith(myReports: reports, loading: false, error: null));
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
      final reports = await repository.fetchNearbyReports(
        lat: event.lat,
        lng: event.lng,
        radiusKm: event.radiusKm,
      );
      emit(state.copyWith(nearbyReports: reports, loading: false, error: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchDetail(
      ReportsFetchDetailRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(detailLoading: true, error: null));
    try {
      final report = await repository.fetchReportDetail(event.id);
      emit(state.copyWith(detail: report, detailLoading: false, error: null));
    } catch (e) {
      emit(state.copyWith(detailLoading: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchHistory(
      ReportsFetchHistoryRequested event, Emitter<ReportsState> emit) async {
    try {
      final logs = await repository.fetchReportHistory(event.id);
      emit(state.copyWith(history: logs, error: null));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  Future<void> _onTrack(ReportsTrackRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(detailLoading: true, error: null));
    try {
      final report = await repository.fetchTrackedReport(event.caseId);
      emit(state.copyWith(detail: report, detailLoading: false, error: null));
    } catch (e) {
      emit(state.copyWith(detailLoading: false, error: _msg(e)));
    }
  }

  Future<void> _onCreate(ReportsCreateRequested event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(submitting: true, error: null));
    try {
      final report = await repository.createReport(event.payload);
      emit(state.copyWith(
        submitting: false,
        detail: report,
        myReports: [report, ...state.myReports],
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(submitting: false, error: _msg(e)));
    }
  }

  Future<void> _onFetchTypes(
      ReportsFetchTypesRequested event, Emitter<ReportsState> emit) async {
    if (state.reportTypes.isNotEmpty) return;
    try {
      final types = await repository.fetchReportTypes();
      emit(state.copyWith(reportTypes: types, error: null));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  Future<void> _onFetchStats(
      ReportsFetchStatsRequested event, Emitter<ReportsState> emit) async {
    try {
      final stats = await repository.fetchHomeStats();
      emit(state.copyWith(stats: stats, error: null));
    } catch (e) {
      emit(state.copyWith(error: _msg(e)));
    }
  }

  void _onResetDetail(ReportsResetDetailRequested event, Emitter<ReportsState> emit) {
    emit(state.copyWith(detail: null, history: const [], error: null));
  }

  void _onClearError(ReportsErrorCleared event, Emitter<ReportsState> emit) {
    emit(state.copyWith(error: null));
  }

  String _msg(Object e) {
    final s = e.toString().replaceFirst('Exception: ', '');
    return s == 'null' || s.isEmpty ? 'Something went wrong' : s;
  }
}