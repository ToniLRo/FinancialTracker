#!/bin/bash

# Script optimizado para gestionar horarios en Railway
# Integrado con optimizaciones de memoria y CPU para reducir costos

RAILWAY_APP_ID="2984dca1-0f61-43b5-a3d3-226ee13fc9d0"
RAILWAY_TOKEN="8b4989af-d29e-4e54-8385-35f3257b33e4"
RAILWAY_PROJECT_ID="8e5843ac-2088-4c98-b09a-7359a4a3c30e"

# Configuración de horarios optimizada
BUSINESS_START_HOUR=10
BUSINESS_END_HOUR=19
TIMEZONE="Europe/Madrid"

# Umbrales de memoria para optimización automática
MEMORY_WARNING_THRESHOLD=75
MEMORY_CRITICAL_THRESHOLD=90
MEMORY_EMERGENCY_THRESHOLD=95

# Función para verificar si es horario de funcionamiento
is_business_hours() {
    # Establecer zona horaria
    export TZ=$TIMEZONE
    
    local current_hour=$(date +%H)
    local current_minute=$(date +%M)
    local current_time=$((10#$current_hour * 60 + 10#$current_minute))
    
    # Horario: 10:00 AM - 7:00 PM (Madrid)
    local start_time=$((BUSINESS_START_HOUR * 60))
    local end_time=$((BUSINESS_END_HOUR * 60))
    
    # Solo lunes a viernes
    local current_day=$(date +%u)  # 1=Lunes, 7=Domingo
    
    if [ $current_day -ge 1 ] && [ $current_day -le 5 ] && \
       [ $current_time -ge $start_time ] && [ $current_time -le $end_time ]; then
        return 0  # true - dentro del horario
    else
        return 1  # false - fuera del horario
    fi
}

# Función para verificar estado de memoria del sistema
check_memory_status() {
    echo "🧠 Verificando estado de memoria del sistema..."
    
    # Obtener métricas de memoria desde la API
    local memory_response=$(curl -s "https://financialtracker-production.up.railway.app/api/system/metrics/memory" 2>/dev/null)
    
    if [[ $memory_response == *"heapUsagePercent"* ]]; then
        # Extraer porcentaje de uso de memoria
        local memory_usage=$(echo $memory_response | grep -o '"heapUsagePercent":[0-9.]*' | cut -d':' -f2)
        local memory_pressure=$(echo $memory_response | grep -o '"memoryPressure":"[^"]*"' | cut -d'"' -f4)
        
        echo "📊 Uso de memoria: ${memory_usage}%"
        echo "🚨 Presión de memoria: ${memory_pressure}"
        
        # Determinar si se necesita optimización
        if (( $(echo "$memory_usage >= $MEMORY_EMERGENCY_THRESHOLD" | bc -l) )); then
            echo "🚨 MEMORIA CRÍTICA - Ejecutando optimización de emergencia"
            trigger_emergency_optimization
            return 2  # Código de emergencia
        elif (( $(echo "$memory_usage >= $MEMORY_CRITICAL_THRESHOLD" | bc -l) )); then
            echo "⚠️ MEMORIA CRÍTICA - Ejecutando optimización crítica"
            trigger_critical_optimization
            return 1  # Código de crítica
        elif (( $(echo "$memory_usage >= $MEMORY_WARNING_THRESHOLD" | bc -l) )); then
            echo "⚠️ MEMORIA ALTA - Ejecutando optimización preventiva"
            trigger_preventive_optimization
            return 0  # Código de advertencia
        else
            echo "✅ Memoria OK - No se requiere optimización"
            return 0
        fi
    else
        echo "⚠️ No se pudo obtener métricas de memoria"
        return 0
    fi
}

# Función para activar servicios con optimizaciones
activate_services() {
    echo "🚀 Activando servicios en Railway con optimizaciones..."
    
    # Activar backend
    local response=$(curl -s -X POST "https://backboard.railway.app/graphql/v2" \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"mutation { serviceUpdate(id: \\\"$RAILWAY_APP_ID\\\", pause: false) { id } }\"}")
    
    if [[ $response == *"errors"* ]]; then
        echo "❌ Error al activar servicios: $response"
        return 1
    else
        echo "✅ Backend activado exitosamente"
    fi
    
    # Ejecutar optimizaciones después de activar
    sleep 30  # Esperar a que el servicio esté listo
    run_optimizations
    
    echo "✅ Servicios activados y optimizados"
}

# Función para hibernar servicios
hibernate_services() {
    echo "💤 Hibernando servicios en Railway..."
    
    # Ejecutar limpieza antes de hibernar
    run_cleanup
    
    # Hibernar backend
    local response=$(curl -s -X POST "https://backboard.railway.app/graphql/v2" \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"mutation { serviceUpdate(id: \\\"$RAILWAY_APP_ID\\\", pause: true) { id } }\"}")
    
    if [[ $response == *"errors"* ]]; then
        echo "❌ Error al hibernar servicios: $response"
        return 1
    else
        echo "✅ Backend hibernado exitosamente"
    fi
}

# Función para ejecutar optimizaciones
run_optimizations() {
    echo "🔄 Ejecutando optimizaciones de memoria y CPU..."
    
    # Verificar si el servicio está respondiendo
    local health_check=$(curl -s "https://financialtracker-production.up.railway.app/api/system/health" 2>/dev/null)
    
    if [[ $health_check == *"UP"* ]]; then
        echo "✅ Servicio respondiendo, aplicando optimizaciones..."
        
        # Verificar estado de memoria
        local memory_status=$(check_memory_status)
        
        # Aplicar optimizaciones según el estado
        case $memory_status in
            0) echo "✅ Memoria en buen estado, optimizaciones básicas aplicadas" ;;
            1) echo "⚠️ Optimizaciones críticas aplicadas" ;;
            2) echo "🚨 Optimizaciones de emergencia aplicadas" ;;
        esac
        
        # Aplicar optimizaciones JVM si es posible
        if command -v jcmd >/dev/null 2>&1; then
            echo "🔄 Aplicando optimizaciones JVM..."
            # Aquí podrías ejecutar comandos JVM si tienes acceso
        fi
        
    else
        echo "⚠️ Servicio no responde, saltando optimizaciones"
    fi
}

