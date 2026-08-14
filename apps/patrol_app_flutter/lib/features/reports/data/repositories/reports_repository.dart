import 'package:dio/dio.dart';

import '../../../../core/models/report.dart';
import '../../../../core/models/report_type.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/media_helpers.dart';

class NearbyReportsResult {
  final List<Report> reports;
  final double? radiusKm;
  final int? total;
  final PatrolOfficeLocation? patrolOfficeLocation;

  const NearbyReportsResult({
    required this.reports,
    this.radiusKm,
    this.total,
    this.patrolOfficeLocation,
  });

  factory NearbyReportsResult.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? json;
    return NearbyReportsResult(
      reports: (data['reports'] as List<dynamic>? ?? [])
          .map((e) => Report.fromJson(e as Map<String, dynamic>))
          .toList(),
      radiusKm: (data['radiusKm'] as num?)?.toDouble(),
      total: data['total'] as int?,
      patrolOfficeLocation: data['patrolOfficeLocation'] != null
          ? PatrolOfficeLocation.fromJson(
              data['patrolOfficeLocation'] as Map<String, dynamic>)
          : null,
    );
  }
}

class PatrolOfficeLocation {
  final double latitude;
  final double longitude;
  final String? address;

  const PatrolOfficeLocation({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory PatrolOfficeLocation.fromJson(Map<String, dynamic> json) =>
      PatrolOfficeLocation(
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        address: json['address'] as String?,
      );
}

class FollowUpPayload {
  final String notes;
  final double latitude;
  final double longitude;
  final List<PickedMedia> evidence;

  const FollowUpPayload({
    required this.notes,
    required this.latitude,
    required this.longitude,
    this.evidence = const [],
  });
}

class ReportsRepository {
  final _api = ApiClient.instance;

  Future<List<Report>> fetchAssignedReports() async {
    final res = await _api.get('/reports/assigned-to-me');
    final data = res['data'];
    return (data as List<dynamic>? ?? [])
        .map((e) => Report.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<NearbyReportsResult> fetchNearbyReports({double radiusKm = 10}) async {
    final res = await _api.get('/reports/nearby', queryParameters: {
      'radiusKm': radiusKm,
    });
    return NearbyReportsResult.fromJson(res);
  }

  Future<Report> fetchReportDetail(String id) async {
    final res = await _api.get('/reports/$id');
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReportLog>> fetchReportHistory(String id) async {
    final res = await _api.get('/reports/$id/history');
    final data = res['data'];
    return (data as List<dynamic>? ?? [])
        .map((e) => ReportLog.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Report> acceptReport(String id) async {
    final res = await _api.patch('/reports/$id/accept');
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Report> closeReport(String id) async {
    final res = await _api.patch('/reports/$id/close');
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Report> escalateReport(String id, String notes) async {
    final res = await _api.patch('/reports/$id/escalate', data: {'notes': notes});
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Report> submitFollowUp(String id, FollowUpPayload payload) async {
    final form = FormData();
    form.fields.add(MapEntry('notes', payload.notes));
    form.fields.add(MapEntry('latitude', payload.latitude.toString()));
    form.fields.add(MapEntry('longitude', payload.longitude.toString()));
    for (final media in payload.evidence) {
      if (media.xfile != null) {
        form.files.add(MapEntry(
          'patrolEvidence',
          MultipartFile.fromBytes(
            await media.xfile!.readAsBytes(),
            filename: media.fileName,
            contentType:
                DioMediaType.parse(media.mimeType ?? 'image/jpeg'),
          ),
        ));
      } else if (media.file != null) {
        form.files.add(MapEntry(
          'patrolEvidence',
          MultipartFile.fromFileSync(
            media.file!.path,
            filename: media.fileName,
            contentType:
                DioMediaType.parse(media.mimeType ?? 'image/jpeg'),
          ),
        ));
      }
    }
    final res = await _api.patch('/reports/$id/follow-up', data: form);
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReportType>> fetchReportTypes() async {
    final res = await _api.get('/report-types', headers: {
      'x-user-role': 'PATROL',
    });
    final data = res['data'];
    return (data as List<dynamic>? ?? [])
        .map((e) => ReportType.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}