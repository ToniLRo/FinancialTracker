package com.tonilr.FinancialTracker.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Transaction;


@Repository
public interface TransactionRepo extends JpaRepository<Transaction, Long> {
	
	// Usar query personalizada para evitar problemas de naming
	@Query("SELECT t FROM Transaction t WHERE t.account.account_Id = :accountId ORDER BY t.register_date DESC")
	List<Transaction> findByAccountId(@Param("accountId") Long accountId);
	
	// CORREGIR: Para buscar por usuario, usar query personalizada también
	@Query("SELECT t FROM Transaction t WHERE t.user.user_Id = :userId ORDER BY t.register_date DESC")
	List<Transaction> findByUserId(@Param("userId") Long userId);
}
