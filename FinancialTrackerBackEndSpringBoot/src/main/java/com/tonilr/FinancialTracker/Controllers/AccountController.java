package com.tonilr.FinancialTracker.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.Services.AccountServices;

@Controller
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/account")
public class AccountController {

	@Autowired
	private final AccountServices accountService;
	
	public AccountController(AccountServices accountService) {
		this.accountService = accountService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Account>> getAllAccounts() {
		List<Account> accounts = accountService.findAllAccounts();
		return new ResponseEntity<>(accounts, HttpStatus.OK);
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<Account> getAccountById(@PathVariable("id") Long id) {
		Account account = accountService.findAccountById(id);
		return new ResponseEntity<>(account, HttpStatus.OK);
	}

	@PostMapping("/add")
	public ResponseEntity<Account> addAccount(@RequestBody Account account) {
		Account newAccount = accountService.addAccount(account);
		return new ResponseEntity<>(newAccount, HttpStatus.CREATED);
	}

	@PutMapping("/update")
	public ResponseEntity<Account> updateAccount(@RequestBody Account account) {
		Account updateAccount = accountService.updateAccount(account);
		return new ResponseEntity<>(updateAccount, HttpStatus.OK);
	}
	


	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteAccount(@PathVariable("id") Long id) {
		accountService.deleteAccount(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
