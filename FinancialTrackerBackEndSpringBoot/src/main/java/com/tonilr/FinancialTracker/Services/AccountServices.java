package com.tonilr.FinancialTracker.Services;

import java.util.List;
import java.sql.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.exceptions.UserNotFoundException;
import com.tonilr.FinancialTracker.repos.AccountRepo;

@Service
public class AccountServices {

	@Autowired
	private final AccountRepo accountRepo;

	public AccountServices(AccountRepo accountRepo) {
		this.accountRepo = accountRepo;
	}

	public Account addAccount(Account account) {
		// Establecer fecha de creación si no se proporciona
		if (account.getCreation_date() == null) {
			account.setCreation_date(new Date(System.currentTimeMillis()));
		}
		
		// Validaciones básicas
		if (account.getHolder_name() == null || account.getHolder_name().trim().isEmpty()) {
			throw new RuntimeException("Holder name is required");
		}
		if (account.getAccount_number() == null || account.getAccount_number().trim().isEmpty()) {
			throw new RuntimeException("Account number is required");
		}
		
		if (account.getAccount_type() == null) {
			throw new RuntimeException("Account type is required");
		}
		
		if (account.getCurrency() == null || account.getCurrency().trim().isEmpty()) {
			account.setCurrency("USD"); // Valor por defecto
		}
		
		return accountRepo.save(account);
	}

	public List<Account> findAllAccounts() {
		return accountRepo.findAll();
	}

	public Account updateAccount(Account account) {
		return accountRepo.save(account);
	}

	public Account findAccountById(Long id) {
		return accountRepo.findById(id)
				.orElseThrow(() -> new UserNotFoundException("Account by id " + id + " was not found"));

	}

	public void deleteAccount(Long id) {
		accountRepo.deleteById(id);
	}
}
