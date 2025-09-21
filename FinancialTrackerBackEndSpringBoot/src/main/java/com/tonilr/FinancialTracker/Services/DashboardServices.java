package com.tonilr.FinancialTracker.Services;

import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        
        System.out.println("🔍 DEBUG - User ID: " + userId);
        System.out.println("🔍 DEBUG - Total transactions found: " + userTransactions.size());
        System.out.println("🔍 DEBUG - User accounts: " + userAccounts.size());
        
        // Mostrar algunas transacciones de ejemplo
        if (!userTransactions.isEmpty()) {
            System.out.println("🔍 DEBUG - Sample transactions:");
            userTransactions.stream().limit(5).forEach(t -> {
                System.out.println("  - ID: " + t.getTransaction_Id() + ", Type: " + t.getType() + 
                                 ", Amount: " + t.getAmount() + ", Date: " + t.getDate());
            });
        }
        
        // Calcular ingresos y gastos totales del mes actual
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Date startDate = Date.valueOf(startOfMonth);
        Date endDate = Date.valueOf(now);
        
        System.out.println("🔍 DEBUG - Date range: " + startDate + " to " + endDate);
        
        // Clasificar por monto: positivos = ingresos, negativos = gastos
        double monthlyIncome = userTransactions.stream()
            .filter(t -> t.getDate().compareTo(startDate) >= 0 && t.getDate().compareTo(endDate) <= 0)
            .filter(t -> t.getAmount() > 0) // Montos positivos = ingresos
            .mapToDouble(t -> Math.abs(t.getAmount()))
            .sum();
            
        double monthlyExpenses = userTransactions.stream()
            .filter(t -> t.getDate().compareTo(startDate) >= 0 && t.getDate().compareTo(endDate) <= 0)
            .filter(t -> t.getAmount() < 0) // Montos negativos = gastos
            .mapToDouble(t -> Math.abs(t.getAmount()))
            .sum();
        
        System.out.println("🔍 DEBUG - Monthly income: " + monthlyIncome);
        System.out.println("🔍 DEBUG - Monthly expenses: " + monthlyExpenses);
        
        // Calcular savings (balance total - gastos del mes)
        double savings = totalBalance - monthlyExpenses;
        
        // Datos mensuales para el gráfico (últimos 12 meses)
        Map<String, Double> monthlyIncomeData = getMonthlyData(userTransactions, true);
        Map<String, Double> monthlyExpenseData = getMonthlyData(userTransactions, false);
        
        System.out.println("🔍 DEBUG - Monthly income data: " + monthlyIncomeData);
        System.out.println("🔍 DEBUG - Monthly expense data: " + monthlyExpenseData);
        
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
        
        // Agregar información de depuración
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("totalTransactions", userTransactions.size());
        debugInfo.put("transactionsInDateRange", userTransactions.stream()
            .filter(t -> t.getDate().compareTo(startDate) >= 0 && t.getDate().compareTo(endDate) <= 0)
            .count());
        debugInfo.put("positiveTransactions", userTransactions.stream()
            .filter(t -> t.getAmount() > 0)
            .count());
        debugInfo.put("negativeTransactions", userTransactions.stream()
            .filter(t -> t.getAmount() < 0)
            .count());
        debugInfo.put("dateRange", startDate + " to " + endDate);
        dashboardData.put("debugInfo", debugInfo);

        // Si hay transacciones, mostrar algunas de ejemplo
        if (!userTransactions.isEmpty()) {
            List<Map<String, Object>> sampleTransactions = new ArrayList<>();
            userTransactions.stream().limit(3).forEach(t -> {
                Map<String, Object> transaction = new HashMap<>();
                transaction.put("id", t.getTransaction_Id());
                transaction.put("type", t.getType());
                transaction.put("amount", t.getAmount());
                transaction.put("date", t.getDate());
                sampleTransactions.add(transaction);
            });
            dashboardData.put("sampleTransactions", sampleTransactions);
        }
        
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
        
        // Agrupar transacciones por mes - SIN FILTRO DE FECHA
        Map<YearMonth, Double> transactionsByMonth = transactions.stream()
            .filter(t -> isIncome ? t.getAmount() > 0 : t.getAmount() < 0) // Clasificar por monto
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

    // Métodos auxiliares para clasificar transacciones
    private boolean isIncomeTransaction(String type) {
        if (type == null) return false;
        String lowerType = type.toLowerCase();
        return lowerType.equals("income") || 
               lowerType.equals("deposit") || 
               lowerType.equals("salary") || 
               lowerType.equals("bonus") || 
               lowerType.equals("freelance") || 
               lowerType.equals("refund") ||
               lowerType.equals("investment") ||
               lowerType.equals("transfer") && // Asumir que las transferencias positivas son ingresos
               true; // Esto necesita lógica adicional basada en el monto
    }

    private boolean isExpenseTransaction(String type) {
        if (type == null) return false;
        String lowerType = type.toLowerCase();
        return lowerType.equals("expense") || 
               lowerType.equals("withdraw") || 
               lowerType.equals("food") || 
               lowerType.equals("transport") || 
               lowerType.equals("entertainment") || 
               lowerType.equals("shopping") || 
               lowerType.equals("bills") || 
               lowerType.equals("healthcare") || 
               lowerType.equals("education") || 
               lowerType.equals("gift") || 
               lowerType.equals("other");
    }
}