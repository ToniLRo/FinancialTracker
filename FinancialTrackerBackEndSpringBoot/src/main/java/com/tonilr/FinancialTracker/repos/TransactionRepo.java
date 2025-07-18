package com.tonilr.FinancialTracker.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.Transaction;


@Repository
public interface TransactionRepo extends JpaRepository<Transaction, Long> {
	
	@Query("SELECT t FROM Transaction t WHERE t.account.account_Id = :accountId")
	List<Transaction> findByAccountId(@Param("accountId") Long accountId);
	
}
