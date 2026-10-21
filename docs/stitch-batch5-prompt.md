# TechTune Healer — Stitch Prompt (Batch 5: Provider / Mechanic Business Cockpit)

**Platform**: iOS & Android Mobile App (React Native / Expo)
**Target**: Google Stitch (Generates 4 Screens)
**Aesthetic Style**: Modern Business Marketplace (Clean, Trustworthy, Professional — Uber Driver × Grab Driver × Square). Crisp white cards, light slate gray background (#F8FAFC), deep navy typography (#0F172A), royal blue accents (#1E40AF / #2563EB), emerald green (#10B981) for Online status and revenue metrics. Zero cyberpunk or neon sci-fi.

---

## 📱 The 4 Screens to Generate

### Screen 17: Provider Operating Dashboard & Status Cockpit
- **Top Header**:
  - Workshop avatar & name: "Bona Motors & Care (Lead Tech: Dara Chan)".
  - Large Availability Toggle Pill: [🟢 ONLINE - Accepting Jobs (Selected)] / [🔴 GO OFFLINE].
  - Notification bell with job dispatch badge.
- **Today's Performance Metrics (4 Grid Tiles)**:
  - Tile 1 (Today's Earnings): Icon 💵 • ".50" • Subtext: "+18% vs yesterday".
  - Tile 2 (Completed Jobs): Icon 🔧 • "4 Jobs" • Subtext: "Avg. 38 mins/job".
  - Tile 3 (Acceptance Rate): Icon 🎯 • "98%" • Subtext: "Top 5% provider".
  - Tile 4 (Customer Rating): Icon ⭐ • "4.96" • Subtext: "142 reviews".
- **Live Activity Radar Map (Middle Section)**:
  - Clean daylight map showing current mechanic location and subtle yellow demand heatzones around Phnom Penh.
  - Floating pill: "High Demand Area: 6 active breakdown requests nearby".
- **Upcoming Scheduled Appointments Queue (Bottom List)**:
  - Appointment Card 1:
    • Customer: "Sokha V." • "General Brake Inspection" • Time: "02:00 PM (In 45 mins)".
    • Vehicle: "2020 Honda Civic" • Service type: "[Drive-In at Workshop]".
    • Payout: ".00" • "[Start Job]" button.

---

### Screen 18: Incoming Emergency Dispatch Alert (Accept / Decline Modal)
- **Modal Context**: High-urgency white dispatch overlay card with rounded corners.
- **Top Urgency Indicator**:
  - Central 30-second circular countdown ring with ticking timer: "00:24".
  - Alert Title: "⚡ Urgent Roadside Dispatch Request".
- **Payout & Distance Highlight Card**:
  - Prominent Earnings: ".00 (Net Payout)".
  - Estimated Distance & Time: "1.4 km away (Est. 5-7 mins drive)".
- **Incident & Vehicle Details Card**:
  - Service Requested: "Emergency Battery Jumpstart & Diagnostic".
  - Incident Location: "Russian Blvd (Near Pochentong Flyover)".
  - Customer Vehicle: "2021 Toyota Hilux Revo (Plate: 2BB-1234)".
  - Customer Note: *"Car won't crank. Rapid clicking sound from starter."*
- **Action Buttons**:
  - Primary Full-Width Swipe Bar: "Swipe to Accept Dispatch ➔" (Emerald Green #10B981 handle with vibration haptic).
  - Secondary Outline Button: "[Decline Request (Pass to Next Unit)]".

---

### Screen 19: Mechanic Active Job Execution & Navigation
- **Fullscreen Navigation Map**:
  - Real-time GPS street routing with highlighted blue turn-by-turn path.
  - Mechanic truck icon navigating to customer breakdown pin.
- **Top Navigation Banner (Floating White HUD)**:
  - Turn direction arrow: "↱ In 300 meters, Turn Right onto St. 271".
  - ETA Card: "Arriving at 10:48 AM • 4 mins remaining • 1.1 km".
- **Active Job Control Sheet (Bottom Drawer)**:
  - Customer Identity Row:
    • Customer photo, name: "Rendo", vehicle: "Toyota Hilux 2BB-1234".
    • Quick Contact: Circular "[📞 Call]" and "[💬 Chat]" buttons.
  - Security PIN Input Box:
    • "Enter Customer's 4-Digit Verification PIN: [ _ _ _ _ ]".
  - Multi-Stage Action Slider:
    • Step 1: "Slide to Confirm Arrival on Site ➔"
    • (Transitions to Step 2: "Slide to Begin Inspection", then Step 3: "Slide to Complete Repair").
  - Add Parts Used Button:
    • Outline button: "[+ Add Parts Used from Inventory]" (Allows mechanic to append items to invoice).

---

### Screen 20: Provider Earnings, Wallet & Payouts
- **Top Header**: Title "Earnings & Payouts", date filter [This Week ▼], and download statement icon.
- **Total Available Balance Card**:
  - Elevated royal blue card with white typography:
    • "Available Payout Balance: ,248.50".
    • Linked Bank Account: "ABA Bank (Account: *** 8921) • Bakong Enabled".
    • Primary White Button: "[Withdraw Funds to ABA Bank ➔]".
- **Weekly Revenue Chart Card**:
  - Clean bar graph showing revenue per day (Mon through Sun):
    • Mon:  • Tue:  • Wed:  • Thu:  • Fri:  (Peak) • Sat:  • Sun: .
  - Total Weekly Revenue: ",248.50 (28 jobs completed)".
- **Itemized Transaction History (Vertical List)**:
  - Transaction 1:
    • "Roadside Battery Jumpstart — Rendo" • Date: "Today, 11:15 AM".
    • Payout: "+.50" (Green text) • Breakdown: "Labor  + Parts .50 - Platform Fee .00".
    • Status: "Completed • Paid via Bakong KHQR".
  - Transaction 2:
    • "Brake Pad Replacement — Sokha V." • Date: "Yesterday, 3:30 PM" • Payout: "+.00".
  - Transaction 3:
    • "Weekly Payout to ABA Account" • Date: "Oct 07, 2026" • Amount: "-.00" (Black text).
