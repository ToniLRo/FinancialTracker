package com.tonilr.FinancialTracker.Controllers;

import com.tonilr.FinancialTracker.Entities.ApiUpdateControl;
import com.tonilr.FinancialTracker.Services.ApiUpdateControlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/update-control")
public class ApiUpdateControlController {
    
    @Autowired
    private ApiUpdateControlService apiUpdateControlService;

    @GetMapping("/check/{type}")
    public ResponseEntity<Map<String, Object>> checkUpdateStatus(@PathVariable String type) {
        try {
            ApiUpdateControl.ApiType apiType = ApiUpdateControl.ApiType.valueOf(type.toUpperCase());
            boolean shouldUpdate = apiUpdateControlService.shouldUpdate(apiType);
            LocalDateTime nextUpdate = apiUpdateControlService.getNextUpdateTime(apiType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("shouldUpdate", shouldUpdate);
            response.put("nextUpdate", nextUpdate);
            response.put("lastUpdate", apiUpdateControlService.getLastUpdate(apiType));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/update/{type}")
    public ResponseEntity<?> recordUpdate(@PathVariable String type) {
        try {
            ApiUpdateControl.ApiType apiType = ApiUpdateControl.ApiType.valueOf(type.toUpperCase());
            apiUpdateControlService.updateLastUpdateTime(apiType);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/status")
    public ResponseEntity<List<Map<String, Object>>> getAllStatus() {
        return ResponseEntity.ok(apiUpdateControlService.getAllApiStatus());
    }
}
