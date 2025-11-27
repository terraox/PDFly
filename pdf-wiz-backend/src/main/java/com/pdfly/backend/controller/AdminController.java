package com.pdfly.backend.controller;

import com.pdfly.backend.dto.CouponRequest;
import com.pdfly.backend.model.Coupon;
import com.pdfly.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CouponService couponService;

    // =========================================================
    // COUPON ENDPOINTS
    // =========================================================

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody CouponRequest request) {
        Coupon newCoupon = couponService.createCoupon(request);
        return ResponseEntity.ok(newCoupon);
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    // You would add DELETE /PUT endpoints here for full CRUD
}