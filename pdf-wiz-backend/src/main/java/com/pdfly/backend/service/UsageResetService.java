package com.pdfly.backend.service;

import com.pdfly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsageResetService {

    private final UserRepository userRepository;

    // Reset usage count every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void resetDailyUsage() {
        userRepository.resetAllDailyUsageCounts();
        System.out.println("Daily usage counts reset for all users.");
    }
}
