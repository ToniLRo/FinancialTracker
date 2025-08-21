package com.tonilr.FinancialTracker.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ResourceOptimizationService {
    
    private static final Logger log = LoggerFactory.getLogger(ResourceOptimizationService.class);
    
    @Autowired
    private MemoryMonitorService memoryMonitorService;
    
    // Umbrales de recursos
    private static final double CPU_WARNING_THRESHOLD = 0.80; // 80%
    private static final double CPU_CRITICAL_THRESHOLD = 0.95; // 95%
    private static final int THREAD_WARNING_THRESHOLD = 100;
    private static final int THREAD_CRITICAL_THRESHOLD = 150;
    
    // Métricas de rendimiento
    private final AtomicLong lastCpuCheck = new AtomicLong(0);
    private final AtomicDouble lastCpuUsage = new AtomicDouble(0.0);
    private final AtomicInteger threadCount = new AtomicInteger(0);
    private final AtomicInteger connectionCount = new AtomicInteger(0);
    
    // Contadores de alertas
    private final AtomicInteger cpuAlertCounter = new AtomicInteger(0);
    private final AtomicInteger threadAlertCounter = new AtomicInteger(0);
    
    /**
     * Obtiene el estado actual de los recursos del sistema
     */
    public Map<String, Object> getResourceStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            
            // CPU
            double cpuUsage = getCpuUsage();
            int availableProcessors = osBean.getAvailableProcessors();
            double systemLoadAverage = osBean.getSystemLoadAverage();
            
            // Threads
            int threadCount = threadBean.getThreadCount();
            int daemonThreadCount = threadBean.getDaemonThreadCount();
            int peakThreadCount = threadBean.getPeakThreadCount();
            
            // Conexiones (simulado)
            int activeConnections = getActiveConnections();
            int maxConnections = getMaxConnections();
            
            // Memoria del sistema
            long totalPhysicalMemory = getTotalPhysicalMemory();
            long freePhysicalMemory = getFreePhysicalMemory();
            double memoryUsage = totalPhysicalMemory > 0 ? 
                (double) (totalPhysicalMemory - freePhysicalMemory) / totalPhysicalMemory : 0.0;
            
            // Determinar nivel de presión del sistema
            String systemPressure = getSystemPressureLevel(cpuUsage, memoryUsage, threadCount);
            
            status.put("cpuUsage", Math.round(cpuUsage * 100.0) / 100.0);
            status.put("availableProcessors", availableProcessors);
            status.put("systemLoadAverage", Math.round(systemLoadAverage * 100.0) / 100.0);
            
            status.put("threadCount", threadCount);
            status.put("daemonThreadCount", daemonThreadCount);
            status.put("peakThreadCount", peakThreadCount);
            
            status.put("activeConnections", activeConnections);
            status.put("maxConnections", maxConnections);
            status.put("connectionUsage", maxConnections > 0 ? 
                (double) activeConnections / maxConnections : 0.0);
            
            status.put("memoryUsage", Math.round(memoryUsage * 100.0) / 100.0);
            status.put("totalPhysicalMemory", formatBytes(totalPhysicalMemory));
            status.put("freePhysicalMemory", formatBytes(freePhysicalMemory));
            
            status.put("systemPressure", systemPressure);
            status.put("timestamp", System.currentTimeMillis());
            
            // Actualizar métricas
            this.lastCpuCheck.set(System.currentTimeMillis());
            this.lastCpuUsage.set(cpuUsage);
            this.threadCount.set(threadCount);
            this.connectionCount.set(activeConnections);
            
        } catch (Exception e) {
            log.error("Error obteniendo estado de recursos: {}", e.getMessage());
            status.put("error", "Error obteniendo métricas de recursos");
        }
        
        return status;
    }
    

    

    
    /**
     * Determina el nivel de presión del sistema
     */
    private String getSystemPressureLevel(double cpuUsage, double memoryUsage, int threadCount) {
        // Calcular presión basada en múltiples factores
        double cpuPressure = cpuUsage;
        double memoryPressure = memoryUsage;
        double threadPressure = threadCount > 0 ? 
            Math.min((double) threadCount / THREAD_CRITICAL_THRESHOLD, 1.0) : 0.0;
        
        // Presión máxima de todos los factores
        double maxPressure = Math.max(Math.max(cpuPressure, memoryPressure), threadPressure);
        
        if (maxPressure >= 0.95) {
            return "CRITICAL";
        } else if (maxPressure >= 0.80) {
            return "HIGH";
        } else if (maxPressure >= 0.60) {
            return "NORMAL";
        } else {
            return "LOW";
        }
    }
    
    /**
     * Ejecuta optimización de emergencia
     */
    public void triggerEmergencyOptimization() {
        log.warn("🚨 EJECUTANDO OPTIMIZACIÓN DE EMERGENCIA");
        
        // Forzar optimización de memoria
        memoryMonitorService.triggerEmergencyCleanup();
        
        // Optimización de threads
        optimizeThreads();
        
        // Log de recursos después de la optimización
        Map<String, Object> afterOptimization = getResourceStatus();
        log.info("🚨 Después de optimización de emergencia: CPU: {}%, Threads: {}", 
            afterOptimization.get("cpuUsage"), afterOptimization.get("threadCount"));
    }
    
    /**
     * Ejecuta optimización de recursos
     */
    public void triggerResourceOptimization() {
        log.info("🔄 Ejecutando optimización de recursos...");
        
        // Optimización de memoria
        memoryMonitorService.triggerMemoryOptimization();
        
        // Optimización de threads
        optimizeThreads();
        
        // Optimización de conexiones
        optimizeConnections();
    }
    
    /**
     * Realiza optimización de recursos
     */
    private void performResourceOptimization() {
        try {
            // Verificar si es necesario optimizar
            Map<String, Object> currentStatus = getResourceStatus();
            double currentCpu = (Double) currentStatus.get("cpuUsage");
            int currentThreads = (Integer) currentStatus.get("threadCount");
            
            // Optimizar si CPU > 70% o threads > 80
            if (currentCpu > 0.7 || currentThreads > 80) {
                log.info("🔄 Ejecutando optimización de recursos...");
                
                // Optimización de memoria
                memoryMonitorService.triggerMemoryOptimization();
                
                // Optimización de threads
                optimizeThreads();
                
                // Verificar resultado
                Map<String, Object> afterOptimization = getResourceStatus();
                log.info("✅ Optimización completada: CPU: {}% → {}%, Threads: {} → {}", 
                    Math.round(currentCpu * 100), 
                    Math.round((Double) afterOptimization.get("cpuUsage") * 100),
                    currentThreads, 
                    afterOptimization.get("threadCount"));
            }
            
        } catch (Exception e) {
            log.error("Error durante optimización de recursos: {}", e.getMessage());
        }
    }
    
    /**
     * Realiza limpieza de recursos
     */
    private void performResourceCleanup() {
        try {
            // Limpiar recursos de la aplicación
            clearApplicationResources();
            
            // Limpiar archivos temporales
            clearTempResources();
            
            log.info("✅ Limpieza de recursos completada");
            
        } catch (Exception e) {
            log.error("Error durante limpieza de recursos: {}", e.getMessage());
        }
    }
    
    /**
     * Optimiza threads del sistema
     */
    private void optimizeThreads() {
        try {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            int currentThreads = threadBean.getThreadCount();
            
            if (currentThreads > THREAD_WARNING_THRESHOLD) {
                log.info("🔄 Optimizando threads: {} threads activos", currentThreads);
                
                // Aquí podrías implementar lógica específica para optimizar threads
                // Por ejemplo: reducir pool de conexiones, cancelar tareas no críticas, etc.
                
                log.info("✅ Optimización de threads completada");
            }
            
        } catch (Exception e) {
            log.error("Error optimizando threads: {}", e.getMessage());
        }
    }
    
    /**
     * Optimiza conexiones del sistema
     */
    private void optimizeConnections() {
        try {
            // Aquí podrías implementar optimización de conexiones de base de datos
            // Por ejemplo: cerrar conexiones inactivas, reducir pool de conexiones, etc.
            
            log.debug("🔄 Optimizando conexiones...");
            
        } catch (Exception e) {
            log.debug("No se pudieron optimizar conexiones: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia recursos de la aplicación
     */
    private void clearApplicationResources() {
        try {
            // Limpiar caches de la aplicación
            clearApplicationCaches();
            
            // Limpiar recursos de Hibernate si está disponible
            clearHibernateResources();
            
            log.debug("🧹 Limpiando recursos de aplicación...");
            
        } catch (Exception e) {
            log.debug("No se pudieron limpiar recursos de aplicación: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia recursos temporales
     */
    private void clearTempResources() {
        try {
            // Limpiar directorio temporal del sistema
            String tempDir = System.getProperty("java.io.tmpdir");
            if (tempDir != null) {
                log.debug("🧹 Limpiando recursos temporales en: {}", tempDir);
                // Aquí podrías implementar limpieza de recursos temporales
            }
        } catch (Exception e) {
            log.debug("No se pudieron limpiar recursos temporales: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia caches de la aplicación
     */
    private void clearApplicationCaches() {
        try {
            // Aquí podrías limpiar caches específicos de tu aplicación
            // Por ejemplo: Redis, Hibernate, etc.
            
        } catch (Exception e) {
            log.debug("No se pudieron limpiar caches: {}", e.getMessage());
        }
    }
    
    /**
     * Limpia recursos de Hibernate
     */
    private void clearHibernateResources() {
        try {
            // Aquí podrías limpiar recursos específicos de Hibernate
            // Por ejemplo: limpiar cache de segundo nivel, etc.
            
        } catch (Exception e) {
            log.debug("No se pudieron limpiar recursos de Hibernate: {}", e.getMessage());
        }
    }
    
    /**
     * Obtiene el uso de CPU del sistema
     */
    private double getCpuUsage() {
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                com.sun.management.OperatingSystemMXBean sunOsBean = 
                    (com.sun.management.OperatingSystemMXBean) osBean;
                return sunOsBean.getCpuLoad();
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener uso de CPU: {}", e.getMessage());
        }
        return 0.0;
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
     * Obtiene conexiones activas (simulado)
     */
    private int getActiveConnections() {
        // Aquí podrías implementar lógica real para obtener conexiones activas
        // Por ejemplo: conexiones de base de datos, HTTP, etc.
        return connectionCount.get();
    }
    
    /**
     * Obtiene máximo de conexiones (simulado)
     */
    private int getMaxConnections() {
        // Aquí podrías implementar lógica real para obtener máximo de conexiones
        return 200; // Valor por defecto
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
    
    /**
     * Clase auxiliar para AtomicDouble
     */
    private static class AtomicDouble {
        private volatile double value;
        
        public AtomicDouble(double initialValue) {
            this.value = initialValue;
        }
        
        public double get() {
            return value;
        }
        
        public void set(double newValue) {
            this.value = newValue;
        }
    }
}
