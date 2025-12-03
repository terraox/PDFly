package com.pdfly.backend.service;

import com.pdfly.backend.model.BannedUser;
import com.pdfly.backend.model.Plan;
import com.pdfly.backend.model.Transaction;
import com.pdfly.backend.model.User;
import com.pdfly.backend.repository.BannedUserRepository;
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
    private final BannedUserRepository bannedUserRepository;

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

        // Calculate Revenue Growth
        BigDecimal currentMonthRevenue = calculateRevenueForMonth(java.time.YearMonth.now());
        BigDecimal lastMonthRevenue = calculateRevenueForMonth(java.time.YearMonth.now().minusMonths(1));

        double revenueGrowth = 0.0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal growth = currentMonthRevenue.subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            revenueGrowth = growth.doubleValue();
        } else if (currentMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueGrowth = 100.0; // 100% growth if last month was 0 and this month is > 0
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalPlans", totalPlans);
        stats.put("totalRevenue", totalRevenue);
        stats.put("activeUsers", totalUsers);
        stats.put("revenueGrowth", revenueGrowth);

        return stats;
    }

    private BigDecimal calculateRevenueForMonth(java.time.YearMonth yearMonth) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getStatus() == Transaction.Status.SUCCESS)
                .filter(t -> java.time.YearMonth.from(t.getDate()).equals(yearMonth))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
        user.setActive(active);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Add to Banned Users List
        if (!bannedUserRepository.existsByEmail(user.getEmail())) {
            BannedUser bannedUser = new BannedUser();
            bannedUser.setEmail(user.getEmail());
            bannedUser.setReason("Banned by Admin");
            bannedUserRepository.save(bannedUser);
        }

        // 2. Delete User Account
        userRepository.delete(user);
    }

    public List<BannedUser> getAllBannedUsers() {
        return bannedUserRepository.findAll();
    }

    public void unbanUser(String email) {
        BannedUser bannedUser = bannedUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Banned user not found"));
        bannedUserRepository.delete(bannedUser);
    }

    public String exportUsersToCsv() {
        List<User> users = userRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Email,Role,Plan,Active,Created At\n");

        for (User user : users) {
            csv.append(user.getId()).append(",")
                    .append(user.getEmail()).append(",")
                    .append(user.getRole()).append(",")
                    .append(user.getPlan()).append(",")
                    .append(user.isActive()).append(",")
                    .append(user.getCreatedAt()).append("\n");
        }
        return csv.toString();
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
