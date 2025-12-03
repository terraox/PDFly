package com.pdfly.backend.controller;

import com.pdfly.backend.dto.CouponRequest;
import com.pdfly.backend.model.Coupon;
import com.pdfly.backend.model.GlobalConfig;
import com.pdfly.backend.model.Plan;
import com.pdfly.backend.model.Transaction;
import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.GlobalConfigRepository;
import com.pdfly.backend.service.AdminService;
import com.pdfly.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CouponService couponService;
    private final AdminService adminService;
    private final GlobalConfigRepository globalConfigRepository;

    // =========================================================
    // GLOBAL CONFIG
    // =========================================================

    @GetMapping("/config")
    public ResponseEntity<List<GlobalConfig>> getAllConfigs() {
        return ResponseEntity.ok(globalConfigRepository.findAll());
    }

    @PostMapping("/config")
    public ResponseEntity<GlobalConfig> updateConfig(@RequestBody GlobalConfig config) {
        Optional<GlobalConfig> existing = globalConfigRepository.findByConfigKey(config.getConfigKey());
        if (existing.isPresent()) {
            GlobalConfig toUpdate = existing.get();
            toUpdate.setConfigValue(config.getConfigValue());
            return ResponseEntity.ok(globalConfigRepository.save(toUpdate));
        } else {
            return ResponseEntity.ok(globalConfigRepository.save(config));
        }
    }

    // =========================================================
    // DASHBOARD STATS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // =========================================================
    // USER MANAGEMENT
    // =========================================================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/banned")
    public ResponseEntity<List<com.pdfly.backend.model.BannedUser>> getAllBannedUsers() {
        return ResponseEntity.ok(adminService.getAllBannedUsers());
    }

    @PostMapping("/users/unban")
    public ResponseEntity<Void> unbanUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        adminService.unbanUser(email);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/users/export", produces = "text/csv")
    public ResponseEntity<String> exportUsers() {
        String csv = adminService.exportUsersToCsv();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                .body(csv);
    }

    // =========================================================
    // PLAN MANAGEMENT
    // =========================================================

    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> getAllPlans() {
        return ResponseEntity.ok(adminService.getAllPlans());
    }

    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.ok(adminService.createPlan(plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        adminService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // FINANCE
    // =========================================================

    @GetMapping("/finance/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(adminService.getAllTransactions());
    }

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

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}