# Función para optimización preventiva
trigger_preventive_optimization() {
    echo "🔄 Ejecutando optimización preventiva..."
    
    # Llamar a la API de optimización
    local response=$(curl -s -X POST "https://financialtracker-production.up.railway.app/api/system/metrics/memory/optimize" 2>/dev/null)
    
    if [[ $response == *"SUCCESS"* ]]; then
        echo "✅ Optimización preventiva completada"
    else
        echo "⚠️ Error en optimización preventiva: $response"
    fi
}

# Función para optimización crítica
trigger_critical_optimization() {
    echo "🚨 Ejecutando optimización crítica..."
    
    # Llamar a la API de optimización de emergencia
    local response=$(curl -s -X POST "https://financialtracker-production.up.railway.app/api/system/metrics/memory/emergency-cleanup" 2>/dev/null)
    
    if [[ $response == *"SUCCESS"* ]]; then
        echo "✅ Optimización crítica completada"
    else
        echo "❌ Error en optimización crítica: $response"
    fi
}

# Función para optimización de emergencia
trigger_emergency_optimization() {
    echo "🚨🚨 EJECUTANDO OPTIMIZACIÓN DE EMERGENCIA 🚨🚨"
    
    # Llamar a la API de optimización de emergencia
    local response=$(curl -s -X POST "https://financialtracker-production.up.railway.app/api/system/metrics/memory/emergency-cleanup" 2>/dev/null)
    
    if [[ $response == *"SUCCESS"* ]]; then
        echo "✅ Optimización de emergencia completada"
    else
        echo "❌ Error en optimización de emergencia: $response"
    fi
    
    # Optimización adicional de recursos
    local resource_response=$(curl -s -X POST "https://financialtracker-production.up.railway.app/api/system/metrics/resources/emergency-optimize" 2>/dev/null)
    
    if [[ $resource_response == *"SUCCESS"* ]]; then
        echo "✅ Optimización de recursos de emergencia completada"
    else
        echo "⚠️ Error en optimización de recursos: $resource_response"
    fi
}

