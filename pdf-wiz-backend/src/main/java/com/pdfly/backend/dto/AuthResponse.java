// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/dto/AuthResponse.java
package com.pdfly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String plan; // FREE or PRO
    private String planExpiry; // ISO date string or null
    private int dailyUsageCount;
}