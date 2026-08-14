
import 'package:dio/dio.dart';

import '../../../../core/models/report.dart';
import '../../../../core/models/report_type.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/utils/media_helpers.dart';

class CreateReportPayload {
  final String? violationType;
  final String reportDescription;
  final double latitude;
  final double longitude;
  final String? address;
  final bool isAnonymous;
  final String? incidentDateTime;
  final bool isOngoing;
  final bool isEmergency;
  final String? suspectInfo;
  final String? victimInfo;
  final String? witnessInfo;
  final double? decibelLevel;
  final String? noiseAreaType;
  final List<PickedMedia> images;
  final PickedMedia? video;
  final PickedMedia? audio;

  const CreateReportPayload({
    this.violationType,
    required this.reportDescription,
    required this.latitude,
    required this.longitude,
    this.address,
    this.isAnonymous = false,
    this.incidentDateTime,
    this.isOngoing = false,
    this.isEmergency = false,
    this.suspectInfo,
    this.victimInfo,
    this.witnessInfo,
    this.decibelLevel,
    this.noiseAreaType,
    this.images = const [],
    this.video,
    this.audio,
  });
}

class ReportsRepository {
  final _api = ApiClient.instance;

  Future<List<Report>> fetchMyReports() async {
    final res = await _api.get('/reports/my-reports');
    final data = res['data'];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().map(Report.fromJson).toList();
    }
    return const [];
  }

  Future<List<Report>> fetchNearbyReports({
    double lat = 9.0107,
    double lng = 38.7612,
    double radiusKm = 25,
  }) async {
    final res = await _api.get('/reports/nearby-citizen', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radiusKm': radiusKm,
    });
    final data = res['data'];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().map(Report.fromJson).toList();
    }
    return const [];
  }

  Future<Report> fetchReportDetail(String id) async {
    final res = await _api.get('/reports/$id');
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Report> fetchTrackedReport(String caseId) async {
    final res = await _api.get('/reports/track/$caseId');
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReportLog>> fetchReportHistory(String id) async {
    final res = await _api.get('/reports/$id/history');
    final data = res['data'];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().map(ReportLog.fromJson).toList();
    }
    return const [];
  }

  Future<Report> createReport(CreateReportPayload payload) async {
    final form = FormData();
    void addString(String key, Object? value) {
      if (value != null) form.fields.add(MapEntry(key, value.toString()));
    }

    addString('violationType', payload.violationType);
    addString('reportDescription', payload.reportDescription);
    addString('latitude', payload.latitude);
    addString('longitude', payload.longitude);
    addString('address', payload.address);
    addString('isAnonymous', payload.isAnonymous);
    addString('incidentDateTime', payload.incidentDateTime);
    addString('isOngoing', payload.isOngoing);
    addString('isEmergency', payload.isEmergency);
    addString('suspectInfo', payload.suspectInfo);
    addString('victimInfo', payload.victimInfo);
    addString('witnessInfo', payload.witnessInfo);
    addString('decibelLevel', payload.decibelLevel);
    addString('noiseAreaType', payload.noiseAreaType);
    addString('deviceId', SessionManager.instance.deviceId);
    addString('devicePlatform', 'ANDROID');
    addString('appVersion', '1.0.0');

    for (final img in payload.images) {
      if (img.xfile != null) {
        form.files.add(MapEntry(
          'images',
          MultipartFile.fromBytes(
            await img.xfile!.readAsBytes(),
            filename: img.fileName,
            contentType:
                DioMediaType.parse(img.mimeType ?? 'image/jpeg'),
          ),
        ));
      } else if (img.file != null) {
        form.files.add(MapEntry(
          'images',
          MultipartFile.fromFileSync(
            img.file!.path,
            filename: img.fileName,
            contentType: DioMediaType.parse(img.mimeType ?? 'image/jpeg'),
          ),
        ));
      }
    }
    if (payload.video != null && payload.video!.xfile != null) {
      form.files.add(MapEntry(
        'video',
        MultipartFile.fromBytes(
          await payload.video!.xfile!.readAsBytes(),
          filename: payload.video!.fileName,
          contentType:
              DioMediaType.parse(payload.video!.mimeType ?? 'video/mp4'),
        ),
      ));
    } else if (payload.video != null && payload.video!.file != null) {
      form.files.add(MapEntry(
        'video',
        MultipartFile.fromFileSync(
          payload.video!.file!.path,
          filename: payload.video!.fileName,
          contentType: DioMediaType.parse(payload.video!.mimeType ?? 'video/mp4'),
        ),
      ));
    }
    if (payload.audio != null && payload.audio!.file != null) {
      form.files.add(MapEntry(
        'audio',
        MultipartFile.fromFileSync(
          payload.audio!.file!.path,
          filename: payload.audio!.fileName,
          contentType: DioMediaType.parse(payload.audio!.mimeType ?? 'audio/m4a'),
        ),
      ));
    }

    final res = await _api.post('/reports', data: form);
    return Report.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReportType>> fetchReportTypes() async {
    final res = await _api.get('/report-types', headers: {
      'Accept': 'application/json',
    });
    final data = res['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(ReportType.fromJson)
          .where((t) => t.isActive != false)
          .toList();
    }
    return _defaultTypes;
  }

  static const _defaultTypes = [
    ReportType(id: 't1', name: 'Robbery', description: 'Theft or crime'),
    ReportType(id: 't2', name: 'Illegal Weapons', description: 'Illegal weapon possession'),
    ReportType(id: 't3', name: 'Forgery', description: 'Forgery, fraud or illegal money'),
    ReportType(id: 't4', name: 'Security Threat', description: 'Threat to security'),
    ReportType(id: 't5', name: 'Street Children', description: 'Street children / begging'),
    ReportType(id: 't6', name: 'Disruptive Activity', description: 'Disruptive or illegal activity'),
    ReportType(id: 't7', name: 'Illegal Business', description: 'Illegal business or broker activity'),
    ReportType(id: 't8', name: 'Event Security', description: 'Event / holiday security screen'),
    ReportType(id: 't9', name: 'Inspection Request', description: 'Institution inspection request'),
    ReportType(id: 't10', name: 'Noise Pollution', description: 'Excessive noise'),
  ];
}