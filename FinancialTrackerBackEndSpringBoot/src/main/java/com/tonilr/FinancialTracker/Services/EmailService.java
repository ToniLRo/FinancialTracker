package com.tonilr.FinancialTracker.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TransactionServices transactionService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    // Método existente para reset de password
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setFrom(fromEmail);
            message.setSubject("Password Reset Request - Financial Tracker");
            
            String resetUrl = frontendUrl + "/ResetPassword?token=" + resetToken;
            
            String emailBody = "Hello,\n\n" +
                             "You have requested to reset your password for Financial Tracker.\n\n" +
                             "Please click the link below to reset your password:\n" +
                             resetUrl + "\n\n" +
                             "This link will expire in 30 minutes.\n\n" +
                             "If you did not request this, please ignore this email.\n\n" +
                             "Best regards,\n" +
                             "Financial Tracker Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    // Nuevos métodos para resúmenes
    @Scheduled(cron = "0 0 20 * * SUN") // Domingo 8PM
    public void sendWeeklyReport(String toEmail, Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        
        Map<Object, Double> categoryTotals = transactionService
            .getCategoryTotalsByDateRange(userId, startDate, endDate);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Tu Resumen Semanal - Financial Tracker");
        
        StringBuilder content = new StringBuilder();
        content.append("Resumen Semanal (")
               .append(startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
               .append(" - ")
               .append(endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
               .append(")\n\n");
        
        content.append("Gastos por Categoría:\n");
        categoryTotals.forEach((category, amount) -> {
            content.append(category)
                   .append(": $")
                   .append(String.format("%.2f", amount))
                   .append("\n");
        });

        message.setText(content.toString());
        mailSender.send(message);
    }

    @Scheduled(cron = "0 0 9 1 * *") // Primer día del mes 9AM
    public void sendMonthlyReport(String toEmail, Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);
        
        Map<Object, Double> currentMonthTotals = transactionService
            .getCategoryTotalsByDateRange(userId, startDate, endDate);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Tu Resumen Mensual - Financial Tracker");
        
        StringBuilder content = new StringBuilder();
        content.append("Resumen Mensual - ")
               .append(startDate.getMonth())
               .append("\n\n");
        
        double totalIncome = transactionService.getTotalIncome(userId, startDate, endDate);
        double totalExpenses = transactionService.getTotalExpenses(userId, startDate, endDate);
        
        content.append("Resumen General:\n");
        content.append("Ingresos Totales: $").append(String.format("%.2f", totalIncome)).append("\n");
        content.append("Gastos Totales: $").append(String.format("%.2f", totalExpenses)).append("\n");
        content.append("Balance: $").append(String.format("%.2f", totalIncome - totalExpenses)).append("\n\n");
        
        content.append("Desglose por Categoría:\n");
        currentMonthTotals.forEach((category, amount) -> {
            content.append(category)
                   .append(": $")
                   .append(String.format("%.2f", amount))
                   .append("\n");
        });

        message.setText(content.toString());
        mailSender.send(message);
    }
}
