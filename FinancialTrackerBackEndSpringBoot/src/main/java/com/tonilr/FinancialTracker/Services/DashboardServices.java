package com.tonilr.FinancialTracker.Services;

import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tonilr.FinancialTracker.Entities.Account;
import com.tonilr.FinancialTracker.Entities.Transaction;
import com.tonilr.FinancialTracker.repos.AccountRepo;
import com.tonilr.FinancialTracker.repos.TransactionRepo;

@Service
public class DashboardServices {

    @Autowired
    private AccountRepo accountRepo;
    
    @Autowired
    private TransactionRepo transactionRepo;

    public Map<String, Object> getDashboardData(Long userId) {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Obtener todas las cuentas del usuario
        List<Account> userAccounts = accountRepo.findByUserId(userId);
        
        // Calcular balance total
        double totalBalance = userAccounts.stream()
            .mapToDouble(Account::getBalance)
            .sum();
        
        // Obtener todas las transacciones del usuario
        List<Transaction> userTransactions = transactionRepo.findByUserId(userId);
        
        // Calcular ingresos y gastos totales del mes actual
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Date startDate = Date.valueOf(startOfMonth);
        Date endDate = Date.valueOf(now);
        
        double monthlyIncome = userTransactions.stream()
            .filter(t -> t.getDate().compareTo(startDate) >= 0 && t.getDate().compareTo(endDate) <= 0)
            .filter(t -> "Income".equalsIgnoreCase(t.getType()))
            .mapToDouble(t -> Math.abs(t.getAmount()))
            .sum();
            
        double monthlyExpenses = userTransactions.stream()
            .filter(t -> t.getDate().compareTo(startDate) >= 0 && t.getDate().compareTo(endDate) <= 0)
            .filter(t -> "Expense".equalsIgnoreCase(t.getType()))
            .mapToDouble(t -> Math.abs(t.getAmount()))
            .sum();
        
        // Calcular savings (balance total - gastos del mes)
        double savings = totalBalance - monthlyExpenses;
        
        // Datos mensuales para el gráfico (últimos 12 meses)
        Map<String, Double> monthlyIncomeData = getMonthlyData(userTransactions, true);
        Map<String, Double> monthlyExpenseData = getMonthlyData(userTransactions, false);
        
        // Resumen por categorías
        Map<String, Double> categoryData = getCategoryData(userTransactions);
        
        dashboardData.put("totalBalance", totalBalance);
        dashboardData.put("monthlyIncome", monthlyIncome);
        dashboardData.put("monthlyExpenses", monthlyExpenses);
        dashboardData.put("savings", savings);
        dashboardData.put("accounts", userAccounts);
        dashboardData.put("monthlyIncomeChart", monthlyIncomeData);
        dashboardData.put("monthlyExpenseChart", monthlyExpenseData);
        dashboardData.put("categoryBreakdown", categoryData);
        
        return dashboardData;
    }
    
    private Map<String, Double> getMonthlyData(List<Transaction> transactions, boolean isIncome) {
        Map<String, Double> monthlyData = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        
        // Inicializar últimos 12 meses con 0
        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.from(now.minusMonths(i));
            monthlyData.put(month.toString(), 0.0);
        }
        
        // Agrupar transacciones por mes
        Map<YearMonth, Double> transactionsByMonth = transactions.stream()
            .filter(t -> isIncome ? "Income".equalsIgnoreCase(t.getType()) : "Expense".equalsIgnoreCase(t.getType()))
            .collect(Collectors.groupingBy(
                t -> YearMonth.from(t.getDate().toLocalDate()),
                Collectors.summingDouble(t -> Math.abs(t.getAmount()))
            ));
        
        // Actualizar datos con valores reales
        transactionsByMonth.forEach((month, amount) -> {
            if (monthlyData.containsKey(month.toString())) {
                monthlyData.put(month.toString(), amount);
            }
        });
        
        return monthlyData;
    }
    
    private Map<String, Double> getCategoryData(List<Transaction> transactions) {
        Map<String, Double> categoryData = transactions.stream()
            .collect(Collectors.groupingBy(
                t -> {
                    String type = t.getType();
                    if (type == null || type.trim().isEmpty()) {
                        return "Other";
                    }
                    return type;
                },
                Collectors.summingDouble(t -> Math.abs(t.getAmount()))
            ));
        
        return categoryData;
    }
}
