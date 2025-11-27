// FILE PATH: pdf-wiz-backend/src/main/java/com/pdfly/backend/controller/PublicCouponController.java
package com.pdfly.backend.controller;

import com.pdfly.backend.model.Coupon;
import com.pdfly.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/coupon")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    // This endpoint handles the coupon validation from the Checkout page
    @PostMapping("/validate")
    public ResponseEntity<Coupon> validateCoupon(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String userEmail = request.get("userEmail");
        
        if (code == null || userEmail == null) {
            return ResponseEntity.badRequest().build();
        }

        // Service handles validation, plan application, and usage increment
        Coupon appliedCoupon = couponService.validateAndApplyCoupon(code, userEmail);
        return ResponseEntity.ok(appliedCoupon);
    }
}