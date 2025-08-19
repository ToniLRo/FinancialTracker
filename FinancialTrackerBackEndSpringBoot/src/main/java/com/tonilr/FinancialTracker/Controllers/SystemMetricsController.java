package com.tonilr.FinancialTracker.Controllers;

import com.tonilr.FinancialTracker.Services.MemoryMonitorService;
import com.tonilr.FinancialTracker.Services.ResourceOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/metrics")
public class SystemMetricsController {

    @Autowired
    private MemoryMonitorService memoryMonitorService;
    
    @Autowired
    private ResourceOptimizationService resourceOptimizationService;

    /**
     * Obtiene métricas completas del sistema
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Métricas de memoria
            Map<String, Object> memoryStatus = memoryMonitorService.getMemoryStatus();
            response.put("memory", memoryStatus);
            
            // Métricas de recursos
            Map<String, Object> resourceStatus = resourceOptimizationService.getResourceStatus();
            response.put("resources", resourceStatus);
            
            // Estado general del sistema
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "OK");
            
        } catch (Exception e) {
            response.put("error", "Error obteniendo métricas: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene solo métricas de memoria
     */
    @GetMapping("/memory")
    public ResponseEntity<Map<String, Object>> getMemoryMetrics() {
        try {
            Map<String, Object> memoryStatus = memoryMonitorService.getMemoryStatus();
            return ResponseEntity.ok(memoryStatus);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error obteniendo métricas de memoria: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Obtiene solo métricas de recursos
     */
    @GetMapping("/resources")
    public ResponseEntity<Map<String, Object>> getResourceMetrics() {
        try {
            Map<String, Object> resourceStatus = resourceOptimizationService.getResourceStatus();
            return ResponseEntity.ok(resourceStatus);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error obteniendo métricas de recursos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Ejecuta optimización manual de memoria
     */
    @PostMapping("/memory/optimize")
    public ResponseEntity<Map<String, Object>> optimizeMemory() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Obtener estado antes de la optimización
            Map<String, Object> beforeStatus = memoryMonitorService.getMemoryStatus();
            double beforeUsage = (Double) beforeStatus.get("heapUsagePercent");
            
            // Ejecutar optimización
            memoryMonitorService.triggerMemoryOptimization();
            
            // Obtener estado después de la optimización
            Map<String, Object> afterStatus = memoryMonitorService.getMemoryStatus();
            double afterUsage = (Double) afterStatus.get("heapUsagePercent");
            
            response.put("message", "Optimización de memoria completada");
            response.put("beforeUsage", beforeUsage);
            response.put("afterUsage", afterUsage);
            response.put("improvement", Math.round((beforeUsage - afterUsage) * 100));
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "SUCCESS");
            
        } catch (Exception e) {
            response.put("error", "Error durante optimización: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Ejecuta limpieza de emergencia de memoria
     */
    @PostMapping("/memory/emergency-cleanup")
    public ResponseEntity<Map<String, Object>> emergencyMemoryCleanup() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Obtener estado antes de la limpieza
            Map<String, Object> beforeStatus = memoryMonitorService.getMemoryStatus();
            double beforeUsage = (Double) beforeStatus.get("heapUsagePercent");
            
            // Ejecutar limpieza de emergencia
            memoryMonitorService.triggerEmergencyCleanup();
            
            // Obtener estado después de la limpieza
            Map<String, Object> afterStatus = memoryMonitorService.getMemoryStatus();
            double afterUsage = (Double) afterStatus.get("heapUsagePercent");
            
            response.put("message", "Limpieza de emergencia completada");
            response.put("beforeUsage", beforeUsage);
            response.put("afterUsage", afterUsage);
            response.put("improvement", Math.round((beforeUsage - afterUsage) * 100));
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "SUCCESS");
            
        } catch (Exception e) {
            response.put("error", "Error durante limpieza de emergencia: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Ejecuta optimización manual de recursos
     */
    @PostMapping("/resources/optimize")
    public ResponseEntity<Map<String, Object>> optimizeResources() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Obtener estado antes de la optimización
            Map<String, Object> beforeStatus = resourceOptimizationService.getResourceStatus();
            double beforeCpu = (Double) beforeStatus.get("cpuUsage");
            int beforeThreads = (Integer) beforeStatus.get("threadCount");
            
            // Ejecutar optimización
            resourceOptimizationService.triggerResourceOptimization();
            
            // Obtener estado después de la optimización
            Map<String, Object> afterStatus = resourceOptimizationService.getResourceStatus();
            double afterCpu = (Double) afterStatus.get("cpuUsage");
            int afterThreads = (Integer) afterStatus.get("threadCount");
            
            response.put("message", "Optimización de recursos completada");
            response.put("beforeCpu", beforeCpu);
            response.put("afterCpu", afterCpu);
            response.put("cpuImprovement", Math.round((beforeCpu - afterCpu) * 100));
            response.put("beforeThreads", beforeThreads);
            response.put("afterThreads", afterThreads);
            response.put("threadImprovement", beforeThreads - afterThreads);
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "SUCCESS");
            
        } catch (Exception e) {
            response.put("error", "Error durante optimización: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Ejecuta optimización de emergencia de recursos
     */
    @PostMapping("/resources/emergency-optimize")
    public ResponseEntity<Map<String, Object>> emergencyResourceOptimization() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Obtener estado antes de la optimización
            Map<String, Object> beforeStatus = resourceOptimizationService.getResourceStatus();
            double beforeCpu = (Double) beforeStatus.get("cpuUsage");
            int beforeThreads = (Integer) beforeStatus.get("threadCount");
            
            // Ejecutar optimización de emergencia
            resourceOptimizationService.triggerEmergencyOptimization();
            
            // Obtener estado después de la optimización
            Map<String, Object> afterStatus = resourceOptimizationService.getResourceStatus();
            double afterCpu = (Double) afterStatus.get("cpuUsage");
            int afterThreads = (Integer) afterStatus.get("threadCount");
            
            response.put("message", "Optimización de emergencia completada");
            response.put("beforeCpu", beforeCpu);
            response.put("afterCpu", afterCpu);
            response.put("cpuImprovement", Math.round((beforeCpu - afterCpu) * 100));
            response.put("beforeThreads", beforeThreads);
            response.put("afterThreads", afterThreads);
            response.put("threadImprovement", beforeThreads - afterThreads);
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "SUCCESS");
            
        } catch (Exception e) {
            response.put("error", "Error durante optimización de emergencia: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene resumen de métricas para dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Métricas de memoria
            Map<String, Object> memoryStatus = memoryMonitorService.getMemoryStatus();
            Map<String, Object> memorySummary = new HashMap<>();
            memorySummary.put("heapUsage", memoryStatus.get("heapUsagePercent"));
            memorySummary.put("memoryPressure", memoryStatus.get("memoryPressure"));
            memorySummary.put("heapUsed", memoryStatus.get("heapUsed"));
            memorySummary.put("heapMax", memoryStatus.get("heapMax"));
            
            // Métricas de recursos
            Map<String, Object> resourceStatus = resourceOptimizationService.getResourceStatus();
            Map<String, Object> resourceSummary = new HashMap<>();
            resourceSummary.put("cpuUsage", resourceStatus.get("cpuUsage"));
            resourceSummary.put("threadCount", resourceStatus.get("threadCount"));
            resourceSummary.put("systemPressure", resourceStatus.get("systemPressure"));
            
            // Estado general
            String overallStatus = "OK";
            if ("CRITICAL".equals(memoryStatus.get("memoryPressure")) || 
                "CRITICAL".equals(resourceStatus.get("systemPressure"))) {
                overallStatus = "CRITICAL";
            } else if ("HIGH".equals(memoryStatus.get("memoryPressure")) || 
                       "HIGH".equals(resourceStatus.get("systemPressure"))) {
                overallStatus = "WARNING";
            }
            
            response.put("memory", memorySummary);
            response.put("resources", resourceSummary);
            response.put("overallStatus", overallStatus);
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "OK");
            
        } catch (Exception e) {
            response.put("error", "Error obteniendo métricas del dashboard: " + e.getMessage());
            response.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}
