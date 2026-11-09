# Preflight Deployment Checklist: TechTune Healer

* **Project:** TechTune Healer
* **Date:** 2026-10-12
* **Target Platforms:** iOS (Expo / EAS), Android (APK / AAB), Web (Next.js 16)
* **Environment:** Production Readiness Gate

---

## 1. Preflight Verification Status (All Gates)

| Check Gate | Tool / Command | Required Standard | Status | Evidence / Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Frontend TypeScript Build** | `npx tsc --noEmit` | 0 errors | **PASSED** | Clean build across all React Native screens |
| **Backend TypeScript Build** | `npm --prefix backend run build` | 0 errors | **PASSED** | Transpiles cleanly via `tsc` |
| **Brand & Trademark Sweep** | `sweep.py` (`replica-brand`) | 0 competitor leaks | **PASSED** | Zero third-party brand leaks in user-facing code |
| **Store Listing Metadata** | `listing.py` (`replica-launch`) | 0 errors / 0 warnings | **PASSED** | App Store (iOS) & Google Play metadata linted |
| **Design Color Contrast** | `contrast.py` (`replica-design`) | WCAG AA / AAA | **PASSED** | High-contrast tokens validated |
| **Database Migrations** | Prisma Migrations | In sync with MariaDB | **PASSED** | 12 Prisma models validated |
| **Environment Configs** | `.env.example` & `backend/.env.example` | Complete secrets map | **PASSED** | JWT, DB, Port, and Map keys configured |

---

## 2. Store Metadata Verification

### Apple App Store
* **Name (15/30):** `TechTune Healer`
* **Subtitle (26/30):** `Smart Auto & Roadside Help`
* **Promotional Text (100/170):** `24/7 on-demand mechanic dispatch, AI vehicle diagnostics, and verified repair shops across Cambodia.`
* **Keywords (72/100):** `mechanic,car repair,towing,battery,cambodia,diagnostics,garage,emergency` (Zero wasted tokens)

### Google Play Store
* **Title (15/30):** `TechTune Healer`
* **Short Description (67/80):** `Smart vehicle diagnostics and 24/7 roadside assistance in Cambodia.`
* **Full Description (295/4000):** Formatted and free of keyword-stuffing triggers.

---

## 3. Production Deployment Next Steps
1. **Cloud VPS / Docker:** Start Node.js Express server using PM2 process manager behind an Nginx reverse proxy with TLS 1.3 certificates.
2. **EAS Build:** Run `eas build -p android --profile production` to generate signed Android `.aab` bundles.
3. **Domain & DNS:** Point apex domain `techtunehealer.com` to host server IP and set up SSL termination.
