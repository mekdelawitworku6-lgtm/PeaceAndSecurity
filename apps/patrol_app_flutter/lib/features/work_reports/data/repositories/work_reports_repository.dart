import '../../../../core/network/api_client.dart';

class WorkReport {
  final String id;
  final String title;
  final String description;
  final String? reportDate;
  final String status;
  final String? reporterName;
  final String? reporterRole;
  final String? reviewNote;
  final double? latitude;
  final double? longitude;
  final String? createdAt;

  const WorkReport({
    required this.id,
    required this.title,
    required this.description,
    this.reportDate,
    required this.status,
    this.reporterName,
    this.reporterRole,
    this.reviewNote,
    this.latitude,
    this.longitude,
    this.createdAt,
  });

  factory WorkReport.fromJson(Map<String, dynamic> json) => WorkReport(
        id: json['id'] as String,
        title: json['title'] as String? ?? '',
        description: json['description'] as String? ?? '',
        reportDate: json['reportDate'] as String?,
        status: json['status'] as String? ?? 'SUBMITTED',
        reporterName: json['reporterName'] as String?,
        reporterRole: json['reporterRole'] as String?,
        reviewNote: json['reviewNote'] as String?,
        latitude: num.tryParse('${json['latitude']}')?.toDouble(),
        longitude: num.tryParse('${json['longitude']}')?.toDouble(),
        createdAt: json['createdAt'] as String?,
      );
}

class SubmitWorkReportPayload {
  final String title;
  final String description;
  final String? reportDate;
  final double? latitude;
  final double? longitude;

  const SubmitWorkReportPayload({
    required this.title,
    required this.description,
    this.reportDate,
    this.latitude,
    this.longitude,
  });
}

class WorkReportsRepository {
  final _api = ApiClient.instance;

  Future<List<WorkReport>> fetchMine({String? status}) async {
    final res = await _api.get('/work-reports', queryParameters: {
      if (status != null && status.isNotEmpty) 'status': status,
      'limit': 50,
    });
    final data = res['data'];
    if (data is List) {
      return data
          .map((e) => WorkReport.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    final items = (data as Map<String, dynamic>?)?['data'] as List<dynamic>? ??
        [];
    return items
        .map((e) => WorkReport.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<WorkReport> fetchById(String id) async {
    final res = await _api.get('/work-reports/$id');
    final data = res['data'] as Map<String, dynamic>? ?? {};
    return WorkReport.fromJson(data);
  }

  Future<WorkReport> submit(SubmitWorkReportPayload payload) async {
    final res = await _api.post('/work-reports', data: {
      'title': payload.title,
      'description': payload.description,
      if (payload.reportDate != null) 'reportDate': payload.reportDate,
      if (payload.latitude != null) 'latitude': payload.latitude,
      if (payload.longitude != null) 'longitude': payload.longitude,
    });
    final data = res['data'] as Map<String, dynamic>? ?? {};
    return WorkReport.fromJson(data);
  }
}