# 🚗 TechTune Healer — Automotive Care, Roadside Assistance & AI Diagnostics Platform

<div align="center">

![Expo](https://img.shields.io/badge/Expo-React_Native_Mobile-000020?logo=expo)
![Next.js](https://img.shields.io/badge/Next.js-15_Admin_Portal-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-Live_GPS_Tracking-010101?logo=socket.io)
![Bakong KHQR](https://img.shields.io/badge/Bakong-KHQR_Integrated-D32F2F)
![ABA PayWay](https://img.shields.io/badge/ABA-PayWay_Integrated-003366)
![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f69220.svg?logo=pnpm)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**A full-stack on-demand automotive services marketplace and emergency breakdown platform for Cambodia. Connects car owners with verified repair workshops and mobile mechanics, featuring real-time GPS tracking, AI symptom diagnostics, and digital KHQR payments.**

[System Architecture](#-system-architecture) • [Database ERD](#-database-erd) • [Emergency Dispatch Sequence](#-emergency-dispatch--tracking-flow) • [Quick Start](#-quick-start)

</div>

---

## ⚡ Overview

**TechTune Healer** solves vehicle breakdown anxiety across Cambodian highways and cities. Drivers can instantly diagnose vehicle warning lights and odd noises via an AI symptom triaging engine, broadcast emergency roadside assistance requests to nearby verified mechanics with live GPS tracking, and complete seamless contactless payments via **Bakong KHQR** and **ABA PayWay**.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["📱 Client & Workshop Applications"]
        CustomerMobile["Customer Mobile App<br/>(Expo React Native iOS / Android)"]
        MechanicMobile["Mechanic Dispatch App<br/>(Expo Live Route & Job Queue)"]
        AdminWeb["Workshop Operations Portal<br/>(Next.js 15 Dashboard)"]
        
        CustomerMobile & MechanicMobile & AdminWeb
    end

    subgraph GatewayLayer["⚡ API Gateway & Real-Time Dispatch"]
        ExpressAPI["Express.js Modular API Gateway"]
        AuthService["JWT Authentication & RBAC Guard"]
        SocketHub["Socket.io WebSocket Server (Live GPS Streamer)"]
        
        ClientLayer <--> ExpressAPI
        CustomerMobile <-->|"Live GPS Coordinates"| SocketHub
        MechanicMobile <-->|"Real-Time Location Broadcast"| SocketHub
    end

    subgraph ServiceLayer["⚙️ Core Business & AI Engines"]
        AIDiagnostics["AI Vehicle Symptom & OBD-II Diagnostics Engine"]
        DispatchService["Roadside Emergency Dispatch & Geo-Matching"]
        BookingService["Service Booking & Workshop Schedule Manager"]
        PaymentService["Bakong KHQR & ABA PayWay Payment Gateway"]
        
        ExpressAPI --> AIDiagnostics
        ExpressAPI --> DispatchService
        ExpressAPI --> BookingService
        ExpressAPI --> PaymentService
    end

    subgraph DataLayer["💾 Persistence & Cache Layer"]
        Postgres[(PostgreSQL Relational DB)]
        PrismaClient["Prisma 6 Client"]
        RedisStore[(Redis Live GPS & Active Job Cache)]
        
        ExpressAPI <--> PrismaClient <--> Postgres
        SocketHub <--> RedisStore
    end
```

---

## 📊 Database ERD

```mermaid
erDiagram
    User ||--o{ Vehicle : owns
    User ||--o{ Booking : requests
    User ||--o{ Review : writes
    User ||--o{ DiagnosticReport : generates
    ServiceProvider ||--o{ Service : offers
    ServiceProvider ||--o{ Booking : fulfills
    ServiceProvider ||--o{ PayoutRequest : requests
    Booking ||--o{ ChatMessage : contains
    Booking ||--o{ Review : receives

    User {
        string id PK "cuid"
        string email UK
        string phone UK
        string name
        string role "CUSTOMER | MECHANIC | SHOP_OWNER | ADMIN"
        datetime createdAt
    }

    ServiceProvider {
        string id PK "cuid"
        string ownerId FK
        string businessName
        string address
        float latitude
        float longitude
        string verificationStatus "VERIFIED | PENDING | REJECTED"
        float ratingAverage
        boolean isMobileAvailable
    }

    Vehicle {
        string id PK "cuid"
        string userId FK
        string make
        string model
        int year
        string licensePlate UK
        string vinNumber
    }

    Service {
        string id PK "cuid"
        string providerId FK
        string name
        text description
        decimal price
        int estimatedDurationMinutes
        boolean isEmergency
    }

    Booking {
        string id PK "cuid"
        string customerId FK
        string providerId FK
        string serviceId FK
        string status "PENDING | ACCEPTED | EN_ROUTE | IN_PROGRESS | COMPLETED | CANCELLED"
        decimal totalAmount
        string paymentMethod "BAKONG_KHQR | ABA_PAYWAY | CASH"
        string paymentStatus "PENDING | PAID | REFUNDED"
        datetime scheduledTime
        float pickupLatitude
        float pickupLongitude
    }

    DiagnosticReport {
        string id PK "cuid"
        string userId FK
        string vehicleId FK
        text userSymptoms
        text aiAnalysis
        string severity "LOW | MEDIUM | HIGH | CRITICAL"
        json recommendedActions
        datetime createdAt
    }

    PayoutRequest {
        string id PK "cuid"
        string providerId FK
        decimal amount
        string bankAccount
        string status "PENDING | APPROVED | TRANSFERRED"
        datetime requestedAt
    }
```

---

## 🔄 Emergency Dispatch & Tracking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Driver as 🚘 Stranded Driver
    participant App as 📱 Mobile App (Expo)
    participant API as ⚡ Express Gateway
    participant AI as 🧠 AI Diagnostic Engine
    participant Socket as 📡 Socket.io GPS Hub
    actor Mechanic as 🔧 Mobile Mechanic

    Driver->>App: Describes car problem ("Overheating engine on National Highway 6")
    App->>API: POST /api/diagnostics/triage { symptoms, vehicleId }
    API->>AI: Evaluate symptom risk & fault probabilities
    AI-->>App: Diagnostic: "Coolant Leak Risk (Severity: CRITICAL) -> Request Tow/Mechanic"

    Driver->>App: Click "Request Emergency Roadside Help" (Share GPS)
    App->>API: POST /api/emergency/dispatch { lat: 13.3633, lng: 103.8564 }
    API->>Socket: Broadcast Dispatch Alert to Mechanics within 15km
    
    Mechanic->>App: Accept Job Order (ETA: 18 mins)
    Mechanic->>Socket: Stream live GPS position every 3 seconds
    Socket-->>App: Render moving mechanic icon & route map
    
    Mechanic->>Driver: Arrives on scene & repairs vehicle
    Mechanic->>App: Mark Job Completed -> Prompt Payment
    Driver->>App: Scans dynamic Bakong KHQR code
    App->>API: Confirm payment settlement
    API-->>Mechanic: 💰 Funds credited to workshop payout ledger!
```

---

## 🚀 Quick Start

### 1. Backend API Setup
```bash
cd backend
pnpm install

# Push Database Schema
pnpm prisma db push

# Start Backend (Port 5000)
pnpm run dev
```

### 2. Admin Web Portal Setup
```bash
cd ../admin-web
pnpm install
pnpm run dev
```

### 3. Mobile App Setup (Expo)
```bash
cd ..
pnpm install
pnpm start
```

---

## 📄 License
MIT License © **[Ros Rendo](https://github.com/RosRendo)**
