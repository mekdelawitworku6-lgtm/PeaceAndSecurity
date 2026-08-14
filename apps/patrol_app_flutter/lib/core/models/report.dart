
class Person {
  final String? id;
  final String? fullName;
  final String? phoneNumber;
  final String? profileImage;
  final String? assignedArea;

  const Person({
    this.id,
    this.fullName,
    this.phoneNumber,
    this.profileImage,
    this.assignedArea,
  });

  factory Person.fromJson(Map<String, dynamic> json) => Person(
        id: json['id'] as String?,
        fullName: json['fullName'] as String?,
        phoneNumber: json['phoneNumber'] as String?,
        profileImage: json['profileImage'] as String?,
        assignedArea: json['assignedArea'] as String?,
      );
}

class Report {
  final String id;
  final String? caseId;
  final String? reporterId;
  final Person? reporter;
  final String? reporterPhoneNumber;
  final String? reportTypeId;
  final ReportTypeRef? reportType;
  final String? violationType;
  final String? reportDescription;
  final double latitude;
  final double longitude;
  final String? address;
  final String? area;
  final List<String> imageUrls;
  final List<String> videoUrls;
  final List<String> audioUrls;
  final List<String> evidenceUrls;
  final double? decibelLevel;
  final String? noiseAreaType;
  final String? noisePollutionStatus;
  final bool isAnonymous;
  final String status;
  final String? assignedPatrolId;
  final Person? assignedPatrol;
  final String? assignedAt;
  final String? inspectionStartedAt;
  final String? inspectionCompletedAt;
  final String? patrolNotes;
  final List<String> patrolImageUrls;
  final List<String> patrolVideoUrls;
  final List<String> patrolAudioUrls;
  final List<String> patrolEvidenceUrls;
  final String? rejectionReason;
  final String? incidentDateTime;
  final bool isOngoing;
  final bool isEmergency;
  final String? suspectInfo;
  final String? victimInfo;
  final String? witnessInfo;
  final String? createdAt;
  final String? updatedAt;
  final double? distanceKm;

  const Report({
    required this.id,
    this.caseId,
    this.reporterId,
    this.reporter,
    this.reporterPhoneNumber,
    this.reportTypeId,
    this.reportType,
    this.violationType,
    this.reportDescription,
    required this.latitude,
    required this.longitude,
    this.address,
    this.area,
    this.imageUrls = const [],
    this.videoUrls = const [],
    this.audioUrls = const [],
    this.evidenceUrls = const [],
    this.decibelLevel,
    this.noiseAreaType,
    this.noisePollutionStatus,
    this.isAnonymous = false,
    this.status = 'SUBMITTED',
    this.assignedPatrolId,
    this.assignedPatrol,
    this.assignedAt,
    this.inspectionStartedAt,
    this.inspectionCompletedAt,
    this.patrolNotes,
    this.patrolImageUrls = const [],
    this.patrolVideoUrls = const [],
    this.patrolAudioUrls = const [],
    this.patrolEvidenceUrls = const [],
    this.rejectionReason,
    this.incidentDateTime,
    this.isOngoing = false,
    this.isEmergency = false,
    this.suspectInfo,
    this.victimInfo,
    this.witnessInfo,
    this.createdAt,
    this.updatedAt,
    this.distanceKm,
  });

  String get typeLabel =>
      reportType?.name ?? violationType ?? 'Report';

  factory Report.fromJson(Map<String, dynamic> json) => Report(
        id: json['id'] as String,
        caseId: json['caseId'] as String?,
        reporterId: json['reporterId'] as String?,
        reporter: json['reporter'] != null
            ? Person.fromJson(json['reporter'] as Map<String, dynamic>)
            : null,
        reporterPhoneNumber: json['reporterPhoneNumber'] as String?,
        reportTypeId: json['reportTypeId'] as String?,
        reportType: json['reportType'] != null
            ? ReportTypeRef.fromJson(json['reportType'] as Map<String, dynamic>)
            : null,
        violationType: json['violationType'] as String?,
        reportDescription: json['reportDescription'] as String?,
        latitude: num.tryParse('${json['latitude']}')?.toDouble() ?? 0,
        longitude: num.tryParse('${json['longitude']}')?.toDouble() ?? 0,
        address: json['address'] as String?,
        area: json['area'] as String?,
        imageUrls: _stringList(json['imageUrls']),
        videoUrls: _stringList(json['videoUrls']),
        audioUrls: _stringList(json['audioUrls']),
        evidenceUrls: _stringList(json['evidenceUrls']),
        decibelLevel: num.tryParse('${json['decibelLevel']}')?.toDouble(),
        noiseAreaType: json['noiseAreaType'] as String?,
        noisePollutionStatus: json['noisePollutionStatus'] as String?,
        isAnonymous: json['isAnonymous'] as bool? ?? false,
        status: json['status'] as String? ?? 'SUBMITTED',
        assignedPatrolId: json['assignedPatrolId'] as String?,
        assignedPatrol: json['assignedPatrol'] != null
            ? Person.fromJson(json['assignedPatrol'] as Map<String, dynamic>)
            : null,
        assignedAt: json['assignedAt'] as String?,
        inspectionStartedAt: json['inspectionStartedAt'] as String?,
        inspectionCompletedAt: json['inspectionCompletedAt'] as String?,
        patrolNotes: json['patrolNotes'] as String?,
        patrolImageUrls: _stringList(json['patrolImageUrls']),
        patrolVideoUrls: _stringList(json['patrolVideoUrls']),
        patrolAudioUrls: _stringList(json['patrolAudioUrls']),
        patrolEvidenceUrls: _stringList(json['patrolEvidenceUrls']),
        rejectionReason: json['rejectionReason'] as String?,
        incidentDateTime: json['incidentDateTime'] as String?,
        isOngoing: json['isOngoing'] as bool? ?? false,
        isEmergency: json['isEmergency'] as bool? ?? false,
        suspectInfo: json['suspectInfo'] as String?,
        victimInfo: json['victimInfo'] as String?,
        witnessInfo: json['witnessInfo'] as String?,
        createdAt: json['createdAt'] as String?,
        updatedAt: json['updatedAt'] as String?,
        distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      );

