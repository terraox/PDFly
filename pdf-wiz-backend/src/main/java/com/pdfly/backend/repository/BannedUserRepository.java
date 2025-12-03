package com.pdfly.backend.repository;

import com.pdfly.backend.model.BannedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
    Optional<BannedUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
