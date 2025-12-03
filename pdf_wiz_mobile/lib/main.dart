import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/theme/app_theme.dart';
import 'presentation/screens/home_screen.dart';
import 'presentation/screens/login_screen.dart';

import 'package:file_picker/file_picker.dart';
import 'presentation/screens/processing_screen.dart';
import 'presentation/screens/register_screen.dart';

import 'presentation/screens/pricing_screen.dart';
import 'presentation/screens/change_password_screen.dart';
import 'presentation/screens/forgot_password_screen.dart';

import 'presentation/screens/splash_screen.dart';
import 'presentation/screens/tools/crop_screen.dart';

import 'package:provider/provider.dart';
import 'core/theme/theme_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/processing',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        return ProcessingScreen(
          toolName: extra['toolName'] as String,
          file: extra['file'] as PlatformFile?,
          files: extra['files'] as List<PlatformFile>?,
        );
      },
    ),
    GoRoute(
      path: '/pricing',
      builder: (context, state) => const PricingScreen(),
    ),
    GoRoute(
      path: '/change-password',
      builder: (context, state) => const ChangePasswordScreen(),
    ),
    GoRoute(
      path: '/crop',
      builder: (context, state) {
        final file = state.extra as PlatformFile;
        return CropScreen(file: file);
      },
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    
    return MaterialApp.router(
      title: 'PDFly',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
