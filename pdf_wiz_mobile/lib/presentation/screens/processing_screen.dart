import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:open_file/open_file.dart';
import '../../core/theme/app_colors.dart';
import '../../data/services/pdf_service.dart';

class ProcessingScreen extends StatefulWidget {
  final String toolName;
  final PlatformFile? file;
  final List<PlatformFile>? files;

  const ProcessingScreen({
    super.key,
    required this.toolName,
    this.file,
    this.files,
  });

  @override
  State<ProcessingScreen> createState() => _ProcessingScreenState();
}

class _ProcessingScreenState extends State<ProcessingScreen> {
  final PdfService _pdfService = PdfService();
  bool _isProcessing = true;
  String? _errorMessage;
  String? _resultPath;

  @override
  void initState() {
    super.initState();
    // Delay slightly to allow UI to build before showing dialogs
    Future.delayed(Duration.zero, _collectParameters);
  }

  Future<void> _collectParameters() async {
    Map<String, dynamic> params = {};

    try {
      if (widget.toolName == 'Protect' || widget.toolName == 'Unlock') {
        final password = await _showInputDialog(
          title: '${widget.toolName} PDF',
          label: 'Enter Password',
          obscureText: true,
        );
        if (password == null || password.isEmpty) {
          if (mounted) context.go('/home'); // Cancelled
          return;
        }
        params['password'] = password;
      } else if (widget.toolName == 'Compress') {
        final level = await _showSingleSelectDialog(
          title: 'Compress PDF',
          label: 'Compression Level',
          options: ['Recommended', 'Extreme', 'Less'],
        );
        if (level == null) {
          if (mounted) context.go('/home');
          return;
        }
        params['level'] = level.toLowerCase();
      } else if (widget.toolName == 'Split PDF') {
        // 1. Select Mode
        final mode = await _showSingleSelectDialog(
          title: 'Split PDF',
          label: 'Split Mode',
          options: ['All Pages', 'Every N Pages', 'Custom Range'],
        );
        if (mode == null) {
          if (mounted) context.go('/home');
          return;
        }

        if (mode == 'All Pages') {
          params['splitMode'] = 'all';
        } else if (mode == 'Every N Pages') {
          params['splitMode'] = 'every';
          final n = await _showInputDialog(
            title: 'Split Every N Pages',
            label: 'Number of pages per file',
          );
          if (n == null || n.isEmpty) {
            if (mounted) context.go('/home');
            return;
          }
          params['pagesPerFile'] = int.tryParse(n) ?? 1;
        } else if (mode == 'Custom Range') {
          params['splitMode'] = 'range';
          final ranges = await _showInputDialog(
            title: 'Custom Range',
            label: 'Page Ranges (e.g. 1-3, 5-7)',
          );
          if (ranges == null || ranges.isEmpty) {
            if (mounted) context.go('/home');
            return;
          }
          params['pageRanges'] = ranges;
        }
      } else if (widget.toolName == 'Crop') {
        // 1. Get Coordinates
        final coords = await _showInputDialog(
          title: 'Crop PDF',
          label: 'Enter X, Y, Width, Height (e.g. 50,50,400,600)',
        );
        if (coords == null || coords.isEmpty) {
          if (mounted) context.go('/home');
          return;
        }
        
        final parts = coords.split(',');
        if (parts.length != 4) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid format. Use: x,y,w,h')));
           if (mounted) context.go('/home');
           return;
        }

        params['x'] = double.tryParse(parts[0].trim()) ?? 0;
        params['y'] = double.tryParse(parts[1].trim()) ?? 0;
        params['width'] = double.tryParse(parts[2].trim()) ?? 0;
        params['height'] = double.tryParse(parts[3].trim()) ?? 0;
        params['scope'] = 'all'; // Default to all for simplicity on mobile
        params['pageIndex'] = 0;

      } else if (widget.toolName == 'Page Numbers') {
        final position = await _showSingleSelectDialog(
          title: 'Add Page Numbers',
          label: 'Position',
          options: ['Bottom Center', 'Bottom Left', 'Bottom Right', 'Top Center', 'Top Left', 'Top Right'],
        );
        if (position == null) {
          if (mounted) context.go('/home');
          return;
        }
        params['position'] = position.toLowerCase().replaceAll(' ', '-');
        
        // Optional: Start Page
        // For simplicity, we can default others or ask for them. 
        // Let's stick to position for now as per plan, but maybe add margin default.
        params['margin'] = 'recommended';
      } else if (widget.toolName == 'Watermark') {
        final text = await _showInputDialog(
          title: 'Add Watermark',
          label: 'Watermark Text',
        );
        if (text == null || text.isEmpty) {
          if (mounted) context.go('/home');
          return;
        }
        params['text'] = text;
      } else if (widget.toolName == 'Rotate') {
        final degrees = await _showSingleSelectDialog(
          title: 'Rotate PDF',
          label: 'Rotation Angle',
          options: ['90', '180', '270'],
        );
        if (degrees == null) {
          if (mounted) context.go('/home');
          return;
        }
        params['degrees'] = int.parse(degrees); 
      } else if (widget.toolName == 'Sign') {
         final text = await _showInputDialog(
          title: 'Sign PDF',
          label: 'Signature Text',
        );
        if (text == null || text.isEmpty) {
          if (mounted) context.go('/home');
          return;
        }
        params['signatureText'] = text;
      } else if (widget.toolName == 'Organize') {
        final order = await _showInputDialog(
          title: 'Organize Pages',
          label: 'Page Order (e.g., 1,3,2)',
        );
        if (order == null || order.isEmpty) {
          if (mounted) context.go('/home');
          return;
        }
        params['pageOrder'] = order;
      }

      _startProcessing(params);
    } catch (e) {
      if (mounted) context.go('/home');
    }
  }

  Future<String?> _showInputDialog({
    required String title,
    required String label,
    bool obscureText = false,
  }) async {
    String? value;
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text(title, style: const TextStyle(color: AppColors.textPrimary)),
        content: TextField(
          obscureText: obscureText,
          style: const TextStyle(color: AppColors.textPrimary),
          decoration: InputDecoration(
            labelText: label,
            labelStyle: const TextStyle(color: AppColors.textSecondary),
            enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.primary)),
          ),
          onChanged: (v) => value = v,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, value),
            child: const Text('Confirm', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  Future<void> _startProcessing(Map<String, dynamic> params) async {
    setState(() => _isProcessing = true);
    
    try {
      String? path;
      
      if (widget.toolName == 'Merge PDF') {
        if (widget.files == null || widget.files!.length < 2) {
          throw Exception('Please select at least 2 files to merge');
        }
        path = await _pdfService.mergeFiles(widget.files!);
      } else {
        if (widget.file == null) {
          throw Exception('No file selected');
        }
        
        String endpoint = '';
        
        // Map tool name to endpoint
        switch (widget.toolName) {
          case 'Compress': endpoint = 'compress'; break;
          case 'Split PDF': endpoint = 'split'; break;
          case 'Watermark': endpoint = 'watermark'; break;
          case 'Protect': endpoint = 'protect'; break;
          case 'Unlock': endpoint = 'unlock'; break;
          case 'Rotate': endpoint = 'rotate'; break;
          case 'Sign': endpoint = 'sign'; break;
          case 'Page Numbers': endpoint = 'page-numbers'; break;
          case 'JPG to PDF': endpoint = 'jpg-to-pdf'; break;
          case 'Organize': endpoint = 'organize'; break;
          case 'Crop': endpoint = 'crop'; break;
          case 'Redact': endpoint = 'redact'; break;
          // Conversions
          case 'Word to PDF': endpoint = 'convert/word-to-pdf'; break;
          case 'PDF to Word': endpoint = 'convert/pdf-to-word'; break;
          case 'PPT to PDF': endpoint = 'convert/ppt-to-pdf'; break;
          case 'PDF to PPT': endpoint = 'convert/pdf-to-ppt'; break;
          case 'Excel to PDF': endpoint = 'convert/excel-to-pdf'; break;
          case 'PDF to Excel': endpoint = 'convert/pdf-to-excel'; break;
          
          default:
            throw Exception('Tool not implemented yet');
        }

        path = await _pdfService.processFile(
          endpoint: endpoint,
          file: widget.file!,
          extraParams: params,
        );
      }

      if (mounted) {
        setState(() {
          _isProcessing = false;
          _resultPath = path;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }

  Future<void> _openFile() async {
    if (_resultPath != null) {
      await OpenFile.open(_resultPath);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.toolName),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isProcessing) ...[
                const CircularProgressIndicator(color: AppColors.primary),
                const SizedBox(height: 24),
                const Text(
                  'Processing your file...',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Uploading and applying ${widget.toolName}...',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ] else if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.xCircle,
                      color: Colors.red, size: 48),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Processing Failed',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () => context.go('/home'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.surface,
                    foregroundColor: AppColors.textPrimary,
                  ),
                  child: const Text('Go Back'),
                ),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.checkCircle,
                      color: Colors.green, size: 48),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Success!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Your file has been processed and saved.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _openFile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.download),
                        SizedBox(width: 8),
                        Text('Open File'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.go('/home'),
                  child: const Text('Process Another File'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<String?> _showSingleSelectDialog({
    required String title,
    required String label,
    required List<String> options,
  }) async {
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (context) => SimpleDialog(
        title: Text(title, style: const TextStyle(color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        children: options.map((option) {
          return SimpleDialogOption(
            onPressed: () => Navigator.pop(context, option),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                '$option°',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
