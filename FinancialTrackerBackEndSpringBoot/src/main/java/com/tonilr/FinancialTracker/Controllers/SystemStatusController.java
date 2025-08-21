package com.tonilr.FinancialTracker.Controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemStatusController {

    // Horario de producción (Europa/Madrid) equivalente al frontend
    private static final int START_HOUR = 10; // 10:00
    private static final int END_HOUR = 19;   // 19:00
    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> body = new HashMap<>();

        boolean isProduction = isProdProfile();

        if (!isProduction) {
            body.put("active", true);
            body.put("isProduction", false);
            body.put("currentTime", nowTime());
            body.put("currentDay", currentDay());
            body.put("fromHour", START_HOUR);
            body.put("toHour", END_HOUR);
            body.put("isWeekday", true);
            body.put("isWithinHours", true);
            body.put("message", "Aplicación en modo desarrollo - siempre activa");
            return ResponseEntity.ok(body);
        }

        ZonedDateTime now = ZonedDateTime.now(ZONE);
        int dayOfWeek = now.getDayOfWeek().getValue(); // 1=Lunes ... 7=Domingo
        int hour = now.getHour();

        boolean isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        boolean isWithinHours = hour >= START_HOUR && hour < END_HOUR;
        boolean active = isWeekday && isWithinHours;

        body.put("active", active);
        body.put("isProduction", true);
        body.put("currentTime", nowTime());
        body.put("currentDay", currentDay());
        body.put("fromHour", START_HOUR);
        body.put("toHour", END_HOUR);
        body.put("isWeekday", isWeekday);
        body.put("isWithinHours", isWithinHours);
        body.put("message", buildMessage(active, isWeekday, isWithinHours));

        return ResponseEntity.ok(body);
    }

    private boolean isProdProfile() {
        String p = activeProfile == null ? "" : activeProfile.toLowerCase(Locale.ROOT);
        // Consideramos prod si incluye "prod" y no es "dev" ni "local" ni "test"
        return p.contains("prod") && !p.contains("dev") && !p.contains("local") && !p.contains("test");
    }

    private String nowTime() {
        return ZonedDateTime.now(ZONE).format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private String currentDay() {
        return ZonedDateTime.now(ZONE).format(DateTimeFormatter.ofPattern("EEEE", new Locale("es", "ES"))).toUpperCase(Locale.ROOT);
    }

    private String buildMessage(boolean active, boolean isWeekday, boolean isWithinHours) {
        if (active) return "Aplicación activa y funcionando normalmente";
        if (!isWeekday) return "Aplicación cerrada durante el fin de semana";
        if (!isWithinHours) {
            ZonedDateTime now = ZonedDateTime.now(ZONE);
            int hour = now.getHour();
            if (hour < START_HOUR) {
                return "La aplicación estará disponible hoy a las " + START_HOUR + ":00.";
            } else {
                return "La aplicación estará disponible mañana a las 10:00.";
            }
        }
        return "La aplicación está temporalmente no disponible.";
    }
}


