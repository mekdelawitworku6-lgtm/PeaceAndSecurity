import '../../../../core/models/user.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/session_manager.dart';

class AuthRepository {
  final _api = ApiClient.instance;

  Future<LoginData> login({
    required String phoneNumber,
    required String pin,
  }) async {
    final res = await _api.post('/auth/patrol/login', data: {
      'phoneNumber': phoneNumber,
      'pin': pin,
    });
    return LoginData.fromJson(res['data'] as Map<String, dynamic>);
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