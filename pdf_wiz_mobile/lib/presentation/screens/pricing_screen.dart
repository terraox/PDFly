import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';

class PricingScreen extends StatelessWidget {
  const PricingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Pricing Plans'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildPlanCard(
              context,
              title: 'Free',
              price: '₹0',
              features: [
                '3 Tasks per day',
                '10MB Max File Size',
                'Standard Processing Speed',
                'No OCR Support',
                'Ads Supported',
              ],
              isPro: false,
            ),
            const SizedBox(height: 24),
            _buildPlanCard(
              context,
              title: 'Pro',
              price: '₹499/mo',
              features: [
                'Unlimited Tasks',
                '100MB Max File Size',
                'Priority Processing (3x Faster)',
                'AI-Powered OCR PDF',
                'No Ads',
              ],
              isPro: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanCard(
    BuildContext context, {
    required String title,
    required String price,
    required List<String> features,
    required bool isPro,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPro ? AppColors.primary : AppColors.border,
          width: isPro ? 2 : 1,
        ),
        boxShadow: isPro
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                )
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isPro)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'RECOMMENDED',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          Text(
            title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            price,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isPro ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),
          ...features.map((feature) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Icon(
                      LucideIcons.check,
                      size: 20,
                      color: isPro ? AppColors.primary : Colors.green,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      feature,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: isPro ? AppColors.primary : AppColors.background,
                foregroundColor: isPro ? Colors.white : AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: isPro ? null : const BorderSide(color: AppColors.border),
              ),
              child: Text(isPro ? 'Upgrade Now' : 'Current Plan'),
            ),
          ),
        ],
      ),
    );
  }
}
