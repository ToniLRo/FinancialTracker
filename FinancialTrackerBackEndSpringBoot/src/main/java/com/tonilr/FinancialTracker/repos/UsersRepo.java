package com.tonilr.FinancialTracker.repos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Users;

@Repository
public interface UsersRepo extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @Query("SELECT u FROM Users u JOIN u.userSettings s WHERE s.weeklyReportEnabled = true")
    List<Users> findUsersWithWeeklyReportsEnabled();

    @Query("SELECT u FROM Users u JOIN u.userSettings s WHERE s.monthlyReportEnabled = true")
    List<Users> findUsersWithMonthlyReportsEnabled();
}
