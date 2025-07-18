package com.tonilr.FinancialTracker.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

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
}
