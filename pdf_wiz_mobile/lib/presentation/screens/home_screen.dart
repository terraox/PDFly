import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../../data/services/file_picker_service.dart';
import 'profile_screen.dart';
import 'dashboard_screen.dart';
import '../widgets/modern_tools_grid.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ModernToolsGrid(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.layoutGrid),
            label: 'Tools',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.user),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}



class ToolsGrid extends StatelessWidget {
  const ToolsGrid({super.key});

  final List<Map<String, dynamic>> tools = const [
    {'name': 'Merge PDF', 'icon': LucideIcons.files, 'color': Colors.blue, 'isPro': false, 'isComingSoon': false},
    {'name': 'Split PDF', 'icon': LucideIcons.scissors, 'color': Colors.purple, 'isPro': false, 'isComingSoon': false},
    {'name': 'Compress', 'icon': LucideIcons.minimize2, 'color': Colors.orange, 'isPro': false, 'isComingSoon': false},
    {'name': 'Protect', 'icon': LucideIcons.lock, 'color': Colors.red, 'isPro': true, 'isComingSoon': false},
    {'name': 'Unlock', 'icon': LucideIcons.unlock, 'color': Colors.teal, 'isPro': true, 'isComingSoon': false},
    {'name': 'Rotate', 'icon': LucideIcons.rotateCw, 'color': Colors.indigo, 'isPro': false, 'isComingSoon': false},
    {'name': 'Watermark', 'icon': LucideIcons.stamp, 'color': Colors.green, 'isPro': false, 'isComingSoon': false},
    {'name': 'Sign', 'icon': LucideIcons.penTool, 'color': Colors.pink, 'isPro': false, 'isComingSoon': false},
    {'name': 'Page Numbers', 'icon': LucideIcons.hash, 'color': Colors.cyan, 'isPro': false, 'isComingSoon': false},
    {'name': 'JPG to PDF', 'icon': LucideIcons.image, 'color': Colors.amber, 'isPro': false, 'isComingSoon': false},
    {'name': 'Word to PDF', 'icon': LucideIcons.fileText, 'color': Colors.blueGrey, 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to Word', 'icon': LucideIcons.fileType2, 'color': Colors.blueAccent, 'isPro': false, 'isComingSoon': false},
    {'name': 'PPT to PDF', 'icon': LucideIcons.presentation, 'color': Colors.deepOrange, 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to PPT', 'icon': LucideIcons.monitor, 'color': Colors.deepOrangeAccent, 'isPro': false, 'isComingSoon': false},
    {'name': 'Excel to PDF', 'icon': LucideIcons.sheet, 'color': Colors.greenAccent, 'isPro': false, 'isComingSoon': false},
    {'name': 'PDF to Excel', 'icon': LucideIcons.table, 'color': Colors.lightGreen, 'isPro': false, 'isComingSoon': false},
    {'name': 'Organize', 'icon': LucideIcons.layoutList, 'color': Colors.deepPurple, 'isPro': true, 'isComingSoon': false},
    {'name': 'Crop', 'icon': LucideIcons.crop, 'color': Colors.lime, 'isPro': true, 'isComingSoon': false},
    {'name': 'Redact', 'icon': LucideIcons.eraser, 'color': Colors.black, 'isPro': true, 'isComingSoon': true},
    {'name': 'OCR PDF', 'icon': LucideIcons.scanLine, 'color': Colors.blue, 'isPro': true, 'isComingSoon': true},
  ];

  Future<void> _handleToolTap(BuildContext context, String toolName) async {
    // Find the tool to check flags
    final tool = tools.firstWhere((t) => t['name'] == toolName, orElse: () => {});
    if (tool.isNotEmpty && tool['isComingSoon'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('This feature is coming soon!')),
      );
      return;
    }

    final filePicker = FilePickerService();
    
    try {
      if (toolName == 'Merge PDF') {
        final files = await filePicker.pickMultiplePdfFiles();
        if (files.isNotEmpty && context.mounted) {
          context.go(
            '/processing',
            extra: {
              'toolName': toolName,
              'files': files,
            },
          );
        }
      } else if (toolName == 'Crop') {
        final file = await filePicker.pickPdfFile();
        if (file != null && context.mounted) {
          context.go(
            '/crop',
            extra: file,
          );
        }
      } else {
        final file = await filePicker.pickPdfFile();
        
        if (file != null && context.mounted) {
          context.go(
            '/processing',
            extra: {
              'toolName': toolName,
              'file': file,
            },
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'All Tools',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.5, // WIDER aspect ratio
              ),
              itemCount: tools.length,
              itemBuilder: (context, index) {
                final tool = tools[index];
                final isPro = tool['isPro'] as bool;
                final isComingSoon = tool['isComingSoon'] as bool;

                return Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        gradient: LinearGradient(
                          colors: [
                            AppColors.surface,
                            AppColors.surface.withValues(alpha: 0.8),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => _handleToolTap(context, tool['name'] as String),
                          borderRadius: BorderRadius.circular(16),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: (tool['color'] as Color).withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  tool['icon'] as IconData,
                                  color: tool['color'] as Color,
                                  size: 32,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                tool['name'] as String,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (isComingSoon)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.grey,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'SOON',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      )
                    else if (isPro)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'PRO',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      )
                    else
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'FREE',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
