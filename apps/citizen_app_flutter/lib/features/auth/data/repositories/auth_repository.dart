
import 'package:dio/dio.dart';

import '../../../../core/models/user.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/session_manager.dart';
import '../../../../core/utils/media_helpers.dart';

class AuthRepository {
  final _api = ApiClient.instance;

  Future<LoginData> login({
    required String phoneNumber,
    required String pin,
  }) async {
    final res = await _api.post('/auth/citizen/login', data: {
      'phoneNumber': phoneNumber,
      'pin': pin,
      'deviceId': SessionManager.instance.deviceId,
    });
    return LoginData.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<RegisterData> register({
    required String fullName,
    required String phoneNumber,
    String? pin,
    PickedMedia? profileImage,
  }) async {
    final form = FormData();
    form.fields.add(MapEntry('fullName', fullName));
    form.fields.add(MapEntry('phoneNumber', phoneNumber));
    form.fields.add(
        MapEntry('deviceId', SessionManager.instance.deviceId));
    if (pin != null) form.fields.add(MapEntry('pin', pin));
    if (profileImage != null && profileImage.xfile != null) {
      form.files.add(MapEntry(
        'profileImage',
        MultipartFile.fromBytes(
          await profileImage.xfile!.readAsBytes(),
          filename: profileImage.fileName,
          contentType:
              DioMediaType.parse(profileImage.mimeType ?? 'image/jpeg'),
        ),
      ));
    } else if (profileImage != null && profileImage.file != null) {
      form.files.add(MapEntry(
        'profileImage',
        MultipartFile.fromFileSync(
          profileImage.file!.path,
          filename: profileImage.fileName,
          contentType: DioMediaType.parse(profileImage.mimeType ?? 'image/jpeg'),
        ),
      ));
    }
    final res = await _api.post('/auth/citizen/register', data: form);
    return RegisterData.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> preLogin(String phoneNumber) async {
    final res = await _api.post('/auth/citizen/pre-login', data: {
      'phoneNumber': phoneNumber,
    });
    return res['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String registrationToken,
    required String otpCode,
    String otpType = 'REGISTRATION-OTP',
  }) async {
    final res = await _api.post(
      '/auth/citizen/verify',
      data: {'otpCode': otpCode, 'otpType': otpType},
      headers: {'Authorization': 'Bearer $registrationToken'},
    );
    return res['data'] as Map<String, dynamic>;
  }

  Future<void> resendOtp({
    required String registrationToken,
    String otpType = 'REGISTRATION-OTP',
  }) async {
    await _api.post(
      '/auth/citizen/resend-otp',
      data: {'otpType': otpType},
      headers: {'Authorization': 'Bearer $registrationToken'},
    );
  }

  Future<LoginData> setPin({
    required String setPinToken,
    required String pin,
  }) async {
    final res = await _api.post(
      '/auth/citizen/set-pin',
      data: {'pin': pin},
      headers: {'Authorization': 'Bearer $setPinToken'},
    );
    return LoginData.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> pinResetRequest({
    required String phoneNumber,
    String type = 'RESET',
  }) async {
    final res = await _api.post('/auth/citizen/pin-reset/request', data: {
      'phoneNumber': phoneNumber,
      'type': type,
    });
    return res['data'] as Map<String, dynamic>;
  }

  Future<void> pinResetConfirm({
    required String resetToken,
    required String otpCode,
    required String newPin,
  }) async {
    await _api.post(
      '/auth/citizen/pin-reset/confirm',
      data: {'otpCode': otpCode, 'newPin': newPin},
      headers: {'Authorization': 'Bearer $resetToken'},
    );
  }

  Future<void> changePin({
    required String currentPin,
    required String newPin,
  }) async {
    await _api.patch('/auth/pin/change', data: {
      'currentPin': currentPin,
      'newPin': newPin,
    });
  }

  Future<String> refreshAccessToken() async {
    final res = await _api.post('/auth/refresh', data: {
      'refreshToken': SessionManager.instance.refreshToken,
    });
    return (res['data'] as Map<String, dynamic>)['accessToken'] as String;
  }

  String normalizePhone(String input) {
    var digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('251')) {
      digits = digits.substring(3);
    }
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    return '+251$digits';
  }
}