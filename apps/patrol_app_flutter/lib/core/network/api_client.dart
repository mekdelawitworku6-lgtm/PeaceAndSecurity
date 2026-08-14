import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../services/session_manager.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final bool isUnauthorized;

  const ApiException({
    this.statusCode,
    required this.message,
    this.isUnauthorized = false,
  });

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 45),
        sendTimeout: const Duration(seconds: 45),
        headers: {
          'x-device-platform': 'ANDROID',
          'x-app-version': AppConfig.appVersion,
          'x-device-id': SessionManager.instance.deviceId,
        },
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = SessionManager.instance.accessToken;
          if (token != null &&
              token.isNotEmpty &&
              !options.headers.containsKey('Authorization')) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401 &&
              !(error.requestOptions.path.contains('/auth/'))) {
            SessionManager.instance.onUnauthorized();
          }
          handler.next(error);
        },
      ),
    );
  }

  static final ApiClient instance = ApiClient._internal();
  late final Dio _dio;

  Future<Map<String, dynamic>> post(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) =>
      _request(() => _dio.post(path,
          data: data, queryParameters: queryParameters, options: Options(headers: headers)));

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) =>
      _request(() => _dio.get(path,
          queryParameters: queryParameters, options: Options(headers: headers)));

  Future<Map<String, dynamic>> patch(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Map<String, dynamic>? headers,
  }) =>
      _request(() => _dio.patch(path,
          data: data, queryParameters: queryParameters, options: Options(headers: headers)));

  Future<Map<String, dynamic>> put(
    String path, {
    Object? data,
  }) =>
      _request(() => _dio.put(path, data: data));

  Future<Map<String, dynamic>> delete(String path) =>
      _request(() => _dio.delete(path));

  Future<Map<String, dynamic>> _request(
    Future<Response<dynamic>> Function() request,
  ) async {
    try {
      final response = await request();
      final body = response.data;
      if (body is Map<String, dynamic>) {
        if (body['success'] == false) {
          throw ApiException(
            statusCode: response.statusCode,
            message: body['message'] as String? ?? 'Request failed',
          );
        }
        if (body.containsKey('data')) {
          return body;
        }
      }
      return {'data': body};
    } on DioException catch (e) {
      final data = e.response?.data;
      if (data is Map<String, dynamic> && data['message'] != null) {
        final msg = data['message'];
        throw ApiException(
          statusCode: e.response?.statusCode,
          message: msg is List ? msg.join(', ') : msg.toString(),
          isUnauthorized: e.response?.statusCode == 401,
        );
      }
      throw ApiException(
        statusCode: e.response?.statusCode,
        message: _networkErrorMessage(e),
      );
    }
  }

  String _networkErrorMessage(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please try again.';
      case DioExceptionType.connectionError:
        return 'Cannot reach the server. Check your internet connection.';
      default:
        return e.message ?? 'Something went wrong';
    }
  }
}

String handleError(Object e) {
  if (e is ApiException) return e.message;
  if (e is String) return e;
  return 'Something went wrong';
}