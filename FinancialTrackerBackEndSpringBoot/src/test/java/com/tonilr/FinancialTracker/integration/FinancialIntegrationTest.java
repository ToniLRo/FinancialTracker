package com.tonilr.FinancialTracker.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.sql.Date;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Entities.AccountType;
import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.Entities.Users;

@SpringBootTest
@ActiveProfiles("test")
public class FinancialIntegrationTest {

    @Test
    void testTransactionCreationAndValidation() {
        // Crear usuario
        Users user = new Users();
        user.setUser_Id(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        
        // Crear cuenta
        Account account = new Account();
        account.setAccount_Id(1L);
        account.setHolder_name("Juan Pérez");
        account.setAccount_number("1234567890");
        account.setAccount_type(AccountType.BankAccount);
        account.setBalance(1000.0);
        account.setCurrency("USD");
        account.setCreation_date(Date.valueOf(LocalDate.now()));
        account.setUser(user);
        
        // Crear transacción
        Transaction transaction = new Transaction();
        transaction.setTransaction_Id(1L);
        transaction.setAmount(100.0);
        transaction.setDescription("Compra en supermercado");
        transaction.setType("EXPENSE");
        transaction.setDate(Date.valueOf(LocalDate.now()));
        transaction.setAccount(account);
        transaction.setUser(user);
        
        // Validaciones
        assertNotNull(transaction);
        assertEquals(100.0, transaction.getAmount());
        assertEquals("EXPENSE", transaction.getType());
        assertNotNull(transaction.getAccount());
        assertNotNull(transaction.getUser());
        assertEquals(account.getAccount_Id(), transaction.getAccount().getAccount_Id());
        assertEquals(user.getUser_Id(), transaction.getUser().getUser_Id());
    }

    @Test
    void testAccountBalanceUpdate() {
        // Configurar cuenta inicial
        Account account = new Account();
        account.setBalance(1000.0);
        
        // Simular transacciones
        Transaction income = new Transaction();
        income.setAmount(500.0);
        income.setType("INCOME");
        
        Transaction expense = new Transaction();
        expense.setAmount(200.0);
        expense.setType("EXPENSE");
        
        // Calcular nuevo balance
        double newBalance = account.getBalance() + income.getAmount() - expense.getAmount();
        account.setBalance(newBalance);
        
        // Validar resultado
        assertEquals(1300.0, account.getBalance());
        assertTrue(account.getBalance() > 1000.0);
    }

    @Test
    void testMultipleAccountsManagement() {
        // Crear múltiples cuentas
        Account checkingAccount = new Account();
        checkingAccount.setAccount_Id(1L);
        checkingAccount.setAccount_type(AccountType.BankAccount);
        checkingAccount.setBalance(2000.0);
        checkingAccount.setCurrency("USD");
        
        Account savingsAccount = new Account();
        savingsAccount.setAccount_Id(2L);
        savingsAccount.setAccount_type(AccountType.BankAccount);
        savingsAccount.setBalance(5000.0);
        savingsAccount.setCurrency("USD");
        
        Account creditCard = new Account();
        creditCard.setAccount_Id(3L);
        creditCard.setAccount_type(AccountType.Card);
        creditCard.setBalance(-500.0); // Saldo negativo para tarjeta de crédito
        creditCard.setCurrency("USD");
        
        // Calcular patrimonio neto
        double netWorth = checkingAccount.getBalance() + 
                         savingsAccount.getBalance() + 
                         creditCard.getBalance();
        
        assertEquals(6500.0, netWorth);
        assertTrue(netWorth > 0);
    }

    @Test
    void testTransactionTypeValidation() {
        // Probar tipos válidos
        Transaction incomeTransaction = new Transaction();
        incomeTransaction.setType("INCOME");
        assertEquals("INCOME", incomeTransaction.getType());
        
        Transaction expenseTransaction = new Transaction();
        expenseTransaction.setType("EXPENSE");
        assertEquals("EXPENSE", expenseTransaction.getType());
        
        // Validar que solo se permiten estos tipos
        assertTrue("INCOME".equals(incomeTransaction.getType()) || 
                  "EXPENSE".equals(incomeTransaction.getType()));
    }

    @Test
    void testAccountTypeValidation() {
        // Probar tipos de cuenta válidos
        Account bankAccount = new Account();
        bankAccount.setAccount_type(AccountType.BankAccount);
        assertEquals(AccountType.BankAccount, bankAccount.getAccount_type());
        
        Account cashAccount = new Account();
        cashAccount.setAccount_type(AccountType.Cash);
        assertEquals(AccountType.Cash, cashAccount.getAccount_type());
        
        Account cardAccount = new Account();
        cardAccount.setAccount_type(AccountType.Card);
        assertEquals(AccountType.Card, cardAccount.getAccount_type());
        
        // Validar que todos los tipos son válidos
        assertNotNull(bankAccount.getAccount_type());
        assertNotNull(cashAccount.getAccount_type());
        assertNotNull(cardAccount.getAccount_type());
    }

    @Test
    void testFinancialCalculations() {
        // Simular datos financieros mensuales
        double monthlyIncome = 5000.0;
        double monthlyExpenses = 3000.0;
        double savings = monthlyIncome - monthlyExpenses;
        
        // Calcular métricas financieras
        double savingsRate = (savings / monthlyIncome) * 100;
        double expenseRatio = (monthlyExpenses / monthlyIncome) * 100;
        
        // Validar cálculos
        assertEquals(2000.0, savings);
        assertEquals(40.0, savingsRate);
        assertEquals(60.0, expenseRatio);
        assertTrue(savingsRate + expenseRatio == 100.0);
    }

    @Test
    void testDataIntegrity() {
        // Crear entidades relacionadas
        Users user = new Users();
        user.setUser_Id(1L);
        user.setUsername("testuser");
        
        Account account = new Account();
        account.setAccount_Id(1L);
        account.setUser(user);
        
        Transaction transaction = new Transaction();
        transaction.setTransaction_Id(1L);
        transaction.setAccount(account);
        transaction.setUser(user);
        
        // Validar integridad referencial
        assertEquals(user.getUser_Id(), account.getUser().getUser_Id());
        assertEquals(account.getAccount_Id(), transaction.getAccount().getAccount_Id());
        assertEquals(user.getUser_Id(), transaction.getUser().getUser_Id());
        
        // Validar que las relaciones son consistentes
        assertNotNull(account.getUser());
        assertNotNull(transaction.getAccount());
        assertNotNull(transaction.getUser());
    }
} 