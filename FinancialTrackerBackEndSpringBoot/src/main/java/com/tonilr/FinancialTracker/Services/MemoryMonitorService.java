package com.tonilr.FinancialTracker.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.OperatingSystemMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MemoryMonitorService {
    
    private static final Logger log = LoggerFactory.getLogger(MemoryMonitorService.class);
    
    // Umbrales de memoria (configurables)
    private static final double MEMORY_WARNING_THRESHOLD = 0.75; // 75%
    private static final double MEMORY_CRITICAL_THRESHOLD = 0.90; // 90%
    private static final double MEMORY_EMERGENCY_THRESHOLD = 0.95; // 95%
    
    // Contador de alertas para evitar spam
    private final AtomicInteger alertCounter = new AtomicInteger(0);
    private final AtomicInteger criticalAlertCounter = new AtomicInteger(0);
    
    // Métricas de memoria
    private volatile long lastMemoryCheck = 0;
    private volatile double lastMemoryUsage = 0.0;
    
    /**
     * Obtiene el estado actual de la memoria del sistema
     */
    public Map<String, Object> getMemoryStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            
            // Memoria heap
            MemoryUsage heapMemory = memoryBean.getHeapMemoryUsage();
            long heapUsed = heapMemory.getUsed();
            long heapMax = heapMemory.getMax();
            long heapCommitted = heapMemory.getCommitted();
            
            // Memoria no-heap
            MemoryUsage nonHeapMemory = memoryBean.getNonHeapMemoryUsage();
            long nonHeapUsed = nonHeapMemory.getUsed();
            long nonHeapCommitted = nonHeapMemory.getCommitted();
            
            // Calcular porcentajes
            double heapUsagePercent = heapMax > 0 ? (double) heapUsed / heapMax : 0.0;
            double nonHeapUsagePercent = nonHeapCommitted > 0 ? (double) nonHeapUsed / nonHeapCommitted : 0.0;
            
            // Memoria del sistema operativo
            long totalPhysicalMemory = getTotalPhysicalMemory();
            long freePhysicalMemory = getFreePhysicalMemory();
            double systemMemoryUsage = totalPhysicalMemory > 0 ? 
                (double) (totalPhysicalMemory - freePhysicalMemory) / totalPhysicalMemory : 0.0;
            
            // Determinar nivel de presión de memoria
            String memoryPressure = getMemoryPressureLevel(heapUsagePercent, systemMemoryUsage);
            
            status.put("heapUsed", formatBytes(heapUsed));
            status.put("heapMax", formatBytes(heapMax));
            status.put("heapCommitted", formatBytes(heapCommitted));
            status.put("heapUsagePercent", Math.round(heapUsagePercent * 100.0) / 100.0);
            
            status.put("nonHeapUsed", formatBytes(nonHeapUsed));
            status.put("nonHeapCommitted", formatBytes(nonHeapCommitted));
            status.put("nonHeapUsagePercent", Math.round(nonHeapUsagePercent * 100.0) / 100.0);
            
            status.put("systemMemoryUsage", Math.round(systemMemoryUsage * 100.0) / 100.0);
            status.put("totalPhysicalMemory", formatBytes(totalPhysicalMemory));
            status.put("freePhysicalMemory", formatBytes(freePhysicalMemory));
            
            status.put("memoryPressure", memoryPressure);
            status.put("timestamp", System.currentTimeMillis());
            status.put("lastCheck", lastMemoryCheck);
            
            // Actualizar métricas
            lastMemoryCheck = System.currentTimeMillis();
            lastMemoryUsage = heapUsagePercent;
            
        } catch (Exception e) {
            log.error("Error obteniendo estado de memoria: {}", e.getMessage());
            status.put("error", "Error obteniendo métricas de memoria");
        }
        
        return status;
    }
    

    

    
    /**
     * Determina el nivel de presión de memoria
     */
    private String getMemoryPressureLevel(double heapUsage, double systemUsage) {
        double maxUsage = Math.max(heapUsage, systemUsage);
        
        if (maxUsage >= MEMORY_EMERGENCY_THRESHOLD) {
            return "EMERGENCY";
        } else if (maxUsage >= MEMORY_CRITICAL_THRESHOLD) {
            return "CRITICAL";
        } else if (maxUsage >= MEMORY_WARNING_THRESHOLD) {
            return "HIGH";
        } else if (maxUsage >= 0.5) {
            return "NORMAL";
        } else {
            return "LOW";
        }
    }
    
    /**
     * Ejecuta limpieza de emergencia
     */
    public void triggerEmergencyCleanup() {
        log.warn("🚨 EJECUTANDO LIMPIEZA DE EMERGENCIA");
        
        // Forzar garbage collection
        System.gc();
        
        // Limpiar caches si están disponibles
        clearApplicationCaches();
        
        // Log de memoria después de la limpieza
        Map<String, Object> afterCleanup = getMemoryStatus();
        log.info("🧹 Después de limpieza de emergencia: Heap usado: {}%", 
            afterCleanup.get("heapUsagePercent"));
    }
    
    /**
     * Ejecuta optimización de memoria
     */
    public void triggerMemoryOptimization() {
        log.info("🔄 Ejecutando optimización de memoria...");
        
        // Garbage collection suave
        System.gc();
        
        // Optimizaciones adicionales
        performMemoryOptimization();
    }
    
    /**
     * Realiza limpieza de memoria
     */
    private void performMemoryCleanup() {
        try {
            // Limpiar caches de la aplicación
            clearApplicationCaches();
            
            // Limpiar archivos temporales si es posible
            clearTempFiles();
            
            log.info("✅ Limpieza de memoria completada");
            
        } catch (Exception e) {
            log.error("Error durante limpieza de memoria: {}", e.getMessage());
        }
    }
    
    /**
     * Realiza optimización de memoria
     */
    private void performMemoryOptimization() {
        try {
            // Verificar si es necesario hacer GC
            Map<String, Object> currentStatus = getMemoryStatus();
            double currentUsage = (Double) currentStatus.get("heapUsagePercent");
            
            if (currentUsage > 0.7) { // Si uso > 70%
                log.info("🔄 Ejecutando garbage collection...");
                System.gc();
                
                // Verificar resultado
                Map<String, Object> afterGC = getMemoryStatus();
                double afterUsage = (Double) afterGC.get("heapUsagePercent");
                
                log.info("✅ GC completado: Antes: {}%, Después: {}%", 
                    Math.round(currentUsage * 100), Math.round(afterUsage * 100));
            }
            
        } catch (Exception e) {
            log.error("Error durante optimización de memoria: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia caches de la aplicación
     */
    private void clearApplicationCaches() {
        try {
            // Aquí podrías limpiar caches específicos de tu aplicación
            // Por ejemplo: Redis, Hibernate, etc.
            
            // Ejemplo genérico
            log.debug("🧹 Limpiando caches de aplicación...");
            
        } catch (Exception e) {
            log.debug("No se pudieron limpiar caches: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia archivos temporales
     */
    private void clearTempFiles() {
        try {
            // Limpiar directorio temporal del sistema
            String tempDir = System.getProperty("java.io.tmpdir");
            if (tempDir != null) {
                log.debug("🧹 Limpiando archivos temporales en: {}", tempDir);
                // Aquí podrías implementar limpieza de archivos temporales
            }
        } catch (Exception e) {
            log.debug("No se pudieron limpiar archivos temporales: {}", e.getMessage());
        }
    }
    
    /**
     * Obtiene la memoria física total del sistema
     */
    private long getTotalPhysicalMemory() {
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                return ((com.sun.management.OperatingSystemMXBean) osBean).getTotalPhysicalMemorySize();
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener memoria física total: {}", e.getMessage());
        }
        return -1;
    }
    
    /**
     * Obtiene la memoria física libre del sistema
     */
    private long getFreePhysicalMemory() {
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                return ((com.sun.management.OperatingSystemMXBean) osBean).getFreePhysicalMemorySize();
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener memoria física libre: {}", e.getMessage());
        }
        return -1;
    }
    
    /**
     * Formatea bytes en formato legible
     */
    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
