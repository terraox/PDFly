package com.pdfly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., "STUDENT50"

    private int discountPercent; // e.g., 50 for 50%
    
    private String planType; // The plan this coupon grants: "PRO" or "FREE_LIFETIME"

    private int maxUses;

    private int currentUses = 0;

    private LocalDateTime expiryDate;

    // Status is dynamically determined by currentUses > maxUses or expiryDate < now
}