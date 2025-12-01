// FILE PATH: pdf-wiz-backend/src/main/java/com/pdfly/backend/controller/AuthController.java
package com.pdfly.backend.controller;

import com.pdfly.backend.dto.AuthResponse;
import com.pdfly.backend.dto.LoginRequest;
import com.pdfly.backend.model.GlobalConfig;
import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.GlobalConfigRepository;
import com.pdfly.backend.repository.UserRepository;
import com.pdfly.backend.service.EmailService;
import com.pdfly.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.MailException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Random;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final GlobalConfigRepository globalConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    // Helper to format LocalDateTime to ISO String for Frontend
    private String formatExpiry(LocalDateTime expiry) {
        return expiry != null ? expiry.toString() : null;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        // CHECK IF SIGNUPS ARE DISABLED
        Optional<GlobalConfig> config = globalConfigRepository.findByConfigKey("DISABLE_SIGNUPS");
        if (config.isPresent() && "true".equalsIgnoreCase(config.get().getConfigValue())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("New user registration is currently disabled by the administrator.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered.");
        }

        // 1. Generate secure password and hash it
        String rawPassword = generateRandomPassword();
        String hashedPassword = passwordEncoder.encode(rawPassword);

        // 2. Create and save new user (Default FREE, Set 30-day expiry for PRO
        // features)
        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(hashedPassword);
        newUser.setRole(User.Role.USER);
        newUser.setPlan(User.PlanType.FREE);
        // Default free user doesn't have an expiry date, but setting it here for
        // testing:
        // newUser.setPlanExpiryDate(null);

        // TEMPORARY ADMIN OVERRIDE
        if ("temp-admin@pdfly.io".equalsIgnoreCase(request.getEmail())) {
            newUser.setRole(User.Role.ADMIN);
            newUser.setPlan(User.PlanType.PRO);
            newUser.setPlanExpiryDate(LocalDateTime.now().plusYears(1)); // Admin plan lasts a long time
        }

        userRepository.save(newUser);

        // 3. Send the raw password via email (WITH FAIL-SAFE)
        try {
            emailService.sendWelcomeEmail(request.getEmail(), rawPassword);
            return ResponseEntity.ok("Registration successful. Access key sent to email.");
        } catch (MailException e) {
            System.err.println("--- EMAIL SENDING FAILED (Code: 535-5.7.8) ---");
            e.printStackTrace();
            // Return 200 OK with the key in the body for testing/debugging
            return ResponseEntity.status(HttpStatus.OK).body(
                    "Registration completed, but email failed. Use this key to log in: " + rawPassword);
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        final User user = userRepository.findByEmail(request.getEmail()).get();

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .role(user.getRole().name())
                .plan(user.getPlan().name()) // SEND PLAN TYPE (FREE or PRO)
                .planExpiry(formatExpiry(user.getPlanExpiryDate())) // SEND EXPIRY DATE
                .dailyUsageCount(user.getDailyUsageCount())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(AuthResponse.builder()
                .token(null) // Token not needed for refresh
                .email(user.getEmail())
                .role(user.getRole().name())
                .plan(user.getPlan().name())
                .planExpiry(formatExpiry(user.getPlanExpiryDate()))
                .dailyUsageCount(user.getDailyUsageCount())
                .build());
    }

    // POST /api/auth/forgot-password (Step 1: Request Phrase)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.ok("If the email is valid, a reset code has been sent.");
        }

        String resetPhrase = String.format("%06d", new Random().nextInt(999999));

        User user = userOpt.get();
        user.setPasswordResetPhrase(resetPhrase);
        user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(15)); // Set expiry to 15 minutes
        userRepository.save(user);

        emailService.sendResetPhrase(email, resetPhrase);

        return ResponseEntity.ok("Reset code sent.");
    }

    // POST /api/auth/reset-password (Step 2: Reset with Key)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String resetKey = payload.get("resetKey");
        String newPassword = payload.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request.");
        }

        User user = userOpt.get();

        if (user.getPasswordResetPhrase() == null || !user.getPasswordResetPhrase().equals(resetKey)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid reset key.");
        }

        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reset key has expired.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear reset fields
        user.setPasswordResetPhrase(null);
        user.setPasswordResetExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully. You can now login.");
    }

    // POST /api/auth/change-password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                .getName();
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect old password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully.");
    }

    // Utility to generate a secure random password
    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}