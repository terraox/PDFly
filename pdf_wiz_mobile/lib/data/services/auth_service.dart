import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/api_config.dart';

class AuthService {
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  static const String baseUrl = ApiConfig.authUrl; 

  Future<String> register(String email) async {
    try {
      // The backend expects a password even for registration, though it generates one.
      // We send a placeholder as per the frontend logic.
      final response = await _dio.post(
        '$baseUrl/register',
        data: {
          'email': email,
          'password': 'generated_password', 
        },
      );

      if (response.statusCode == 200) {
        return response.data.toString();
      } else {
        throw Exception('Invalid response from server');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        throw Exception('This email is already registered. Please login.');
      }
      throw Exception('Registration failed: ${e.message}');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '$baseUrl/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data['token'] != null) {
        final token = response.data['token'];
        await _storage.write(key: 'jwt_token', value: token);
        return response.data;
      } else {
        throw Exception('Invalid response from server');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('Invalid email or access key');
      }
      throw Exception('Login failed: ${e.message}');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }
  Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      final response = await _dio.post(
        '$baseUrl/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to change password');
      }
    } on DioException catch (e) {
      throw Exception('Change password failed: ${e.message}');
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      final response = await _dio.post(
        '$baseUrl/forgot-password', // Assuming this endpoint exists
        data: {'email': email},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to send reset link');
      }
    } on DioException catch (e) {
      throw Exception('Forgot password failed: ${e.message}');
    }
  }
}
