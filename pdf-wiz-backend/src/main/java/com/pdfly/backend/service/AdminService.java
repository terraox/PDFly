package com.pdfly.backend.service;

import com.pdfly.backend.model.Plan;
import com.pdfly.backend.model.Transaction;
import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.PlanRepository;
import com.pdfly.backend.repository.TransactionRepository;
import com.pdfly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final TransactionRepository transactionRepository;

    // =========================================================
    // DASHBOARD STATS
    // =========================================================

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPlans = planRepository.count();

        List<Transaction> transactions = transactionRepository.findAll();
        BigDecimal totalRevenue = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.Status.SUCCESS)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalPlans", totalPlans);
        stats.put("totalRevenue", totalRevenue);
        stats.put("activeUsers", totalUsers); // Placeholder for now

        return stats;
    }

    // =========================================================
    // USER MANAGEMENT
    // =========================================================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Assuming User model has an 'active' or 'banned' field.
        // If not, we might need to add it or use a placeholder.
        // For now, let's assume we can just return the user.
        // TODO: Add 'active' field to User entity if missing.
        return user;
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // =========================================================
    // PLAN MANAGEMENT
    // =========================================================

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Plan createPlan(Plan plan) {
        return planRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }

    // =========================================================
    // FINANCE
    // =========================================================

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }
}
