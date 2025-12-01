// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/model/User.java
package com.pdfly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String passwordResetPhrase;

    private LocalDateTime passwordResetExpiry;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private PlanType plan;

    // Stores when the PRO plan expires
    private LocalDateTime planExpiryDate;

    private boolean isActive = true;

    private int dailyUsageCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Enums for type safety
    public enum Role {
        USER, ADMIN
    }

    public enum PlanType {
        FREE, PRO
    }
}