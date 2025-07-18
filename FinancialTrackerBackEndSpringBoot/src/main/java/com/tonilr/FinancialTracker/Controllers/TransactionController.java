package com.tonilr.FinancialTracker.Controllers;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.TransactionServices;
import com.tonilr.FinancialTracker.Services.AccountServices;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.dto.TransactionDTO;

@Controller
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/transaction")
public class TransactionController {
	@Autowired
	private final TransactionServices transactionService;
	
	@Autowired
	private final AccountServices accountService;
	
	@Autowired
	private final UsersServices usersService;
	
	public TransactionController(TransactionServices transactionService, AccountServices accountService, UsersServices usersService) {
		this.transactionService = transactionService;
		this.accountService = accountService;
		this.usersService = usersService;
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
	public ResponseEntity<TransactionDTO> addTransaction(@RequestBody TransactionRequest request) {
		try {
			// Obtener usuario autenticado
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String username = authentication.getName();
			Users user = usersService.findUserByUsername(username);
			
			System.out.println("Authenticated user: " + username);
			System.out.println("User ID: " + user.getUser_Id()); // CORREGIDO: getUser_Id() en lugar de getUserId()
			
			// Validar que existe la cuenta
			Account account = accountService.findAccountById(request.getAccountId());
			System.out.println("Account found: " + account.getAccount_Id());
			
			// Crear nueva transacción
			Transaction transaction = new Transaction();
			transaction.setAmount(request.getAmount());
			transaction.setDescription(request.getDescription());
			transaction.setType(request.getType());
			transaction.setReferenceId(request.getReferenceId());
			
			// Convertir fecha string a Date
			transaction.setDate(Date.valueOf(request.getDate()));
			
			// Establecer register_date como fecha actual
			transaction.setRegisterDate(Date.valueOf(LocalDate.now()));
			
			// Establecer las relaciones correctamente
			transaction.setAccount(account);
			transaction.setUser(user);
			
			System.out.println("Transaction before save - Account ID: " + 
			                   (transaction.getAccount() != null ? transaction.getAccount().getAccount_Id() : "null"));
			System.out.println("Transaction before save - User ID: " + 
			                   (transaction.getUser() != null ? transaction.getUser().getUser_Id() : "null")); // CORREGIDO
			
			// Guardar transacción
			Transaction newTransaction = transactionService.addTransaction(transaction);
			
			System.out.println("Transaction saved with ID: " + newTransaction.getTransaction_Id());
			
			// NUEVO: Convertir a DTO para evitar lazy loading
			TransactionDTO responseDTO = convertToDTO(newTransaction);
			
			return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
			
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
			System.out.println("=== GET TRANSACTIONS BY ACCOUNT ===");
			System.out.println("Received accountId: " + accountId);
			System.out.println("AccountId type: " + (accountId != null ? accountId.getClass().getSimpleName() : "null"));
			
			// Verificar usuario autenticado
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String username = authentication.getName();
			System.out.println("Authenticated user: " + username);
			
			// Verificar que la cuenta existe
			Account account = accountService.findAccountById(accountId);
			System.out.println("Account found: " + account.getAccount_Id());
			System.out.println("Account name: " + account.getAccount_name());
			
			// Buscar transacciones
			System.out.println("Searching transactions for account ID: " + accountId);
			List<Transaction> transactions = transactionService.findTransactionsByAccountId(accountId);
			System.out.println("Found " + transactions.size() + " transactions");
			
			// Debug cada transacción
			for (int i = 0; i < transactions.size(); i++) {
				Transaction t = transactions.get(i);
				System.out.println("Transaction " + i + ":");
				System.out.println("  - ID: " + t.getTransaction_Id());
				System.out.println("  - Amount: " + t.getAmount());
				System.out.println("  - Description: " + t.getDescription());
				System.out.println("  - Type: " + t.getType());
				System.out.println("  - Date: " + t.getDate());
				System.out.println("  - Account ID: " + (t.getAccount() != null ? t.getAccount().getAccount_Id() : "null"));
				System.out.println("  - User ID: " + (t.getUser() != null ? t.getUser().getUser_Id() : "null"));
			}
			
			// Convertir a DTOs para evitar lazy loading
			System.out.println("Converting to DTOs...");
			List<TransactionDTO> transactionDTOs = transactions.stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
			
			System.out.println("Converted " + transactionDTOs.size() + " DTOs");
			
			// Debug cada DTO
			for (int i = 0; i < transactionDTOs.size(); i++) {
				TransactionDTO dto = transactionDTOs.get(i);
				System.out.println("DTO " + i + ":");
				System.out.println("  - ID: " + dto.getId());
				System.out.println("  - Amount: " + dto.getAmount());
				System.out.println("  - Description: " + dto.getDescription());
				System.out.println("  - Type: " + dto.getType());
				System.out.println("  - AccountId: " + dto.getAccountId());
			}
			
			System.out.println("Returning response with " + transactionDTOs.size() + " transactions");
			return new ResponseEntity(transactionDTOs, HttpStatus.OK);
			
		} catch (Exception e) {
			System.err.println("ERROR in getTransactionsByAccount:");
			System.err.println("Error message: " + e.getMessage());
			System.err.println("Error class: " + e.getClass().getSimpleName());
			e.printStackTrace();
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
}
