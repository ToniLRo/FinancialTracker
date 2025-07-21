package com.tonilr.FinancialTracker.repos;

import com.tonilr.FinancialTracker.Entities.ApiUpdateControl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApiUpdateControlRepo extends JpaRepository<ApiUpdateControl, Long> {
    Optional<ApiUpdateControl> findByApiType(ApiUpdateControl.ApiType apiType);
}
