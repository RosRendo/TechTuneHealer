# Recon Map: TechTune Healer (Mobile & Web)

* **Scope:** Full-stack on-demand roadside assistance, vehicle AI diagnostics, and garage marketplace.
* **For:** Cambodian motorists, mobile mechanics, and municipal dispatchers.
* **Date:** 2026-10-12

---

## 1. Sources

| # | Source | Scope | Notes |
| :--- | :--- | :--- | :--- |
| 1 | On-Demand Telematics Standards | OSRM & WebSocket Geolocation | Sub-second coordinate streaming pattern |
| 2 | Cambodian Fintech Framework | NBC Bakong KHQR | Deep-linking and ABA Pay digital checkout |
| 3 | OBD-II & Computer Vision Literature | Diagnostic Telemetry & Fault Codes | SAE J1979 DTC fault codes |

---

## 2. Core Loop

> A stranded motorist triggers a 1-tap Emergency SOS beacon; the system streams real-time GPS coordinates via WebSockets to dispatch the closest verified mechanic, while calculating turn-by-turn OSRM routes and enabling cashless KHQR settlement.

---

## 3. Screen Inventory

| ID | Screen Name | Route / Path | Purpose | Key Components | States Handled |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S01** | HomeScreen | `/(customer)/home` | Hub for search, categories, SOS, EV pins | `SearchBar`, `ServiceGrid`, `SOSBanner`, `EVMapPins` | default, loading, location-permission |
| **S02** | EmergencyScreen | `/(customer)/emergency` | 1-tap emergency roadside dispatch | `SOSButton`, `SymptomSelector`, `CoordinateSheet` | idle, locating, broadcasting, dispatched |
| **S03** | CustomerTrackingScreen | `/(customer)/tracking` | Live mechanic approach navigation | `MapView`, `MechanicMarker`, `OSRMRoute`, `ETAStickyCard` | connecting, streaming, arrived, completed |
| **S04** | DiagnosticsScreen | `/(customer)/diagnostics` | Visual AI photo upload & symptom triage | `CameraPicker`, `FaultCodeList`, `SeverityPill` | idle, uploading, analyzing, completed |
| **S05** | GarageScreen | `/(customer)/garage` | 3D virtual twin with OBD-II telemetry | `ModelViewer`, `TelemetryGauge`, `SensorList` | connected, syncing, offline-cached |
| **S06** | ShopScreen & Cart | `/(customer)/shop` | Auto spare parts marketplace & cart | `CategoryFilter`, `ProductCard`, `CartSummary` | empty, populated, low-stock, checking-out |
| **S07** | PaymentScreen | `/(customer)/payment` | Digital checkout via Bakong KHQR | `KHQRImage`, `ABAPayDeepLink`, `CountdownTimer` | pending, scanning, verified, failed |
| **S08** | Provider Dashboard | `/(provider)/dashboard` | Operational hub & duty switch | `DutyToggle`, `MetricCards`, `SOSQueueCard` | offline, online-waiting, active-job |
| **S09** | MechanicTrackingScreen | `/(provider)/tracking` | Turn-by-turn routing & milestone actions | `ProviderMap`, `StatusStepButton`, `CallButton` | heading, arrived, in-progress, completed |
| **S10** | Admin Command Matrix | `/admin/metrics` | Municipal dispatch triage & garage verification| `KhanDistributionMap`, `SLAChart`, `VerifyButton` | live-polling, approving, filtering |

---

## 4. User Flows

```
F01 — Emergency Roadside SOS Dispatch:
    S01 -> S02 -> S03 -> S07
    Happy Path Clicks: 3
    Edge Cases: Low GPS accuracy (<10m threshold), socket disconnection retry, offline GSM phone fallback.

F02 — AI Vehicle Fault Triage:
    S01 -> S04 -> S05
    Happy Path Clicks: 2
    Edge Cases: Glare in sunlight, unclassified warning light fallback to database rules.

F03 — Workshop Booking & In-App Payment:
    S01 -> S06 -> S07
    Happy Path Clicks: 4
    Edge Cases: Stock collision race condition (handled via Prisma $transaction).
```

---

## 5. Inferred Data Model

```prisma
User             id, email, passwordHash, role (CUSTOMER, PROVIDER, ADMIN), name, phone
ServiceProvider  id, userId, shopName, latitude, longitude, approvalStatus, isVerified
Vehicle          id, userId, make, model, year, plateNumber, color
Booking          id, customerId, providerId, serviceType (STANDARD, EMERGENCY), status, totalAmount
DiagnosticReport id, vehicleId, photoUrl, severity, estimatedCost, faultCodes
Order            id, customerId, totalAmount, status (PENDING, PAID), items
```

---

## 6. Feature Matrix & Size

* **Feature Matrix:** See [`replica/features.csv`](replica/features.csv).
  - Must: **15 / 15** (100% Done)
  - Should: **6 / 6** (100% Done)
  - Could: **2 / 2** (100% Done)
* **Overall Size:** **XL** (Full-stack ecosystem: 19 React Native mobile screens + Next.js 16 operations portal + Node.js 22 Express REST & Socket.IO gateway + Prisma MariaDB/MySQL).
