class Citizen {
  final String id;
  final String? userCode;
  final String fullName;
  final String phoneNumber;
  final String role;
  final String? profileImage;
  final String? status;
  final String? createdAt;

  const Citizen({
    required this.id,
    this.userCode,
    required this.fullName,
    required this.phoneNumber,
    this.role = 'CITIZEN',
    this.profileImage,
    this.status,
    this.createdAt,
  });

  factory Citizen.fromJson(Map<String, dynamic> json) => Citizen(
        id: json['id'] as String,
        userCode: json['userCode'] as String?,
        fullName: json['fullName'] as String? ?? '',
        phoneNumber: json['phoneNumber'] as String? ?? '',
        role: json['role'] as String? ?? 'CITIZEN',
        profileImage: json['profileImage'] as String?,
        status: json['status'] as String?,
        createdAt: json['createdAt'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'userCode': userCode,
        'fullName': fullName,
        'phoneNumber': phoneNumber,
        'role': role,
        'profileImage': profileImage,
        'status': status,
        'createdAt': createdAt,
      };
}

class LoginData {
  final String accessToken;
  final String refreshToken;
  final Citizen user;

  const LoginData({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory LoginData.fromJson(Map<String, dynamic> json) => LoginData(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String? ?? '',
        user: Citizen.fromJson(json['user'] as Map<String, dynamic>),
      );
}

class RegisterData {
  final String? registrationToken;
  final int? expiresIn;
  final Map<String, dynamic>? citizen;

  const RegisterData({this.registrationToken, this.expiresIn, this.citizen});

  factory RegisterData.fromJson(Map<String, dynamic> json) => RegisterData(
        registrationToken: json['registrationToken'] as String?,
        expiresIn: json['expiresIn'] as int?,
        citizen: json['citizen'] as Map<String, dynamic>?,
      );
}

class PatrolUser {
  final String id;
  final String? userCode;
  final String fullName;
  final String phoneNumber;
  final String role;
  final String? profileImage;
  final String? status;
  final String? assignedArea;
  final String? officeAddress;
  final double? officeLatitude;
  final double? officeLongitude;
  final double? latitude;
  final double? longitude;
  final String? createdAt;

  const PatrolUser({
    required this.id,
    this.userCode,
    required this.fullName,
    required this.phoneNumber,
    this.role = 'PATROL',
    this.profileImage,
    this.status,
    this.assignedArea,
    this.officeAddress,
    this.officeLatitude,
    this.officeLongitude,
    this.latitude,
    this.longitude,
    this.createdAt,
  });

  factory PatrolUser.fromJson(Map<String, dynamic> json) => PatrolUser(
        id: json['id'] as String,
        userCode: json['userCode'] as String?,
        fullName: json['fullName'] as String? ?? '',
        phoneNumber: json['phoneNumber'] as String? ?? '',
        role: json['role'] as String? ?? 'PATROL',
        profileImage: json['profileImage'] as String?,
        status: json['status'] as String?,
        assignedArea: json['assignedArea'] as String?,
        officeAddress: json['officeAddress'] as String?,
        officeLatitude: (json['officeLatitude'] as num?)?.toDouble(),
        officeLongitude: (json['officeLongitude'] as num?)?.toDouble(),
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        createdAt: json['createdAt'] as String?,
      );
}