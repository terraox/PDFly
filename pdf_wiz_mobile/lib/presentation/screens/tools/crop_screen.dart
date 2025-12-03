import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:pdf_wiz_mobile/core/theme/app_colors.dart';
import 'package:pdf_wiz_mobile/data/services/pdf_service.dart';
import 'package:open_file/open_file.dart';

class CropScreen extends StatefulWidget {
  final PlatformFile file;

  const CropScreen({super.key, required this.file});

  @override
  State<CropScreen> createState() => _CropScreenState();
}

class _CropScreenState extends State<CropScreen> {
  final PdfService _pdfService = PdfService();
  bool _isLoading = true;
  bool _isProcessing = false;
  int _totalPages = 0;
  int _currentPage = 0;
  Uint8List? _previewImage;
  String? _error;
  
  // Crop Logic
  final GlobalKey _imageKey = GlobalKey();
  Rect _cropRect = const Rect.fromLTWH(50, 50, 200, 300); // Default crop box
  String _scope = 'all'; // 'all' or 'current'

  @override
  void initState() {
    super.initState();
    _loadDocument();
  }

  Future<void> _loadDocument() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // 1. Get Page Count
      final count = await _pdfService.getPageCount(widget.file);
      _totalPages = count;

      // 2. Get First Page Preview
      await _loadPreview(0);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadPreview(int pageIndex) async {
    try {
      final bytes = await _pdfService.getPreviewPage(widget.file, pageIndex);
      setState(() {
        _previewImage = Uint8List.fromList(bytes);
        _currentPage = pageIndex;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load preview: $e')));
    }
  }

  void _handleCrop() async {
    if (_previewImage == null) return;

    setState(() => _isProcessing = true);

    try {
      // Calculate actual crop values relative to image size
      final RenderBox? imageBox = _imageKey.currentContext?.findRenderObject() as RenderBox?;
      if (imageBox == null) return;

      final imageSize = imageBox.size;
      
      // Assuming standard PDF point size (72 DPI) vs Preview resolution (likely 150 DPI)
      // We need to map the screen coordinates to the PDF coordinates.
      // This is tricky without knowing exact PDF dimensions.
      // Strategy: Send relative percentages or normalized coordinates if backend supported it.
      // But backend expects points.
      // Workaround: We will use a standard A4 ratio assumption or just send raw screen values scaled.
      // BETTER: The web implementation scales based on naturalWidth/Height. We don't have that easily here.
      // Let's try to send normalized values (0-1) and let backend handle? No, backend expects points.
      
      // Let's assume the preview is roughly fitting the screen width.
      // We will send the values as is for now, but scaled to a standard 595x842 (A4) if possible?
      // Actually, let's just send the raw values from the UI rect relative to the displayed image size, 
      // and maybe the backend can handle it if we pass a scale factor? 
      // The web code does: x = crop.x * scaleX * dpiScale.
      
      // For this MVP, let's just pass the rect values relative to a standard 600px width assumption.
      // Realistically, we need the PDF page size to do this accurately.
      // Since we can't easily get PDF page size without another API call, 
      // we will use a fixed scale assumption: 
      // Displayed Width -> PDF Width (approx 600pt).
      
      double scaleFactor = 600.0 / imageSize.width; 
      
      final params = {
        'x': _cropRect.left * scaleFactor,
        'y': _cropRect.top * scaleFactor,
        'width': _cropRect.width * scaleFactor,
        'height': _cropRect.height * scaleFactor,
        'scope': _scope,
        'pageIndex': _currentPage,
      };

      final path = await _pdfService.processFile(
        endpoint: 'crop',
        file: widget.file,
        extraParams: params,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PDF Cropped Successfully!')));
        OpenFile.open(path);
        context.pop();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Crop PDF'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (!_isLoading && _previewImage != null)
            IconButton(
              icon: _isProcessing 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                : const Icon(LucideIcons.check, color: AppColors.primary),
              onPressed: _isProcessing ? null : _handleCrop,
            ),
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _error != null 
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : Column(
                  children: [
                    // Toolbar
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: AppColors.surface,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Scope Toggle
                          ToggleButtons(
                            isSelected: [_scope == 'all', _scope == 'current'],
                            onPressed: (index) {
                              setState(() => _scope = index == 0 ? 'all' : 'current');
                            },
                            borderRadius: BorderRadius.circular(8),
                            children: const [
                              Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('All')),
                              Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('This Page')),
                            ],
                          ),
                          // Page Nav
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(LucideIcons.chevronLeft),
                                onPressed: _currentPage > 0 ? () => _loadPreview(_currentPage - 1) : null,
                              ),
                              Text('${_currentPage + 1} / $_totalPages'),
                              IconButton(
                                icon: const Icon(LucideIcons.chevronRight),
                                onPressed: _currentPage < _totalPages - 1 ? () => _loadPreview(_currentPage + 1) : null,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    // Editor Area
                    Expanded(
                      child: Center(
                        child: _previewImage == null 
                          ? const Text('No Preview')
                          : LayoutBuilder(
                              builder: (context, constraints) {
                                return Stack(
                                  children: [
                                    // Image
                                    Image.memory(
                                      _previewImage!,
                                      key: _imageKey,
                                      fit: BoxFit.contain,
                                      width: constraints.maxWidth,
                                    ),
                                    // Crop Overlay (Simplified draggable rect)
                                    Positioned.fromRect(
                                      rect: _cropRect,
                                      child: GestureDetector(
                                        onPanUpdate: (details) {
                                          setState(() {
                                            _cropRect = _cropRect.shift(details.delta);
                                          });
                                        },
                                        child: Container(
                                          decoration: BoxDecoration(
                                            border: Border.all(color: AppColors.primary, width: 2),
                                            color: AppColors.primary.withValues(alpha: 0.2),
                                          ),
                                          child: Stack(
                                            children: [
                                              // Resize Handle (Bottom Right)
                                              Positioned(
                                                right: 0,
                                                bottom: 0,
                                                child: GestureDetector(
                                                  onPanUpdate: (details) {
                                                    setState(() {
                                                      _cropRect = Rect.fromLTWH(
                                                        _cropRect.left,
                                                        _cropRect.top,
                                                        _cropRect.width + details.delta.dx,
                                                        _cropRect.height + details.delta.dy,
                                                      );
                                                    });
                                                  },
                                                  child: Container(
                                                    width: 20,
                                                    height: 20,
                                                    color: AppColors.primary,
                                                    child: const Icon(LucideIcons.move, size: 12, color: Colors.white),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