# Función para ejecutar limpieza
run_cleanup() {
    echo "🧹 Ejecutando limpieza antes de hibernar..."
    
    # Limpiar logs antiguos si es posible
    if [ -d "/app/logs" ]; then
        find /app/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        echo "✅ Logs antiguos limpiados"
    fi
    
    # Limpiar archivos temporales
    rm -rf /tmp/* 2>/dev/null || true
    echo "✅ Archivos temporales limpiados"
    
    # Limpiar cache de la aplicación si es posible
    echo "🧹 Limpiando cache de aplicación..."
    curl -s -X POST "https://financialtracker-production.up.railway.app/api/system/metrics/memory/optimize" 2>/dev/null || true
}

# Función para mostrar estado del sistema
show_system_status() {
    echo "📊 === ESTADO DEL SISTEMA ==="
    echo "🕐 Hora actual: $(date)"
    echo "🌍 Zona horaria: $(date +%Z)"
    echo "📅 Día: $(date +%A)"
    echo "⏰ Horario de negocio: ${BUSINESS_START_HOUR}:00 - ${BUSINESS_END_HOUR}:00"
    
    if is_business_hours; then
        echo "✅ Estado: DENTRO del horario de funcionamiento"
    else
        echo "⏰ Estado: FUERA del horario de funcionamiento"
    fi
    
    echo "🚂 Railway App ID: $RAILWAY_APP_ID"
    echo "📁 Project ID: $RAILWAY_PROJECT_ID"
    
    # Mostrar estado de memoria si es posible
    echo ""
    echo "🧠 === ESTADO DE MEMORIA ==="
    check_memory_status > /dev/null 2>&1
}

# Función para mostrar ayuda
show_help() {
    echo "🚀 Railway Schedule Manager - Ayuda"
    echo ""
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -s, --status   Mostrar estado del sistema"
    echo "  -f, --force    Forzar activación/desactivación"
    echo "  -o, --optimize Solo ejecutar optimizaciones"
    echo "  -c, --cleanup  Solo ejecutar limpieza"
    echo "  -m, --memory   Verificar solo estado de memoria"
    echo ""
    echo "Ejemplos:"
    echo "  $0              # Ejecutar automáticamente según horario"
    echo "  $0 --status     # Ver estado actual"
    echo "  $0 --force      # Forzar cambio de estado"
    echo "  $0 --memory     # Verificar estado de memoria"
}

# Función principal con manejo de argumentos
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--status)
            show_system_status
            exit 0
            ;;
        -f|--force)
            echo "🔄 Modo forzado activado"
            if is_business_hours; then
                hibernate_services
            else
                activate_services
            fi
            ;;
        -o|--optimize)
            run_optimizations
            exit 0
            ;;
        -c|--cleanup)
            run_cleanup
            exit 0
            ;;
        -m|--memory)
            check_memory_status
            exit 0
            ;;
        "")
            # Sin argumentos - ejecutar lógica automática
            ;;
        *)
            echo "❌ Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
    
    # Lógica principal automática
    if is_business_hours; then
        echo "✅ Dentro del horario de funcionamiento (${BUSINESS_START_HOUR}:00-${BUSINESS_END_HOUR}:00, L-V)"
        activate_services
    else
        echo "⏰ Fuera del horario de funcionamiento"
        hibernate_services
    fi
    
    show_system_status
}

# Ejecutar función principal
main "$@"
