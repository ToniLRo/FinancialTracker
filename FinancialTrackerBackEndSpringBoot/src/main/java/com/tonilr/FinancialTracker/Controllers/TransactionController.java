package com.tonilr.FinancialTracker.Controllers;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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
import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Services.TransactionServices;
import com.tonilr.FinancialTracker.Services.AccountServices;

@Controller
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/transaction")
public class TransactionController {
	@Autowired
	private final TransactionServices transactionService;
	
	@Autowired
	private final AccountServices accountService;
	
	public TransactionController(TransactionServices transactionService, AccountServices accountService) {
		this.transactionService = transactionService;
		this.accountService = accountService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Transaction>> getAllTransactions() {
		List<Transaction> transactions = transactionService.findAllTransactions();
		return new ResponseEntity<>(transactions, HttpStatus.OK);
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<Transaction> getTransactionById(@PathVariable("id") Long id) {
		Transaction transaction = transactionService.findTransactionById(id);
		return new ResponseEntity<>(transaction, HttpStatus.OK);
	}

	@PostMapping("/add")
	public ResponseEntity<Transaction> addTransaction(@RequestBody TransactionRequest request) {
		try {
			// Validar que existe la cuenta
			Account account = accountService.findAccountById(request.getAccountId());
			
			// Crear nueva transacción
			Transaction transaction = new Transaction();
			transaction.setAmount(request.getAmount());
			transaction.setDescription(request.getDescription());
			
			// NUEVO: Establecer type y referenceId
			transaction.setType(request.getType());
			transaction.setReferenceId(request.getReferenceId());
			
			// Convertir fecha string a Date
			transaction.setDate(Date.valueOf(request.getDate()));
			
			// Establecer register_date como fecha actual
			transaction.setRegisterDate(Date.valueOf(LocalDate.now()));
			
			// Establecer la cuenta
			transaction.setAccount(account);
			
			// Guardar transacción
			Transaction newTransaction = transactionService.addTransaction(transaction);
			return new ResponseEntity<>(newTransaction, HttpStatus.CREATED);
			
		} catch (Exception e) {
			System.err.println("Error adding transaction: " + e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
		}
	}

	@PutMapping("/update")
	public ResponseEntity<Transaction> updateTransaction(@RequestBody Transaction transaction) {
		Transaction updateTransaction = transactionService.updateTransaction(transaction);
		return new ResponseEntity<>(updateTransaction, HttpStatus.OK);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteTransaction(@PathVariable("id") Long id) {
		transactionService.deleteTransaction(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@GetMapping("/account/{accountId}")
	public ResponseEntity<List<Transaction>> getTransactionsByAccount(@PathVariable("accountId") Long accountId) {
		try {
			List<Transaction> transactions = transactionService.findTransactionsByAccountId(accountId);
			
			// NUEVO: Convertir a DTOs para evitar lazy loading
			List<TransactionDTO> transactionDTOs = transactions.stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
			
			return new ResponseEntity(transactionDTOs, HttpStatus.OK);
		} catch (Exception e) {
			System.err.println("Error fetching transactions: " + e.getMessage());
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	// Clase interna para el request DTO
	public static class TransactionRequest {
		private String date;
		private String description;
		private double amount;
		private String type;
		private String referenceId;
		private Long accountId;
		
		// Getters y setters
		public String getDate() { return date; }
		public void setDate(String date) { this.date = date; }
		
		public String getDescription() { return description; }
		public void setDescription(String description) { this.description = description; }
		
		public double getAmount() { return amount; }
		public void setAmount(double amount) { this.amount = amount; }
		
		public String getType() { return type; }
		public void setType(String type) { this.type = type; }
		
		public String getReferenceId() { return referenceId; }
		public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
		
		public Long getAccountId() { return accountId; }
		public void setAccountId(Long accountId) { this.accountId = accountId; }
	}

	// NUEVO: Método para convertir Transaction a DTO
	private TransactionDTO convertToDTO(Transaction transaction) {
		TransactionDTO dto = new TransactionDTO();
		dto.setId(transaction.getTransaction_Id());
		dto.setAmount(transaction.getAmount());
		dto.setDate(transaction.getDate().toString());
		dto.setDescription(transaction.getDescription());
		dto.setType(transaction.getType());
		dto.setReferenceId(transaction.getReferenceId());
		dto.setRegisterDate(transaction.getRegisterDate().toString());
		
		// Solo incluir el ID de la cuenta, no la entidad completa
		if (transaction.getAccount() != null) {
			dto.setAccountId(transaction.getAccount().getAccount_Id());
		}
		
		return dto;
	}

	// NUEVO: Clase DTO para Transaction
	public static class TransactionDTO {
		private Long id;
		private double amount;
		private String date;
		private String description;
		private String type;
		private String referenceId;
		private String registerDate;
		private Long accountId;
		
		// Getters y setters
		public Long getId() { return id; }
		public void setId(Long id) { this.id = id; }
		
		public double getAmount() { return amount; }
		public void setAmount(double amount) { this.amount = amount; }
		
		public String getDate() { return date; }
		public void setDate(String date) { this.date = date; }
		
		public String getDescription() { return description; }
		public void setDescription(String description) { this.description = description; }
		
		public String getType() { return type; }
		public void setType(String type) { this.type = type; }
		
		public String getReferenceId() { return referenceId; }
		public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
		
		public String getRegisterDate() { return registerDate; }
		public void setRegisterDate(String registerDate) { this.registerDate = registerDate; }
		
		public Long getAccountId() { return accountId; }
		public void setAccountId(Long accountId) { this.accountId = accountId; }
	}
}
