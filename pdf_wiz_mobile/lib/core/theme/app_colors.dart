import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF6366F1); // Indigo 500
  static const Color secondary = Color(0xFFA855F7); // Purple 500
  static const Color background = Color(0xFF09090B); // Zinc 950 (Dark background)
  static const Color surface = Color(0xFF18181B); // Zinc 900 (Card background)
  static const Color textPrimary = Color(0xFFFAFAFA); // Zinc 50
  static const Color textSecondary = Color(0xFFA1A1AA); // Zinc 400
  static const Color border = Color(0xFF27272A); // Zinc 800
  
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
