package com.pdfly.backend.repository;

import com.pdfly.backend.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    // Find a coupon by its unique code (used for validation)
    Optional<Coupon> findByCode(String code);

    // Check if the code exists
    boolean existsByCode(String code);
}