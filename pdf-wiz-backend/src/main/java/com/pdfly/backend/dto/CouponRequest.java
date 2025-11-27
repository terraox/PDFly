package com.pdfly.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CouponRequest {
    private String code;
    private int discountPercent;
    private String planType;
    private int maxUses;
    private LocalDateTime expiryDate;
}