package com.tonilr.FinancialTracker.repos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Users;

@Repository
public interface UsersRepo extends JpaRepository<Users, Long> {
    //Buscar usuario por email
    Optional<Users> findByEmail(String email);
    //Buscar usuario por username
    Optional<Users> findByUsername(String username);
    //Verificar si el email ya existe
    boolean existsByEmail(String email);
    //Verificar si el username ya existe
    boolean existsByUsername(String username);
    //Buscar usuarios con reportes semanales activos
    @Query("SELECT u FROM Users u JOIN u.userSettings s WHERE s.weeklyReportEnabled = true")
    List<Users> findUsersWithWeeklyReportsEnabled();
    //Buscar usuarios con reportes mensuales activos
    @Query("SELECT u FROM Users u JOIN u.userSettings s WHERE s.monthlyReportEnabled = true")
    List<Users> findUsersWithMonthlyReportsEnabled();
}
