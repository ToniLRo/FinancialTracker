package com.tonilr.FinancialTracker.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.tonilr.FinancialTracker.Services.ReportSchedulerService;
import com.tonilr.FinancialTracker.Services.EmailService;
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.UsersServices;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:4200")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UsersServices usersService;

    @PostMapping("/test-weekly-report/{userId}")
    public ResponseEntity<?> testWeeklyReport(@PathVariable Long userId) {
        try {
            Users user = usersService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Usuario no encontrado"));
            }

            if (user.getUserSettings() == null || 
                user.getUserSettings().getEmailAddress() == null || 
                user.getUserSettings().getEmailAddress().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El usuario no tiene configurado un email válido"));
            }

            emailService.sendWeeklyReport(user.getUserSettings().getEmailAddress(), userId);
            return ResponseEntity.ok(Map.of("message", "Reporte semanal enviado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/test-monthly-report/{userId}")
    public ResponseEntity<?> testMonthlyReport(@PathVariable Long userId) {
        try {
            Users user = usersService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Usuario no encontrado"));
            }

            if (user.getUserSettings() == null || 
                user.getUserSettings().getEmailAddress() == null || 
                user.getUserSettings().getEmailAddress().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El usuario no tiene configurado un email válido"));
            }

            emailService.sendMonthlyReport(user.getUserSettings().getEmailAddress(), userId);
            return ResponseEntity.ok(Map.of("message", "Reporte mensual enviado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
} 