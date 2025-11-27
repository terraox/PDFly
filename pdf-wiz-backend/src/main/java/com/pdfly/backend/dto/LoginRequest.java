// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/dto/LoginRequest.java
package com.pdfly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}