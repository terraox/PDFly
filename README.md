# ✈️ PDFly - Enterprise PDF SaaS Platform

PDFly is a scalable, high-performance Micro-SaaS application designed for secure and efficient PDF manipulation. Built with a modern **React** frontend and a robust **Java Spring Boot** backend, it offers enterprise-grade document processing capabilities including merging, splitting, compression, conversion (Word/Excel/PPT), and security tools.

The platform operates on a **Freemium** business model, offering essential tools for free with daily usage limits, while incentivizing upgrades to the **Pro** tier for unlimited access and advanced features.

---

## 🌟 Key Features

### 🎨 Frontend (User Experience)
- **Premium UI/UX**: A modern, high-end interface built with **Tailwind CSS** and **Framer Motion**. Features "Magic UI" components like `RainbowButton`, `ShineBorder`, and `NumberTicker` for a polished feel.
- **15+ PDF Tools**: Comprehensive suite including Merge, Split, Compress, Convert (Word/Excel/PPT/JPG), Watermark, Sign, Protect, and Unlock.
- **Smart Rate Limiting**: Enforces a **3 Free Tasks per Day** policy for free users, with visual countdowns and "Limit Reached" prompts.
- **Interactive Pricing**: Animated pricing page with counting numbers to drive conversions.
- **Dark Mode**: Fully responsive theme support (System/Light/Dark) using `next-themes`.
- **Real-time Feedback**: Toast notifications and smooth loading states for all operations.

### 🛡️ Backend (Core Engine)
- **Secure Authentication**: Stateless architecture using **Spring Security** and **JWT** (JSON Web Tokens).
- **Passwordless Entry**: "Magic Link" style access where secure keys are emailed to users via **JavaMail**.
- **Robust PDF Engine**: Powered by **Apache PDFBox** and **Apache POI**, handling complex document manipulations efficiently in memory.
- **Daily Usage Reset**: Automated scheduled tasks (`@Scheduled`) reset user limits daily.
- **Role-Based Access Control (RBAC)**: Strict separation between `USER` and `ADMIN` roles.
- **HTML Emails**: Beautifully styled transactional emails for welcome messages and password resets.

### 📊 Admin Command Center
- **Live Dashboard**: Real-time visualization of system health and user activity.
- **Feature Flags**: Dynamic control to enable/disable specific tools (e.g., "Disable Compression") or signups globally.
- **User Management**: CRM-style interface to view users, manage plans, and monitor usage.

---

## 🏗 System Architecture & Code Patterns

The application follows a **Monolithic Service-Oriented Architecture** designed for maintainability and easy containerization.

### Backend Patterns (Spring Boot)
- **Controller-Service-Repository**: Separation of concerns.
    - **Controllers** (`/controller`): Handle HTTP requests, input validation, and response formatting.
    - **Services** (`/service`): Contain business logic (e.g., `PdfToolService` for file processing, `UsageResetService` for scheduling).
    - **Repositories** (`/repository`): Interface with PostgreSQL via Spring Data JPA.
- **DTOs**: Data Transfer Objects used for type-safe communication between frontend and backend (e.g., `AuthResponse`, `LoginRequest`).
- **Global Configuration**: System-wide settings stored in the database for dynamic runtime adjustments.

### Frontend Patterns (React)
- **Context API**: Global state management for Authentication (`AuthContext`), Toast Notifications (`ToastContext`), and User History (`HistoryContext`).
- **Component-Based Design**: Reusable UI components (`/components/ui`) like Modals, Buttons, and Inputs.
- **Layout Wrapper**: `Navbar` and `Footer` integrated into the main layout for consistent navigation.

---

## 🛠 Technology Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 18** | High-performance SPA library |
| **Vite** | Next-generation frontend tooling |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Production-ready animation library |
| **Axios** | Promise-based HTTP client |
| **Lucide React** | Beautiful & consistent icon set |
| **React Dropzone** | Drag-and-drop file handling |

### Backend
| Technology | Description |
| :--- | :--- |
| **Java 17 (LTS)** | Core programming language |
| **Spring Boot 3.2** | Application framework |
| **Spring Security** | Authentication & Access Control |
| **Spring Data JPA** | Hibernate-based ORM |
| **PostgreSQL** | Relational Database |
| **Apache PDFBox** | PDF manipulation engine |
| **Apache POI** | Microsoft Office document conversion |
| **Lombok** | Boilerplate code reduction |

---

## 📂 Project Structure

```
proj/
├── pdf-wiz-backend/          # Spring Boot Application
│   ├── src/main/java/com/pdfly/backend/
│   │   ├── controller/       # REST API Endpoints
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA Entities (User, GlobalConfig)
│   │   ├── repository/       # Database Interfaces
│   │   ├── service/          # Business Logic (PdfToolService, EmailService)
│   │   └── config/           # Security & App Config
│   └── pom.xml               # Maven Dependencies
│
├── pdf-wiz-frontend/         # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   │   └── ui/           # Magic UI & Base Elements
│   │   ├── context/          # Global State (Auth, Toast)
│   │   ├── pages/            # Page Views (ToolPage, Login, Admin)
│   │   └── lib/              # Utilities (Tailwind merge, etc.)
│   └── package.json          # NPM Dependencies
│
└── README.md                 # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Java JDK** (v17+)
- **PostgreSQL** (Local or Cloud)

### 1. Backend Setup
```bash
cd pdf-wiz-backend

# Configure Database in src/main/resources/application.properties
# spring.datasource.url=jdbc:postgresql://localhost:5432/pdfly_db
# spring.datasource.username=postgres
# spring.datasource.password=your_password

# Run the application
./mvnw spring-boot:run
```
*Server starts on `http://localhost:8080`*

### 2. Frontend Setup
```bash
cd pdf-wiz-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*UI accessible at `http://localhost:5173`*

---

## 🔑 Configuration

The backend `application.properties` requires the following configurations:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `spring.datasource.url` | DB Connection | `jdbc:postgresql://localhost:5432/pdfly_db` |
| `jwt.secret` | Token Signing Key | `5367566B59...` (Base64 encoded) |
| `spring.mail.password` | SMTP Password | Google App Password |

---

## 📄 License
Copyright © 2025 PDFly Inc. All rights reserved.