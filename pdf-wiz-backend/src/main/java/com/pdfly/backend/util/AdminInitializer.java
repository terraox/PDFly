package com.pdfly.backend.util;

import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // This method runs automatically after the Spring Boot application starts
    @Override
    public void run(String... args) throws Exception {
        final String adminEmail = "admin@pdfly.io";
        final String adminPassword = "pdfly_admin_pass"; // SAFE HARDCODED ADMIN PASSWORD

        // Check if the default admin user already exists
        if (!userRepository.existsByEmail(adminEmail)) {
            
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword)); // Hash the password
            admin.setRole(User.Role.ADMIN); // Set the role to ADMIN
            admin.setPlan(User.PlanType.PRO); // Admin gets Pro features
            admin.setActive(true);
            
            userRepository.save(admin);
            
            System.out.println("=========================================================");
            System.out.println("✅ DEFAULT ADMIN CREATED:");
            System.out.println("   Email: " + adminEmail);
            System.out.println("   Password: " + adminPassword);
            System.out.println("   (Please change this in the DB after first login!)");
            System.out.println("=========================================================");
        }
    }
}