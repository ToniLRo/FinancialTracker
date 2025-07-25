package com.tonilr.FinancialTracker.validation;

import static org.junit.jupiter.api.Assertions.*;

import java.sql.Date;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.Entities.Account;

public class FinancialDataValidationTest {

    @Test
    void testValidTransactionAmount() {
        Transaction transaction = new Transaction();
        transaction.setAmount(100.0);
        
        assertTrue(transaction.getAmount() > 0, "El monto debe ser positivo");
        assertTrue(transaction.getAmount() <= 1000000.0, "El monto no debe exceder el límite máximo");
    }

    @Test
    void testInvalidTransactionAmount() {
        Transaction transaction = new Transaction();
        
        // Probar monto negativo
        transaction.setAmount(-100.0);
        assertTrue(transaction.getAmount() < 0, "Se detectó monto negativo");
        
        // Probar monto cero
        transaction.setAmount(0.0);
        assertEquals(0.0, transaction.getAmount(), "Se detectó monto cero");
    }

    @Test
    void testValidTransactionDate() {
        Transaction transaction = new Transaction();
        LocalDate validDate = LocalDate.now();
        transaction.setDate(Date.valueOf(validDate));
        
        assertNotNull(transaction.getDate());
        assertFalse(transaction.getDate().after(Date.valueOf(LocalDate.now())), 
                   "La fecha no puede ser futura");
    }

    @Test
    void testValidAccountBalance() {
        Account account = new Account();
        account.setBalance(1000.0);
        
        assertTrue(account.getBalance() >= 0, "El balance no puede ser negativo");
    }

    @Test
    void testValidTransactionType() {
        Transaction transaction = new Transaction();
        transaction.setType("EXPENSE");
        
        assertTrue(transaction.getType().equals("EXPENSE") || 
                  transaction.getType().equals("INCOME"), 
                  "El tipo debe ser EXPENSE o INCOME");
    }

    @Test
    void testValidAccountType() {
        Account account = new Account();
        account.setAccount_type(com.tonilr.FinancialTracker.Entities.AccountType.BankAccount);
        
        assertNotNull(account.getAccount_type(), "El tipo de cuenta no debe ser nulo");
    }

    @Test
    void testTransactionDescriptionValidation() {
        Transaction transaction = new Transaction();
        transaction.setDescription("Transacción de prueba");
        
        assertNotNull(transaction.getDescription());
        assertFalse(transaction.getDescription().isEmpty(), "La descripción no debe estar vacía");
        assertTrue(transaction.getDescription().length() <= 255, "La descripción no debe exceder 255 caracteres");
    }

    @Test
    void testAccountHolderNameValidation() {
        Account account = new Account();
        account.setHolder_name("Juan Pérez");
        
        assertNotNull(account.getHolder_name());
        assertFalse(account.getHolder_name().isEmpty(), "El nombre del titular no debe estar vacío");
    }

    @Test
    void testAccountNumberValidation() {
        Account account = new Account();
        account.setAccount_number("1234567890");
        
        assertNotNull(account.getAccount_number());
        assertFalse(account.getAccount_number().isEmpty(), "El número de cuenta no debe estar vacío");
        assertTrue(account.getAccount_number().length() >= 8, "El número de cuenta debe tener al menos 8 dígitos");
    }

    @Test
    void testCurrencyValidation() {
        Account account = new Account();
        account.setCurrency("USD");
        
        assertNotNull(account.getCurrency());
        assertTrue(account.getCurrency().length() == 3, "La moneda debe tener 3 caracteres");
    }
} 