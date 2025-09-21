package com.tonilr.FinancialTracker.repos;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Transaction;


@Repository
public interface TransactionRepo extends JpaRepository<Transaction, Long> {
	
	//Buscar transacciones por cuenta con JOIN FETCH para evitar N+1
	@Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.user LEFT JOIN FETCH t.account WHERE t.account.account_Id = :accountId ORDER BY t.register_date DESC")
	List<Transaction> findByAccountId(@Param("accountId") Long accountId);
	
	//Buscar transacciones por usuario con JOIN FETCH para evitar N+1
	@Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.user LEFT JOIN FETCH t.account WHERE t.user.user_Id = :userId ORDER BY t.register_date DESC")
	List<Transaction> findByUserId(@Param("userId") Long userId);

	//Buscar transacciones por usuario y fecha
	@Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
	List<Transaction> findByUser_IdAndDateBetween(Long userId, Date startDate, Date endDate);
	
}