  static List<String> _stringList(dynamic value) {
    if (value is List) return value.whereType<String>().toList();
    if (value is String && value.isNotEmpty) return [value];
    return const [];
  }

  Report copyWith({
    String? status,
    Person? assignedPatrol,
    String? assignedAt,
    String? inspectionStartedAt,
    String? inspectionCompletedAt,
    String? patrolNotes,
    List<String>? patrolImageUrls,
    List<String>? patrolVideoUrls,
    List<String>? patrolAudioUrls,
    List<String>? patrolEvidenceUrls,
    String? rejectionReason,
  }) =>
      Report(
        id: id,
        caseId: caseId,
        reporterId: reporterId,
        reporter: reporter,
        reporterPhoneNumber: reporterPhoneNumber,
        reportTypeId: reportTypeId,
        reportType: reportType,
        violationType: violationType,
        reportDescription: reportDescription,
        latitude: latitude,
        longitude: longitude,
        address: address,
        area: area,
        imageUrls: imageUrls,
        videoUrls: videoUrls,
        audioUrls: audioUrls,
        evidenceUrls: evidenceUrls,
        decibelLevel: decibelLevel,
        noiseAreaType: noiseAreaType,
        noisePollutionStatus: noisePollutionStatus,
        isAnonymous: isAnonymous,
        status: status ?? this.status,
        assignedPatrolId: assignedPatrolId,
        assignedPatrol: assignedPatrol ?? this.assignedPatrol,
        assignedAt: assignedAt ?? this.assignedAt,
        inspectionStartedAt: inspectionStartedAt ?? this.inspectionStartedAt,
        inspectionCompletedAt:
            inspectionCompletedAt ?? this.inspectionCompletedAt,
        patrolNotes: patrolNotes ?? this.patrolNotes,
        patrolImageUrls: patrolImageUrls ?? this.patrolImageUrls,
        patrolVideoUrls: patrolVideoUrls ?? this.patrolVideoUrls,
        patrolAudioUrls: patrolAudioUrls ?? this.patrolAudioUrls,
        patrolEvidenceUrls: patrolEvidenceUrls ?? this.patrolEvidenceUrls,
        rejectionReason: rejectionReason ?? this.rejectionReason,
        incidentDateTime: incidentDateTime,
        isOngoing: isOngoing,
        isEmergency: isEmergency,
        suspectInfo: suspectInfo,
        victimInfo: victimInfo,
        witnessInfo: witnessInfo,
        createdAt: createdAt,
        updatedAt: updatedAt,
        distanceKm: distanceKm,
      );
}

class ReportTypeRef {
  final String? id;
  final String? name;

  const ReportTypeRef({this.id, this.name});

  factory ReportTypeRef.fromJson(Map<String, dynamic> json) => ReportTypeRef(
        id: json['id'] as String?,
        name: json['name'] as String?,
      );
}

class ReportLog {
  final String id;
  final String? status;
  final String? note;
  final String? changedById;
  final String? changedByType;
  final String? changedByName;
  final String? createdAt;

  const ReportLog({
    required this.id,
    this.status,
    this.note,
    this.changedById,
    this.changedByType,
    this.changedByName,
    this.createdAt,
  });

  factory ReportLog.fromJson(Map<String, dynamic> json) => ReportLog(
        id: json['id'] as String,
        status: json['status'] as String?,
        note: json['note'] as String?,
        changedById: json['changedById'] as String?,
        changedByType: json['changedByType'] as String?,
        changedByName: json['changedByName'] as String?,
        createdAt: json['createdAt'] as String?,
      );
}

class NearbyReportsResponse {
  final NearbyLocation? patrolOfficeLocation;
  final double? radiusKm;
  final int? total;
  final List<Report> reports;

  const NearbyReportsResponse({
    this.patrolOfficeLocation,
    this.radiusKm,
    this.total,
    this.reports = const [],
  });

  factory NearbyReportsResponse.fromJson(Map<String, dynamic> json) =>
      NearbyReportsResponse(
        patrolOfficeLocation: json['patrolOfficeLocation'] != null
            ? NearbyLocation.fromJson(
                json['patrolOfficeLocation'] as Map<String, dynamic>)
            : null,
        radiusKm: (json['radiusKm'] as num?)?.toDouble(),
        total: json['total'] as int?,
        reports: (json['reports'] as List? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(Report.fromJson)
            .toList(),
      );
}

class NearbyLocation {
  final double latitude;
  final double longitude;
  final String? address;

  const NearbyLocation({required this.latitude, required this.longitude, this.address});

  factory NearbyLocation.fromJson(Map<String, dynamic> json) => NearbyLocation(
        latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
        longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
        address: json['address'] as String?,
      );
}