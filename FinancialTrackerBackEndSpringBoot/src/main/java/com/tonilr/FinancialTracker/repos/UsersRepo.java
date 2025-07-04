package com.tonilr.FinancialTracker.repos;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Users;

@Repository
public interface UsersRepo extends JpaRepository<Users,Long>{
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
