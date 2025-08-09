package com.tonilr.FinancialTracker.Services;

import java.time.LocalDate;
import java.sql.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.exceptions.UserNotFoundException;
import com.tonilr.FinancialTracker.repos.TransactionRepo;

@Service
public class TransactionServices {

	@Autowired
	private final TransactionRepo transactionRepo;

	public TransactionServices(TransactionRepo transactionRepo) {
		this.transactionRepo = transactionRepo;
	}

	public Transaction addTransaction(Transaction transaction) {
		return transactionRepo.save(transaction);
	}

	public List<Transaction> findAllTransactions() {
		return transactionRepo.findAll();
	}

	public Transaction updateTransaction(Transaction transaction) {
		return transactionRepo.save(transaction);
	}

	public Transaction findTransactionById(Long id) {
		return transactionRepo.findById(id)
				.orElseThrow(() -> new UserNotFoundException("Transaction by id " + id + " was not found"));

	}

	public void deleteTransaction(Long id) {
		transactionRepo.deleteById(id);
	}

	public List<Transaction> findTransactionsByAccountId(Long accountId) {
		//System.out.println("=== TRANSACTION SERVICE ===");
		//System.out.println("Service received accountId: " + accountId);
		
		try {
			List<Transaction> transactions = transactionRepo.findByAccountId(accountId);
			//System.out.println("Repository returned " + transactions.size() + " transactions");
			
			return transactions;
		} catch (Exception e) {
			System.err.println("ERROR in TransactionServices.findTransactionsByAccountId:");
			System.err.println("Error message: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	public List<Transaction> findTransactionsByUserId(Long userId) {
		//System.out.println("=== TRANSACTION SERVICE - FIND BY USER ID ===");
		//System.out.println("Service received userId: " + userId);
		
		try {
			List<Transaction> transactions = transactionRepo.findByUserId(userId);
			//System.out.println("Repository returned " + transactions.size() + " transactions for user");
			
			return transactions;
		} catch (Exception e) {
			System.err.println("ERROR in TransactionServices.findTransactionsByUserId:");
			System.err.println("Error message: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}

	public Map<Object, Double> getCategoryTotalsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
		List<Transaction> transactions = transactionRepo.findByUser_IdAndDateBetween(
			userId, 
			Date.valueOf(startDate), 
			Date.valueOf(endDate)
		);

		return transactions.stream()
			.collect(Collectors.groupingBy(
				t -> t.getType(),
				Collectors.summingDouble(Transaction::getAmount)
			));
	}

	public double getTotalIncome(Long userId, LocalDate startDate, LocalDate endDate) {
		return transactionRepo.findByUser_IdAndDateBetween(userId, Date.valueOf(startDate), Date.valueOf(endDate))
			.stream()
			.filter(t -> t.getAmount() > 0)
			.mapToDouble(Transaction::getAmount)
			.sum();
	}

	public double getTotalExpenses(Long userId, LocalDate startDate, LocalDate endDate) {
		return transactionRepo.findByUser_IdAndDateBetween(userId, Date.valueOf(startDate), Date.valueOf(endDate))
			.stream()
			.filter(t -> t.getAmount() < 0)
			.mapToDouble(Transaction::getAmount)
			.sum();
	}
}
