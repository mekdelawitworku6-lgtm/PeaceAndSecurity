import '../../../core/network/api_client.dart';

class TeamMember {
  final String id;
  final String? fullName;
  final String? phoneNumber;
  final String? profileImage;
  final String status;
  final double? latitude;
  final double? longitude;

  TeamMember({
    required this.id,
    this.fullName,
    this.phoneNumber,
    this.profileImage,
    this.status = 'OFFLINE',
    this.latitude,
    this.longitude,
  });

  factory TeamMember.fromJson(Map<String, dynamic> json) => TeamMember(
        id: '${json['id']}',
        fullName: json['fullName'] as String?,
        phoneNumber: json['phoneNumber'] as String?,
        profileImage: json['profileImage'] as String?,
        status: '${json['status'] ?? 'OFFLINE'}',
        latitude: num.tryParse('${json['latitude']}')?.toDouble(),
        longitude: num.tryParse('${json['longitude']}')?.toDouble(),
      );

  bool get isOnline =>
      status == 'ONLINE' || status == 'ON_DUTY' || status == 'ACTIVE';
}

class PatrolTeam {
  final String id;
  final String? name;
  final String? code;
  final String? woredaId;
  final String? woredaName;
  final TeamMember? leader;
  final List<TeamMember> members;

  PatrolTeam({
    required this.id,
    this.name,
    this.code,
    this.woredaId,
    this.woredaName,
    this.leader,
    this.members = const [],
  });

  factory PatrolTeam.fromJson(Map<String, dynamic> json) => PatrolTeam(
        id: '${json['id']}',
        name: json['name'] as String?,
        code: json['code'] as String?,
        woredaId: json['woredaId'] as String?,
        woredaName: json['woredaName'] as String?,
        leader: json['leader'] != null
            ? TeamMember.fromJson(json['leader'] as Map<String, dynamic>)
            : null,
        members: (json['members'] as List? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(TeamMember.fromJson)
            .toList(),
      );
}

class TeamRepository {
  final ApiClient _client = ApiClient.instance;

  Future<PatrolTeam?> fetchMyTeam() async {
    final response = await _client.get('/patrol-teams/my');
    final data = response['data'];
    if (data == null) return null;
    return PatrolTeam.fromJson(data as Map<String, dynamic>);
  }
}