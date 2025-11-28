package com.pdfly.backend.repository;

import com.pdfly.backend.model.GlobalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GlobalConfigRepository extends JpaRepository<GlobalConfig, Long> {
    Optional<GlobalConfig> findByConfigKey(String configKey);
}
