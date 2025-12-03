import 'package:file_picker/file_picker.dart';

class FilePickerService {
  Future<PlatformFile?> pickPdfFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true, // Needed for web/some implementations if we want bytes immediately
      );

      if (result != null && result.files.isNotEmpty) {
        return result.files.first;
      }
      return null;
    } catch (e) {
      throw Exception('Error picking file: $e');
    }
  }

  Future<List<PlatformFile>> pickMultiplePdfFiles() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        allowMultiple: true,
        withData: true,
      );

      if (result != null) {
        return result.files;
      }
      return [];
    } catch (e) {
      throw Exception('Error picking files: $e');
    }
  }
}
