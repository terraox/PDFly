import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';
import '../../core/config/api_config.dart';

class PdfService {
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  static const String baseUrl = ApiConfig.toolsUrl;

  Future<String> processFile({
    required String endpoint,
    required PlatformFile file,
    Map<String, dynamic>? extraParams,
  }) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      
      String fileName = file.name;
      String filePath = file.path!; // Mobile always has path

      FormData formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
        ...?extraParams,
      });

      final response = await _dio.post(
        '$baseUrl/$endpoint',
        data: formData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
          responseType: ResponseType.bytes, // Expect binary PDF/ZIP
        ),
      );

      if (response.statusCode == 200) {
        // Save the file
        final dir = await getApplicationDocumentsDirectory();
        final savePath = '${dir.path}/processed_$fileName';
        final file = File(savePath);
        await file.writeAsBytes(response.data);
        return savePath;
      } else {
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Processing failed: $e');
    }
  }

  // Special case for Merge which takes multiple files
  Future<String> mergeFiles(List<PlatformFile> files) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      
      FormData formData = FormData();
      
      for (var file in files) {
        formData.files.add(MapEntry(
          'files',
          await MultipartFile.fromFile(file.path!, filename: file.name),
        ));
      }

      final response = await _dio.post(
        '$baseUrl/merge',
        data: formData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
          responseType: ResponseType.bytes,
        ),
      );

      if (response.statusCode == 200) {
        final dir = await getApplicationDocumentsDirectory();
        final savePath = '${dir.path}/merged.pdf';
        final file = File(savePath);
        await file.writeAsBytes(response.data);
        return savePath;
      } else {
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Merge failed: $e');
    }
  }
  Future<int> getPageCount(PlatformFile file) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path!, filename: file.name),
      });

      final response = await _dio.post(
        '$baseUrl/page-count',
        data: formData,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        return response.data['count'] as int;
      } else {
        throw Exception('Failed to get page count');
      }
    } catch (e) {
      throw Exception('Page count failed: $e');
    }
  }

  Future<List<int>> getPreviewPage(PlatformFile file, int pageIndex) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path!, filename: file.name),
        'page': pageIndex,
      });

      final response = await _dio.post(
        '$baseUrl/preview-page',
        data: formData,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          responseType: ResponseType.bytes,
        ),
      );

      if (response.statusCode == 200) {
        return response.data as List<int>;
      } else {
        throw Exception('Failed to get preview');
      }
    } catch (e) {
      throw Exception('Preview failed: $e');
    }
  }
}
