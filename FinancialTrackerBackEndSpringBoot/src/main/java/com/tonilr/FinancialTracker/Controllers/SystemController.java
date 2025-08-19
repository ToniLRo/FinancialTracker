package com.tonilr.FinancialTracker.Controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Value("${app.schedule.start-hour:10}")
    private int startHour;

    @Value("${app.schedule.end-hour:19}")
    private int endHour;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> response = new HashMap<>();
        
        // En desarrollo, siempre activo
        if ("dev".equals(activeProfile) || "local".equals(activeProfile)) {
            response.put("active", true);
            response.put("isProduction", false);
            response.put("message", "Aplicación en modo desarrollo - siempre activa");
            return ResponseEntity.ok(response);
        }

        // En producción, verificar horario
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Europe/Madrid"));
        LocalTime currentTime = now.toLocalTime();
        int currentDayOfWeek = now.getDayOfWeek().getValue(); // 1=Lunes, 7=Domingo
        
        // Verificar si es día laboral (Lunes a Viernes)
        boolean isWeekday = currentDayOfWeek >= 1 && currentDayOfWeek <= 5;
        
        // Verificar si está dentro del horario
        boolean isWithinHours = !currentTime.isBefore(LocalTime.of(startHour, 0)) && 
                               !currentTime.isAfter(LocalTime.of(endHour, 0));
        
        boolean isActive = isWeekday && isWithinHours;
        
        response.put("active", isActive);
        response.put("isProduction", true);
        response.put("currentTime", currentTime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
        response.put("currentDay", now.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase());
        response.put("fromHour", startHour);
        response.put("toHour", endHour);
        response.put("isWeekday", isWeekday);
        response.put("isWithinHours", isWithinHours);
        
        if (isActive) {
            response.put("message", "Aplicación activa y funcionando normalmente");
        } else {
            if (!isWeekday) {
                response.put("message", "Aplicación cerrada durante el fin de semana");
            } else {
                response.put("message", "Aplicación cerrada fuera del horario de funcionamiento");
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("profile", activeProfile);
        return ResponseEntity.ok(health);
    }
}
