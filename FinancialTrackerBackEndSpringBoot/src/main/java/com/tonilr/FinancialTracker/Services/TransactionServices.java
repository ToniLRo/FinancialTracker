package com.tonilr.FinancialTracker.Services;

import java.util.List;

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
		return transactionRepo.findByAccountId(accountId);
	}
}
