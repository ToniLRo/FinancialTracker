package com.tonilr.FinancialTracker.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.tonilr.FinancialTracker.Entities.UserSettings;

@Repository
public interface UserSettingsRepo extends JpaRepository<UserSettings, Long> {
    @Query("SELECT us FROM UserSettings us WHERE us.user.user_Id = :userId")
    UserSettings findByUserId(@Param("userId") Long userId);
}