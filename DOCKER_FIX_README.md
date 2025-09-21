# Solución para el problema de loading infinito en Docker

## Problema identificado
El componente `payments` mostraba un loading infinito cuando se ejecutaba en Docker porque:
- El frontend estaba compilado con `environment.ts` que apunta a `http://localhost:8080`
- En Docker, el backend está en el contenedor `miapp_backend` y es accesible desde el host en `localhost:8080`
- Sin embargo, el frontend compilado no podía acceder correctamente a la API

## Solución implementada

### 1. Archivo de environment específico para Docker
Se creó `src/environments/environment.docker.ts` con la configuración correcta:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080', // El backend está expuesto en el puerto 8080 del host
  twelvedataApiKey: 'b18b371800b24fceb2f2439b2e6c1c60',
  exchangerateApiKey: '6ef67e7d3c6e02e659707acc'
};
```

### 2. Configuración de Angular
Se actualizó `angular.json` para incluir una configuración de build específica para Docker:
- Configuración `docker` en la sección `build`
- Configuración `docker` en la sección `serve`

### 3. Dockerfile actualizado
Se modificó el Dockerfile para usar la configuración de Docker:
```dockerfile
RUN npm run build --configuration=docker
```

## Cómo aplicar la solución

### Opción 1: Scripts automáticos
```bash
# En Windows
rebuild-docker.bat

# En Linux/Mac
./rebuild-docker.sh
```

### Opción 2: Comandos manuales
```bash
# Detener contenedores existentes
docker-compose down

# Eliminar imágenes para forzar reconstrucción
docker rmi financialtracker_frontend
docker rmi financialtracker_backend

# Reconstruir y ejecutar
docker-compose up --build
```

## Verificación
Después de aplicar la solución:
1. El frontend debería cargar correctamente en `http://localhost:4200`
2. El componente payments debería mostrar las transacciones sin loading infinito
3. Los logs deberían mostrar la carga exitosa de datos

## Archivos modificados
- `src/environments/environment.docker.ts` (nuevo)
- `angular.json` (modificado)
- `Dockerfile` (modificado)
- `rebuild-docker.sh` (nuevo)
- `rebuild-docker.bat` (nuevo)
