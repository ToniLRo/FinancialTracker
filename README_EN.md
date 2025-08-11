# 💰 FinancialTracker - Financial Tracking System

A complete financial management application developed with **Angular 20** and **Spring Boot 3**, that allows users to manage their personal finances, track expenses, manage multiple accounts, and monitor their financial health efficiently.

## 🌐 Live Demo

**🔗 [View application on Netlify](https://financialtracker-tonilr.netlify.app/)**

## ✨ Main Features

### 👤 User Management
- 🔐 Secure registration and login
- 👤 Complete user profiles
- 🔒 JWT authentication
- 🔑 Password recovery and change
- ⚙️ Preference configuration

### 💳 Account Management
- 🏦 Multiple bank accounts
- 💰 Different account types (Savings, Checking, Investment)
- 📊 Real-time balances
- 🔄 Automatic synchronization
- 📈 Transaction history

### 💸 Transaction Control
- 📝 Income and expense recording
- 🏷️ Transaction categorization
- 📅 Dates and reminders
- 🔍 Advanced search and filters
- 📊 Detailed statistics

### 📊 Financial Dashboard
- 📈 Expense charts by category
- 💹 Income vs expense trends
- 🎯 Financial goals
- 📊 Budget analysis
- 📱 Responsive design

### 🔔 Notification System
- ⏰ Payment reminders
- 📧 Email alerts
- 💡 Financial tips
- 📊 Monthly summaries

### 🛡️ Security and Privacy
- 🔐 Sensitive data encryption
- 🚪 Route protection
- 👤 Session management
- 🔒 Security standards compliance

## 🛠️ Technologies Used

### Frontend
- **Angular 20** - Main framework
- **TypeScript** - Programming language
- **Bootstrap 5** - CSS framework
- **Angular Material** - UI components
- **FontAwesome** - Iconography
- **GSAP** - Animations
- **Swiper** - Carousels
- **ngx-toastr** - Notifications

### Backend
- **Spring Boot 3.3.2** - Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **Spring Security Crypto** - Encryption

### DevOps
- **Netlify** - Frontend deployment
- **Railway** - Backend deployment
- **GitHub** - Version control

## 🚀 Installation and Setup

### Prerequisites
- Node.js 18 or higher
- Java 17 or higher
- PostgreSQL 13 or higher
- Maven 3.6 or higher

### Frontend (Angular)

```bash
# Clone the repository
git clone https://github.com/your-username/financial-tracker.git
cd financial-tracker/FinancialTrackerFrontEndAngular

# Install dependencies
npm install

# Configure environment variables
# Create file src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};

# Run in development mode
npm start

# Build for production
npm run build
```

### Backend (Spring Boot)

```bash
# Navigate to backend directory
cd ../FinancialTrackerBackEndSpringBoot

# Configure PostgreSQL database
# Create file src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/financialtracker
spring.datasource.username=your_username
spring.datasource.password=your_password

# Run the application
./mvnw spring-boot:run
```

## 📁 Project Structure

```
FinancialTracker/
├── FinancialTrackerFrontEndAngular/     # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/             # Angular Components
│   │   │   │   ├── home/               # Home page
│   │   │   │   ├── log-in/             # Login
│   │   │   │   ├── sign-up/            # Registration
│   │   │   │   ├── my-wallets/         # My wallets
│   │   │   │   ├── payments/           # Payments
│   │   │   │   ├── profile/            # User profile
│   │   │   │   ├── settings/           # Settings
│   │   │   │   ├── navbar/             # Navigation
│   │   │   │   ├── forgot-password/    # Forgot password
│   │   │   │   └── reset-password/     # Reset password
│   │   │   ├── models/                  # TypeScript Interfaces
│   │   │   │   ├── User/                # User model
│   │   │   │   ├── account/             # Account model
│   │   │   │   ├── Transaction/         # Transaction model
│   │   │   │   ├── card/                # Card model
│   │   │   │   └── account-type/        # Account types
│   │   │   ├── services/                # Services
│   │   │   └── shared/                  # Shared components
│   │   └── environments/                # Environment configurations
│   └── package.json
├── FinancialTrackerBackEndSpringBoot/   # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/tonilr/FinancialTracker/
│   │       ├── Controller/              # REST controllers
│   │       ├── Service/                 # Business logic
│   │       ├── Repository/              # Data access
│   │       ├── Model/                   # JPA entities
│   │       └── Security/                # Security configuration
│   └── pom.xml
├── mockups/                              # Designs and mockups
└── README.md
```

## 🔧 Database Configuration

```sql
-- Create database
CREATE DATABASE financialtracker;

-- Tables will be created automatically with JPA
```

## 🌍 Environment Variables

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/financialtracker
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
app.jwtSecret=your_jwt_secret
app.jwtExpirationInMs=86400000

# Server
server.port=8080

# Security
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

## 📦 Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/financial-tracker`
3. Configure environment variables in Netlify

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Configure environment variables
3. Automatic deployment on each push

## 🎨 Design and UX

- **Responsive Design**: Adaptable to all devices
- **Intuitive Interface**: Clear and easy-to-use navigation
- **Smooth Animations**: Fluid transitions with GSAP
- **Clear Iconography**: FontAwesome for better understanding
- **Color Palette**: Professional and trustworthy scheme

## 🔐 Security Features

- **JWT Authentication**: Secure and renewable tokens
- **BCrypt Encryption**: Protected passwords
- **Input Validation**: Attack prevention
- **CORS Configured**: Communication security
- **Security Headers**: Additional protection

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 👨‍💻 Author

**Toni Lupiañez Roman**
- GitHub: [@ToniLRo](https://github.com/ToniLRo)
- LinkedIn: [Toni Lupiañez Roman](https://www.linkedin.com/in/toni-lupia%C3%B1ez-roman-4a8024202/)

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - Frontend framework
- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [Angular Material](https://material.angular.io/) - UI components
- [FontAwesome](https://fontawesome.com/) - Iconography
- [GSAP](https://greensock.com/gsap/) - Animations
- [Netlify](https://www.netlify.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting

---

⭐ **If you like this project, give it a star on GitHub!**
