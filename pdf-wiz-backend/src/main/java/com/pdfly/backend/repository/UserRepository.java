// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/repository/UserRepository.java
package com.pdfly.backend.repository;

import com.pdfly.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.dailyUsageCount = 0")
    void resetAllDailyUsageCounts();
}