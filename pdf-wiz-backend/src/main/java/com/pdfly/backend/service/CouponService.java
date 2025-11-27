// FILE PATH: pdf-wiz-backend/src/main/java/com/pdfly/backend/service/CouponService.java
package com.pdfly.backend.service;

import com.pdfly.backend.dto.CouponRequest;
import com.pdfly.backend.model.Coupon;
import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.CouponRepository;
import com.pdfly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    // =========================================================
    // ADMIN ENDPOINTS
    // =========================================================
    @Transactional 
    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists.");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountPercent(request.getDiscountPercent());
        coupon.setPlanType(request.getPlanType());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setExpiryDate(request.getExpiryDate());

        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }


    // =========================================================
    // USER VALIDATION ENDPOINT
    // =========================================================
    @Transactional
    public Coupon validateAndApplyCoupon(String code, String userEmail) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found."));

        // 1. Check expiry
        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Coupon has expired."); 
        }

        // 2. Check usage limits
        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new ResponseStatusException(HttpStatus.LOCKED, "Coupon limit reached.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // 3. Apply the plan to the user AND set a 30-day expiration
        try {
            user.setPlan(User.PlanType.valueOf(coupon.getPlanType()));
            // SET THE EXPIRY DATE TO 30 DAYS FROM NOW
            user.setPlanExpiryDate(LocalDateTime.now().plusDays(30)); 
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid plan type specified in coupon.");
        }
        userRepository.save(user);

        // 4. Increment usage count
        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        return couponRepository.save(coupon);
    }
}