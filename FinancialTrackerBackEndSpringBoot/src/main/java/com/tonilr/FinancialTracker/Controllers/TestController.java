package com.tonilr.FinancialTracker.Controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.info("Endpoint de salud llamado");
        return ResponseEntity.ok("OK - Aplicación funcionando");
    }

    @PostMapping("/cors-test")
    public ResponseEntity<String> corsTest(@RequestBody String data) {
        log.info("Test CORS POST recibido: {}", data);
        return ResponseEntity.ok("CORS POST funcionando - datos recibidos: " + data);
    }

    @GetMapping("/cors-test")
    public ResponseEntity<String> corsTestGet() {
        log.info("Test CORS GET llamado");
        return ResponseEntity.ok("CORS GET funcionando");
    }
}
