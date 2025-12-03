
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../data/services/file_picker_service.dart';

class ModernToolsGrid extends StatelessWidget {
  const ModernToolsGrid({super.key});

  final List<Map<String, dynamic>> tools = const [
    // Free Tools
    {'name': 'Merge PDF', 'icon': LucideIcons.files, 'color': Color(0xFF3B82F6), 'isPro': false, 'isComingSoon': false},
    {'name': 'Split PDF', 'icon': LucideIcons.scissors, 'color': Color(0xFFA855F7), 'isPro': false, 'isComingSoon': false},
    {'name': 'Compress', 'icon': LucideIcons.minimize2, 'color': Color(0xFFF97316), 'isPro': false, 'isComingSoon': false},
    {'name': 'Rotate', 'icon': LucideIcons.rotateCw, 'color': Color(0xFF6366F1), 'isPro': false, 'isComingSoon': false},
    {'name': 'Watermark', 'icon': LucideIcons.stamp, 'color': Color(0xFF22C55E), 'isPro': false, 'isComingSoon': false},
    {'name': 'Sign', 'icon': LucideIcons.penTool, 'color': Color(0xFFEC4899), 'isPro': false, 'isComingSoon': false},
    {'name': 'Page Numbers', 'icon': LucideIcons.hash, 'color': Color(0xFF06B6D4), 'isPro': false, 'isComingSoon': false},
    {'name': 'JPG to PDF', 'icon': LucideIcons.image, 'color': Color(0xFFF59E0B), 'isPro': false, 'isComingSoon': false},
    {'name': 'Word to PDF', 'icon': LucideIcons.fileText, 'color': Color(0xFF64748B), 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to Word', 'icon': LucideIcons.fileType2, 'color': Color(0xFF3B82F6), 'isPro': false, 'isComingSoon': false},
    {'name': 'PPT to PDF', 'icon': LucideIcons.presentation, 'color': Color(0xFFEA580C), 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to PPT', 'icon': LucideIcons.monitor, 'color': Color(0xFFF97316), 'isPro': false, 'isComingSoon': false},
    {'name': 'Excel to PDF', 'icon': LucideIcons.sheet, 'color': Color(0xFF10B981), 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to Excel', 'icon': LucideIcons.table, 'color': Color(0xFF84CC16), 'isPro': false, 'isComingSoon': false},
    {'name': 'Organize', 'icon': LucideIcons.layoutList, 'color': Color(0xFF8B5CF6), 'isPro': true, 'isComingSoon': false},
    {'name': 'Crop', 'icon': LucideIcons.crop, 'color': Color(0xFF84CC16), 'isPro': true, 'isComingSoon': false},
    {'name': 'Redact', 'icon': LucideIcons.eraser, 'color': Color(0xFF000000), 'isPro': true, 'isComingSoon': false},
    {'name': 'OCR PDF', 'icon': LucideIcons.scanLine, 'color': Color(0xFF3B82F6), 'isPro': true, 'isComingSoon': true},
  ];

  Future<void> _handleToolTap(BuildContext context, String toolName) async {
    final tool = tools.firstWhere((t) => t['name'] == toolName, orElse: () => {});
    if (tool.isNotEmpty && tool['isComingSoon'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('This feature is coming soon!'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }

    final filePicker = FilePickerService();
    
    try {
      if (toolName == 'Merge PDF') {
        final files = await filePicker.pickMultiplePdfFiles();
        if (files.isNotEmpty && context.mounted) {
          context.push('/processing', extra: {'toolName': toolName, 'files': files});
        }
      } else {
        final file = await filePicker.pickPdfFile();
        if (file != null && context.mounted) {
          context.push('/processing', extra: {'toolName': toolName, 'file': file});
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Text(
              'All Tools',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.only(bottom: 24),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.0, // Square aspect ratio for modern look
              ),
              itemCount: tools.length,
              itemBuilder: (context, index) {
                final tool = tools[index];
                final isPro = tool['isPro'] as bool;
                final isComingSoon = tool['isComingSoon'] as bool;
                final color = tool['color'] as Color;

                return _buildToolCard(context, tool, isPro, isComingSoon, color);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToolCard(BuildContext context, Map<String, dynamic> tool, bool isPro, bool isComingSoon, Color color) {
    return GestureDetector(
      onTap: () => _handleToolTap(context, tool['name'] as String),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E), // Dark surface
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.05),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Main Content
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icon Container with Glow
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: color.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Icon(
                      tool['icon'] as IconData,
                      color: color,
                      size: 30,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Tool Name
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    tool['name'] as String,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
              ],
            ),

            // Badge (Top Right)
            if (isComingSoon)
              Positioned(
                top: 12,
                right: 12,
                child: _buildBadge('SOON', Colors.grey),
              )
            else if (isPro)
              Positioned(
                top: 12,
                right: 12,
                child: _buildBadge('PRO', AppColors.primary),
              )
            else
              Positioned(
                top: 12,
                right: 12,
                child: _buildBadge('FREE', const Color(0xFF22C55E)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
