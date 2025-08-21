package com.tonilr.FinancialTracker.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.List;
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.repos.UsersRepo;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TransactionServices transactionService;

    @Autowired
    private UsersRepo usersRepo;

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

    // Método existente para reset de password
    public void sendWeeklyReport(String toEmail, Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        
        Map<Object, Double> categoryTotals = transactionService
            .getCategoryTotalsByDateRange(userId, startDate, endDate);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Tu Resumen Semanal - Financial Tracker");
        
        String emailBody = formatWeeklyReport(categoryTotals, startDate, endDate);
        message.setText(emailBody);
        mailSender.send(message);
    }



    // Método privado para enviar reporte a un usuario específico
    private void sendMonthlyReportForUser(String toEmail, Long userId, LocalDate startDate, LocalDate endDate) {
        try {
            Map<Object, Double> currentMonthTotals = transactionService
                .getCategoryTotalsByDateRange(userId, startDate, endDate);

            double totalIncome = transactionService.getTotalIncome(userId, startDate, endDate);
            double totalExpenses = transactionService.getTotalExpenses(userId, startDate, endDate);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Tu Resumen Mensual - Financial Tracker");

            String emailBody = formatMonthlyReport(currentMonthTotals, totalIncome, totalExpenses, startDate);
            message.setText(emailBody);

            mailSender.send(message);
            
        } catch (Exception e) {
            throw new RuntimeException("Could not send monthly report for user " + userId + ": " + e.getMessage());
        }
    }

    // Método público para enviar reporte manual (con parámetros)
    public void sendMonthlyReport(String toEmail, Long userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);
        sendMonthlyReportForUser(toEmail, userId, startDate, endDate);
    }

    private String formatWeeklyReport(Map<Object, Double> categoryTotals, LocalDate startDate, LocalDate endDate) {
        StringBuilder content = new StringBuilder();
        content.append("¡Hola!\n\n");
        content.append("Aquí está tu resumen semanal de Financial Tracker.\n\n");
        
        content.append("📅 Período: ")
               .append(startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
               .append(" - ")
               .append(endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
               .append("\n\n");
        
        content.append("💰 Gastos por Categoría:\n");
        content.append("------------------------\n");
        categoryTotals.forEach((category, amount) -> {
            content.append(String.format("%-20s: $%,10.2f\n", category, amount));
        });
        
        content.append("\n📊 Para ver más detalles y gráficos, visita tu dashboard:\n");
        content.append(frontendUrl + "/dashboard\n\n");
        
        content.append("Saludos,\n");
        content.append("El equipo de Financial Tracker");
        
        return content.toString();
    }

    private String formatMonthlyReport(Map<Object, Double> categoryTotals, double totalIncome, 
                                     double totalExpenses, LocalDate startDate) {
        StringBuilder content = new StringBuilder();
        content.append("¡Hola!\n\n");
        content.append("Aquí está tu resumen mensual de Financial Tracker.\n\n");
        
        content.append("📅 Mes: ")
               .append(startDate.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES")))
               .append(" ")
               .append(startDate.getYear())
               .append("\n\n");
        
        content.append("📈 Resumen General:\n");
        content.append("------------------\n");
        content.append(String.format("✅ Ingresos Totales:  $%,10.2f\n", totalIncome));
        content.append(String.format("❌ Gastos Totales:    $%,10.2f\n", totalExpenses));
        content.append(String.format("💰 Balance:           $%,10.2f\n\n", totalIncome - totalExpenses));
        
        content.append("📊 Desglose por Categoría:\n");
        content.append("------------------------\n");
        categoryTotals.forEach((category, amount) -> {
            content.append(String.format("%-20s: $%,10.2f\n", category, amount));
        });
        
        content.append("\n💡 Para ver más detalles y gráficos, visita tu dashboard:\n");
        content.append(frontendUrl + "/dashboard\n\n");
        
        content.append("Saludos,\n");
        content.append("El equipo de Financial Tracker");
        
        return content.toString();
    }
}
