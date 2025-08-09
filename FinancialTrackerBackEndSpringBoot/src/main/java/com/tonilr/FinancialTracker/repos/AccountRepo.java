package com.tonilr.FinancialTracker.repos;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tonilr.FinancialTracker.Entities.Account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface AccountRepo extends JpaRepository<Account,Long>{
    
    //Buscar cuentas por usuario
    @Query("SELECT a FROM Account a WHERE a.user.user_Id = :userId")
    List<Account> findByUserId(@Param("userId") Long userId);
}
