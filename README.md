# 💰 FinancialTracker - Sistema de Seguimiento Financiero

Una aplicación completa de gestión financiera desarrollada con **Angular 20** y **Spring Boot 3**, que permite a los usuarios gestionar sus finanzas personales, realizar seguimiento de gastos, administrar múltiples cuentas y monitorear su salud financiera de manera eficiente.

## 🌐 Demo en Vivo

**🔗 [Ver aplicación en Netlify](https://financialtracker-tonilr.netlify.app/)**

## ✨ Características Principales

### 👤 Gestión de Usuarios
- 🔐 Registro e inicio de sesión seguro
- 👤 Perfiles de usuario completos
- 🔒 Autenticación JWT
- 🔑 Recuperación y cambio de contraseña
- ⚙️ Configuración de preferencias

### 💳 Gestión de Cuentas
- 🏦 Múltiples cuentas bancarias
- 💰 Diferentes tipos de cuenta (Ahorro, Corriente, Inversión)
- 📊 Saldos en tiempo real
- 🔄 Sincronización automática
- 📈 Historial de movimientos

### 💸 Control de Transacciones
- 📝 Registro de ingresos y gastos
- 🏷️ Categorización de transacciones
- 📅 Fechas y recordatorios
- 🔍 Búsqueda y filtros avanzados
- 📊 Estadísticas detalladas

### 📊 Dashboard Financiero
- 📈 Gráficos de gastos por categoría
- 💹 Tendencias de ingresos vs gastos
- 🎯 Metas financieras
- 📊 Análisis de presupuesto
- 📱 Diseño responsive

### 🔔 Sistema de Notificaciones
- ⏰ Recordatorios de pagos
- 📧 Alertas por email
- 💡 Consejos financieros
- 📊 Resúmenes mensuales

### 🛡️ Seguridad y Privacidad
- 🔐 Encriptación de datos sensibles
- 🚪 Protección de rutas
- 👤 Gestión de sesiones
- 🔒 Cumplimiento de estándares de seguridad

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 20** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Bootstrap 5** - Framework CSS
- **Angular Material** - Componentes UI
- **FontAwesome** - Iconografía
- **GSAP** - Animaciones
- **Swiper** - Carruseles
- **ngx-toastr** - Notificaciones

### Backend
- **Spring Boot 3.3.2** - Framework Java
- **Spring Security** - Autenticación y autorización
- **Spring Data JPA** - Persistencia de datos
- **PostgreSQL** - Base de datos
- **JWT** - Tokens de autenticación
- **Spring Security Crypto** - Encriptación

### DevOps
- **Netlify** - Despliegue frontend
- **Railway** - Despliegue backend
- **GitHub** - Control de versiones

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- Java 17 o superior
- PostgreSQL 13 o superior
- Maven 3.6 o superior

### Frontend (Angular)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/financial-tracker.git
cd financial-tracker/FinancialTrackerFrontEndAngular

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build
```

### Backend (Spring Boot)

```bash
# Navegar al directorio del backend
cd ../FinancialTrackerBackEndSpringBoot

# Configurar base de datos PostgreSQL
# Crear archivo src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/financialtracker
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password

# Ejecutar la aplicación
./mvnw spring-boot:run
```

## 📁 Estructura del Proyecto

```
FinancialTracker/
├── FinancialTrackerFrontEndAngular/     # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/             # Componentes Angular
│   │   │   │   ├── home/               # Página principal
│   │   │   │   ├── log-in/             # Inicio de sesión
│   │   │   │   ├── sign-up/            # Registro
│   │   │   │   ├── my-wallets/         # Mis carteras
│   │   │   │   ├── payments/           # Pagos
│   │   │   │   ├── profile/            # Perfil de usuario
│   │   │   │   ├── settings/           # Configuración
│   │   │   │   ├── navbar/             # Navegación
│   │   │   │   ├── forgot-password/    # Olvidé contraseña
│   │   │   │   └── reset-password/     # Resetear contraseña
│   │   │   ├── models/                  # Interfaces TypeScript
│   │   │   │   ├── User/                # Modelo de usuario
│   │   │   │   ├── account/             # Modelo de cuenta
│   │   │   │   ├── Transaction/         # Modelo de transacción
│   │   │   │   ├── card/                # Modelo de tarjeta
│   │   │   │   └── account-type/        # Tipos de cuenta
│   │   │   ├── services/                # Servicios
│   │   │   └── shared/                  # Componentes compartidos
│   │   └── environments/                # Configuraciones de entorno
│   └── package.json
├── FinancialTrackerBackEndSpringBoot/   # Backend Spring Boot
│   ├── src/main/java/
│   │   └── com/tonilr/FinancialTracker/
│   │       ├── Controller/              # Controladores REST
│   │       ├── Service/                 # Lógica de negocio
│   │       ├── Repository/              # Acceso a datos
│   │       ├── Model/                   # Entidades JPA
│   │       └── Security/                # Configuración de seguridad
│   └── pom.xml
├── mockups/                              # Diseños y mockups
└── README.md
```

## 🔧 Configuración de Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE financialtracker;

-- Las tablas se crearán automáticamente con JPA
```

## 🌍 Variables de Entorno

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Backend (application.properties)
```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/financialtracker
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password

# JWT
app.jwtSecret=tu_jwt_secret
app.jwtExpirationInMs=86400000

# Servidor
server.port=8080

# Seguridad
spring.security.crypto.algorithm=BCrypt
```

## 🧪 Testing

### Frontend
```bash
cd FinancialTrackerFrontEndAngular
npm test
```

### Backend
```bash
cd FinancialTrackerBackEndSpringBoot
./mvnw test
```

## 📦 Despliegue

### Frontend (Netlify)
1. Conectar repositorio GitHub a Netlify
2. Configurar build settings:
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/financial-tracker`
3. Configurar variables de entorno en Netlify

### Backend (Railway)
1. Conectar repositorio GitHub a Railway
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🎨 Diseño y UX

- **Diseño Responsive**: Adaptable a todos los dispositivos
- **Interfaz Intuitiva**: Navegación clara y fácil de usar
- **Animaciones Suaves**: Transiciones fluidas con GSAP
- **Iconografía Clara**: FontAwesome para mejor comprensión
- **Paleta de Colores**: Esquema profesional y confiable

## 🔐 Características de Seguridad

- **Autenticación JWT**: Tokens seguros y renovables
- **Encriptación BCrypt**: Contraseñas protegidas
- **Validación de Entrada**: Prevención de ataques
- **CORS Configurado**: Seguridad en comunicación
- **Headers de Seguridad**: Protección adicional

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Toni Lupiañez Roman**
- GitHub: [@ToniLRo](https://github.com/ToniLRo)
- LinkedIn: [Toni Lupiañez Roman](https://www.linkedin.com/in/toni-lupia%C3%B1ez-roman-4a8024202/)

## 🙏 Agradecimientos

- [Angular](https://angular.io/) - Framework frontend
- [Spring Boot](https://spring.io/projects/spring-boot) - Framework backend
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [Angular Material](https://material.angular.io/) - Componentes UI
- [FontAwesome](https://fontawesome.com/) - Iconografía
- [GSAP](https://greensock.com/gsap/) - Animaciones
- [Netlify](https://www.netlify.com/) - Hosting frontend
- [Railway](https://railway.app/) - Hosting backend

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!**
