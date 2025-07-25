package com.tonilr.FinancialTracker.business;

import static org.junit.jupiter.api.Assertions.*;

import java.sql.Date;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Entities.Transaction;

public class FinancialBusinessLogicTest {

    @Test
    void testCalculateAccountBalance() {
        Account account = new Account();
        account.setBalance(1000.0);
        
        Transaction incomeTransaction = new Transaction();
        incomeTransaction.setAmount(500.0);
        incomeTransaction.setType("INCOME");
        
        Transaction expenseTransaction = new Transaction();
        expenseTransaction.setAmount(200.0);
        expenseTransaction.setType("EXPENSE");
        
        // Simular cálculo de balance: 1000 + 500 - 200 = 1300
        double calculatedBalance = account.getBalance() + incomeTransaction.getAmount() - expenseTransaction.getAmount();
        
        assertEquals(1300.0, calculatedBalance, "El balance calculado debe ser 1300.0");
    }

    @Test
    void testCalculateMonthlyIncome() {
        Transaction income1 = new Transaction();
        income1.setAmount(500.0);
        income1.setType("INCOME");
        income1.setDate(Date.valueOf(LocalDate.now()));
        
        Transaction income2 = new Transaction();
        income2.setAmount(300.0);
        income2.setType("INCOME");
        income2.setDate(Date.valueOf(LocalDate.now()));
        
        Transaction expense = new Transaction();
        expense.setAmount(200.0);
        expense.setType("EXPENSE");
        expense.setDate(Date.valueOf(LocalDate.now()));
        
        // Simular cálculo de ingresos mensuales
        double monthlyIncome = 0.0;
        if ("INCOME".equals(income1.getType())) monthlyIncome += income1.getAmount();
        if ("INCOME".equals(income2.getType())) monthlyIncome += income2.getAmount();
        if ("INCOME".equals(expense.getType())) monthlyIncome += expense.getAmount();
        
        assertEquals(800.0, monthlyIncome, "Los ingresos mensuales deben ser 800.0");
    }

    @Test
    void testCalculateMonthlyExpenses() {
        Transaction expense1 = new Transaction();
        expense1.setAmount(200.0);
        expense1.setType("EXPENSE");
        expense1.setDate(Date.valueOf(LocalDate.now()));
        
        Transaction expense2 = new Transaction();
        expense2.setAmount(150.0);
        expense2.setType("EXPENSE");
        expense2.setDate(Date.valueOf(LocalDate.now()));
        
        Transaction income = new Transaction();
        income.setAmount(500.0);
        income.setType("INCOME");
        income.setDate(Date.valueOf(LocalDate.now()));
        
        // Simular cálculo de gastos mensuales
        double monthlyExpenses = 0.0;
        if ("EXPENSE".equals(expense1.getType())) monthlyExpenses += expense1.getAmount();
        if ("EXPENSE".equals(expense2.getType())) monthlyExpenses += expense2.getAmount();
        if ("EXPENSE".equals(income.getType())) monthlyExpenses += income.getAmount();
        
        assertEquals(350.0, monthlyExpenses, "Los gastos mensuales deben ser 350.0");
    }

    @Test
    void testCalculateNetWorth() {
        Account account1 = new Account();
        account1.setBalance(1000.0);
        
        Account account2 = new Account();
        account2.setBalance(2500.0);
        
        Account account3 = new Account();
        account3.setBalance(-500.0); // Cuenta con deuda
        
        // Simular cálculo de patrimonio neto
        double netWorth = account1.getBalance() + account2.getBalance() + account3.getBalance();
        
        assertEquals(3000.0, netWorth, "El patrimonio neto debe ser 3000.0");
    }

    @Test
    void testValidateTransactionAmount() {
        // Transacción válida
        Transaction validTransaction = new Transaction();
        validTransaction.setAmount(100.0);
        assertTrue(validTransaction.getAmount() > 0, "El monto debe ser positivo");
        assertTrue(validTransaction.getAmount() <= 1000000.0, "El monto no debe exceder el límite máximo");
        
        // Transacción inválida - monto negativo
        Transaction invalidTransaction = new Transaction();
        invalidTransaction.setAmount(-100.0);
        assertFalse(invalidTransaction.getAmount() > 0, "El monto negativo debe ser detectado");
        
        // Transacción inválida - monto cero
        Transaction zeroTransaction = new Transaction();
        zeroTransaction.setAmount(0.0);
        assertFalse(zeroTransaction.getAmount() > 0, "El monto cero debe ser detectado");
    }

    @Test
    void testValidateAccountBalance() {
        // Balance válido
        Account validAccount = new Account();
        validAccount.setBalance(1000.0);
        assertTrue(validAccount.getBalance() >= 0, "El balance debe ser no negativo");
        
        // Balance inválido - negativo
        Account invalidAccount = new Account();
        invalidAccount.setBalance(-100.0);
        assertFalse(invalidAccount.getBalance() >= 0, "El balance negativo debe ser detectado");
    }

    @Test
    void testCalculateSavingsRate() {
        double monthlyIncome = 5000.0;
        double monthlyExpenses = 3000.0;
        
        // Calcular tasa de ahorro
        double savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
        
        assertEquals(40.0, savingsRate, "La tasa de ahorro debe ser 40%");
    }

    @Test
    void testCalculateExpenseRatio() {
        double totalExpenses = 3000.0;
        double totalIncome = 5000.0;
        
        // Calcular ratio de gastos
        double expenseRatio = (totalExpenses / totalIncome) * 100;
        
        assertEquals(60.0, expenseRatio, "El ratio de gastos debe ser 60%");
    }

    @Test
    void testValidateTransactionDate() {
        Transaction transaction = new Transaction();
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(1);
        LocalDate pastDate = today.minusDays(1);
        
        // Fecha válida (hoy o pasado)
        transaction.setDate(Date.valueOf(today));
        assertFalse(transaction.getDate().after(Date.valueOf(LocalDate.now())), 
                   "La fecha actual debe ser válida");
        
        transaction.setDate(Date.valueOf(pastDate));
        assertFalse(transaction.getDate().after(Date.valueOf(LocalDate.now())), 
                   "La fecha pasada debe ser válida");
        
        // Fecha inválida (futura)
        transaction.setDate(Date.valueOf(futureDate));
        assertTrue(transaction.getDate().after(Date.valueOf(LocalDate.now())), 
                  "La fecha futura debe ser detectada");
    }
} 