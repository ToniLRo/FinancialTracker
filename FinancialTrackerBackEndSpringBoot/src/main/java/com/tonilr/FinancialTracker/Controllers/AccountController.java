package com.tonilr.FinancialTracker.Controllers;

import java.util.List;
import java.util.Map;
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
import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.AccountServices;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.dto.AccountDTO;

@Controller
@RequestMapping("/account")
public class AccountController {

	@Autowired
	private final AccountServices accountService;
	
	@Autowired
	private final UsersServices usersService;
	
	public AccountController(AccountServices accountService, UsersServices usersService) {
		this.accountService = accountService;
		this.usersService = usersService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<AccountDTO>> getAllAccounts() {
		try {
			// NUEVO: Obtener usuario autenticado y solo sus cuentas
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String username = authentication.getName();
			Users user = usersService.findUserByUsername(username);
			
			System.out.println("Getting accounts for user: " + username + " (ID: " + user.getUser_Id() + ")");
			
			// Obtener solo las cuentas del usuario autenticado
			List<Account> userAccounts = accountService.findAccountsByUserId(user.getUser_Id());
			
			// Convertir a DTOs para evitar problemas de lazy loading
			List<AccountDTO> accountDTOs = userAccounts.stream()
				.map(this::convertToDTO)
				.collect(Collectors.toList());
			
			System.out.println("Found " + accountDTOs.size() + " accounts for user " + username);
			return new ResponseEntity<>(accountDTOs, HttpStatus.OK);
			
		} catch (Exception e) {
			System.err.println("Error getting user accounts: " + e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/add")
	public ResponseEntity<AccountDTO> addAccount(@RequestBody Account account) {
		try {
			// Obtener usuario autenticado
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String username = authentication.getName();
			Users user = usersService.findUserByUsername(username);
			
			System.out.println("Creating account for user: " + username + " (ID: " + user.getUser_Id() + ")");
			
			// Establecer el usuario en la cuenta
			account.setUser(user);
			
			Account newAccount = accountService.addAccount(account);
			AccountDTO accountDTO = convertToDTO(newAccount);
			
			return new ResponseEntity<>(accountDTO, HttpStatus.CREATED);
		} catch (Exception e) {
			System.err.println("Error adding account: " + e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PutMapping("/update")
	public ResponseEntity<AccountDTO> updateAccount(@RequestBody Account account) {
		try {
			System.out.println("=== UPDATE ACCOUNT ===");
			System.out.println("Received account data:");
			System.out.println("- ID: " + account.getAccount_Id());
			System.out.println("- Holder name: " + account.getHolder_name());
			System.out.println("- Balance: " + account.getBalance());
			System.out.println("- Currency: " + account.getCurrency());
			System.out.println("- Account number: " + account.getAccount_number());
			System.out.println("- Account type: " + account.getAccount_type());
			System.out.println("- User: " + (account.getUser() != null ? account.getUser().getUser_Id() : "null"));
			
			// NUEVO: Validar que la cuenta existe
			Account existingAccount = accountService.findAccountById(account.getAccount_Id());
			System.out.println("Found existing account: " + existingAccount.getAccount_Id());
			
			// NUEVO: Solo actualizar campos específicos para evitar conflictos
			existingAccount.setBalance(account.getBalance());
			if (account.getHolder_name() != null) {
				existingAccount.setHolder_name(account.getHolder_name());
			}
			if (account.getCurrency() != null) {
				existingAccount.setCurrency(account.getCurrency());
			}
			// NO actualizar: user, account_number, account_type, creation_date, etc.
			
			Account updatedAccount = accountService.updateAccount(existingAccount);
			System.out.println("✅ Account updated successfully. New balance: " + updatedAccount.getBalance());
			
			AccountDTO accountDTO = convertToDTO(updatedAccount);
			return new ResponseEntity<>(accountDTO, HttpStatus.OK);
		} catch (Exception e) {
			System.err.println("❌ Error updating account: " + e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<AccountDTO> getAccountById(@PathVariable("id") Long id) {
		try {
			Account account = accountService.findAccountById(id);
			AccountDTO accountDTO = convertToDTO(account);
			return new ResponseEntity<>(accountDTO, HttpStatus.OK);
		} catch (Exception e) {
			System.err.println("Error finding account: " + e.getMessage());
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteAccount(@PathVariable("id") Long id) {
		try {
			accountService.deleteAccount(id);
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			System.err.println("Error deleting account: " + e.getMessage());
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	// Método helper para convertir Account a AccountDTO
	private AccountDTO convertToDTO(Account account) {
		return new AccountDTO(
			account.getAccount_Id(),
			account.getHolder_name(),
			account.getAccount_number(),
			account.getAccount_type(),
			account.getBalance(),
			account.getCurrency(),
			account.getCreation_date(),
			account.getGood_thru(),
			account.getUser() != null ? account.getUser().getUser_Id() : null
		);
	}

	// NUEVO: Endpoint específico para actualizar solo el balance
	@PutMapping("/update-balance/{id}")
	public ResponseEntity<AccountDTO> updateAccountBalance(@PathVariable("id") Long id, @RequestBody Map<String, Object> balanceData) {
		try {
        System.out.println("=== UPDATE ACCOUNT BALANCE ===");
        System.out.println("Account ID: " + id);
        System.out.println("New balance: " + balanceData.get("balance"));
        
        Account existingAccount = accountService.findAccountById(id);
        
        // Solo actualizar el balance
        Double newBalance = ((Number) balanceData.get("balance")).doubleValue();
        existingAccount.setBalance(newBalance);
        
        Account updatedAccount = accountService.updateAccount(existingAccount);
        System.out.println("✅ Account balance updated successfully: " + updatedAccount.getBalance());
        
        AccountDTO accountDTO = convertToDTO(updatedAccount);
        return new ResponseEntity<>(accountDTO, HttpStatus.OK);
    } catch (Exception e) {
        System.err.println("❌ Error updating account balance: " + e.getMessage());
        e.printStackTrace();
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}
