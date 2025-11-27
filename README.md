✈️ PDFly - Enterprise PDF SaaS Platform

PDFly is a scalable, high-performance Micro-SaaS application designed for secure and efficient PDF manipulation. Built with a modern React frontend and a robust Java Spring Boot backend, it offers enterprise-grade document processing capabilities including merging, splitting, compression, and conversion.

📖 Table of Contents

Executive Summary

Key Features

System Architecture

Technology Stack

Getting Started

Prerequisites

Frontend Setup

Backend Setup

Configuration & Secrets

Admin Portal

Roadmap

License

📋 Executive Summary

PDFly bridges the gap between complex desktop PDF software and accessible web tools. It provides a "freemium" business model where users can perform basic tasks for free (with rate limiting) or upgrade to a Pro tier for unlimited access and advanced features like OCR and high-compression algorithms.

The platform is engineered for horizontal scalability, utilizing Docker containers for deployment on cloud platforms like Render or AWS.

🌟 Key Features

🎨 Frontend (User Experience)

Glassmorphism UI: A modern, high-end interface built with Tailwind CSS and Framer Motion for fluid interactions.

13+ PDF Tools: Comprehensive suite including Merge, Split, Compress, Convert (Word/Excel/PPT), Watermark, and Security.

Smart Rate Limiting: Client-side logic enforces a "1 Free Tool per 24 Hours" policy using LocalStorage, driving conversion to paid plans.

Dark Mode: Fully responsive theme support (System/Light/Dark) using next-themes.

E-Commerce Flow: Integrated Pricing and Checkout pages with Coupon Code logic simulation.

🛡️ Backend (Core Engine)

Secure Authentication: Stateless architecture using Spring Security and JWT (JSON Web Tokens).

Passwordless Entry: "Magic Link" style access where passwords/keys are generated and emailed to users via SMTP.

PDF Processing Engine: powered by Apache PDFBox, handling binary file streams efficiently in memory (optimized for cloud constraints).

Role-Based Access Control (RBAC): Strict separation between USER and ADMIN roles.

📊 Admin Command Center

A dedicated portal for business operations:

Live Dashboard: Real-time visualization of Revenue, Active Users, and Traffic.

DevOps Monitoring: Live tracking of JVM Heap Memory and Disk Usage to prevent OOM errors on free-tier cloud instances.

User & Plan Management: CRM-style interfaces to ban users, upgrade plans, and configure tier limits dynamically.

🏗 System Architecture

The application follows a Monolithic Service-Oriented Architecture designed for easy containerization.

graph TD
    Client[React Frontend (Vite)] -->|REST API / JSON| LB[Load Balancer / Nginx]
    LB --> API[Java Spring Boot API]
    API -->|Auth| Security[Spring Security / JWT]
    API -->|Data| DB[(PostgreSQL Database)]
    API -->|Files| PDFEngine[Apache PDFBox]
    API -->|Email| SMTP[Gmail SMTP Server]


🛠 Technology Stack

Layer

Technology

Description

Frontend

React 18, Vite

High-performance SPA framework.

Styling

Tailwind CSS v3

Utility-first CSS for rapid UI development.

UI Components

Lucide React, Radix

Accessible icons and primitives.

Visuals

Framer Motion, Recharts

Animations and Data Visualization.

Backend

Java 17 (LTS)

Core language for business logic.

Framework

Spring Boot 3.2

Application framework and DI container.

Database

PostgreSQL

Relational database for Users, Transactions, and Logs.

ORM

Spring Data JPA

Hibernate-based data abstraction.

PDF Engine

Apache PDFBox 2.0

Open-source Java library for working with PDF documents.

DevOps

Docker

Containerization for consistent deployment.

🚀 Getting Started

Follow these instructions to set up the project locally for development.

Prerequisites

Node.js (v18 or higher)

Java JDK (v17 or higher)

PostgreSQL (Local instance or Cloud URL)

Maven (Optional, wrapper included)

Frontend Setup

Navigate to the frontend directory:

cd pdf-wiz-frontend


Install dependencies:

npm install


Start the development server:

npm run dev


Access the UI at http://localhost:5173

Backend Setup

Navigate to the backend directory:

cd pdf-wiz-backend


Update src/main/resources/application.properties with your database credentials (see Configuration section).

Run the application:

./mvnw spring-boot:run


Server will start on http://localhost:8080

🔑 Configuration & Secrets

To ensure security and functionality, the backend requires specific environment variables or property configurations.

File: src/main/resources/application.properties

Variable

Description

Example / Value

spring.datasource.url

Database Connection String

jdbc:postgresql://localhost:5432/pdfly_db

spring.datasource.username

DB User

postgres

spring.datasource.password

DB Password

******

jwt.secret

Token Signing Key

5367566B59703373367639792F423F45...

jwt.expiration

Token Validity

86400000 (24 hours)

spring.mail.password

SMTP App Password

abcd efgh ijkl mnop (Google App Password)

👮 Admin Portal

The Admin Portal is restricted to users with the ROLE_ADMIN authority. It includes specialized tools for managing the SaaS business.

URL: /admin

Default Features:

System Health: Monitor JVM memory to optimize Render/Heroku free tier usage.

Feature Flags: Enable/Disable specific PDF tools (e.g., disable "Compression" during high load).

Financials: Track mocked revenue and transaction history.

🗺 Roadmap

[x] Phase 1: Core UI & Auth Flow (Completed)

[ ] Phase 2: Backend Implementation (In Progress)

Implement PDFBox services for Merge/Split.

Connect User/Auth Registration to PostgreSQL.

[ ] Phase 3: Cloud Deployment

Dockerize Spring Boot application.

Deploy Frontend to Vercel / Backend to Render.

[ ] Phase 4: Advanced Features

OCR integration (Tesseract).

Cloud Storage (AWS S3) for file persistence.

📄 License

Copyright © 2025 PDFly Inc. All rights reserved.
This project is proprietary software. Unauthorized copying of these files via any medium is strictly prohibited.