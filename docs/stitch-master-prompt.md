# 🏎️ TechTune Healer — Master AI Design & UI/UX Prompt for Google Stitch

> **Target Tool**: Google Stitch / Modern AI UI Prototyping Systems  
> **Application**: TechTune Healer (On-Demand Roadside Assistance, AI Telemetry Diagnostics & Auto Care Marketplace)  
> **Platform**: iOS & Android Mobile App (React Native / Expo 54)  
> **Design Philosophy**: High-End Automotive Cyber-Luxury (Porsche Digital × Uber Black × Apple Health)  

---

## 🎨 Global Design System & Token Specifications

### 1. Visual Aesthetics & Atmosphere
- **Theme**: Dark Mode First (Ultra-deep Obsidian backdrop with polished ambient glows). An optional Crisp Platinum Light Mode for daylight driving visibility.
- **Surface Elevation**: Multi-layered glassmorphism (ackdrop-filter: blur(24px)), 1px micro-borders (gba(255, 255, 255, 0.08)), and soft neon edge reflections.
- **Color Palette**:
  - **Background**: #070A0F (True Deep Midnight), Surface Card: #0F172A / #162032
  - **Primary Accent (Cyber Cyan / Electric Teal)**: #00F2FE → #4FACFE (Used for active telemetry, primary actions, and confirmed states)
  - **Emergency Panic (Hyper Crimson)**: #FF2A54 (Pulsing radar animations, SOS emergency buttons, critical engine warnings)
  - **Diagnostic Warning (Amber Gold)**: #FFB300 (Pending maintenance, moderate engine wear, check-engine flags)
  - **Success / Online (Emerald Jade)**: #00E676 (Mechanic online toggle, payment confirmed, booking completed)
  - **Typography & Neutral**: Title #FFFFFF, Subhead #94A3B8, Muted #64748B, Hairline #1E293B
- **Typography Hierarchy**:
  - Display: 34pt Bold (Tracking -0.5px) — Hero stats, SOS trigger
  - Large Title: 26pt SemiBold — Section headlines, screen headers
  - Headline / Card Title: 18pt SemiBold — Mechanic names, diagnostic findings
  - Body: 15pt Regular (Line height 22pt) — Descriptions, chat messages
  - Caption / Micro: 12pt Medium (Uppercase, Tracking +1px) — Timers, badges, tags
- **Micro-Interactions & Gestures**:
  - Interactive bottom sheets with fluid drag physics (Detents: 20%, 55%, 90%).
  - Slide-to-Confirm action pill (haptic feedback on lock-in).
  - Live animated polyline navigation and real-time pulsing vehicle locator pins.
  - Floating Dynamic Island / Live Activity Pill pinned at the top/bottom showing active job progress.

---

## 🧭 UX Hierarchy & Architecture Restructuring

### The Problem in Current UX:
1. **Mixed Mental Models**: Users in panic (highway breakdown) are forced through the same multi-step forms as users booking a routine oil change next week.
2. **Cluttered Customer Home Screen**: Too many competing primary buttons (AI diagnosis, shop, mechanics, SOS, cart) fighting for eye attention.
3. **Modal Maze in Checkout**: Heavy popups and disconnected screens for Bakong KHQR payments instead of a fluid, Apple Pay-style checkout sheet.
4. **Disconnected Parts Shop**: E-commerce catalog is currently isolated instead of contextually suggesting the exact compatible parts for the user’s diagnosed vehicle.

### The New Restructured User Journey:
1. **Top Priority Layer (Crisis / Highway Breakdown)**: Instant 2-tap Emergency SOS with live GPS radar matching.
2. **Second Priority Layer (Proactive Health & AI Scanning)**: Camera scan / Audio sound check → instant severity classification → 1-tap booking.
3. **Third Priority Layer (Scheduled Care & Garage)**: Map discovery, verified workshop booking, maintenance timeline tracker.
4. **Ecosystem Utility Layer**: Parts marketplace filtered automatically by the user's saved garage vehicle.

---

## 📱 Stitch Master Prompt: Complete Screen-by-Screen Blueprint

---

### [Screen 1: Welcome, Role Gateway & Biometric Login]
- **Role**: Entry point and persona switcher.
- **Layout**: Full-bleed dark backdrop with subtle ambient light gradient and blurred carbon-fiber texture.
- **Components**:
  - Animated metallic TechTune Healer brandmark with glowing cyan core.
  - Persona Segmented Switcher: [🚗 Vehicle Owner]  [🔧 Mechanic / Shop Partner].
  - One-tap Social Auth: Google Sign-In button (#FFFFFF surface with official Google G-logo), Apple ID button, or Email/Password field.
  - Biometric quick-login prompt (Face ID / Touch ID icon with cyan scanning wave).
- **Transitions**: Smooth slide transition into the respective dashboard based on active persona.

---

### [Screen 2: Customer Command Center (Home Screen)]
- **Role**: Primary customer home dashboard with clear visual hierarchy.
- **Header**: User location pill (📍 128 Norodom Blvd, Phnom Penh with dropdown arrow), notification bell with badge counter, and garage vehicle pill (2022 Ford Ranger Raptor).
- **Hero Focus (Live Vehicle Health Status Card)**:
  - Circular visual gauge showing Overall Health Score (94% - Good Condition).
  - Next Service Due countdown: Oil Change in 1,200 km (or 18 days).
- **Primary Action Quad (2×2 Grid with Rich Glass Cards)**:
  1. **🚨 Roadside SOS** (Hyper Crimson glow, pulsating radar icon, label: *Emergency Assistance in < 15 mins*).
  2. **🤖 AI Engine Doctor** (Cyan gradient glow, soundwave/camera icon, label: *Sound & Warning Light Scanner*).
  3. **🗺️ Find Mechanics** (Electric Blue glow, map pin icon, label: *54 Verified Garages Nearby*).
  4. **🛒 Parts Store** (Slate Violet glow, wrench/filter icon, label: *OEM Parts for Your Vehicle*).
- **Persistent Live Activity Bar (Bottom Floating Pill)**:
  - If a job is active: Floating glass pill showing 🔧 Mechanic Sopheak is 4 mins away with mini map thumbnail and *Tap to View Live Route*.
- **Recommended Workshops Carousel**: Horizontal cards featuring workshop photo, verified badge, rating ⭐ 4.9 (128 reviews), distance 1.4 km, and starting price tag $15.

---

### [Screen 3: Roadside SOS & High-Priority Emergency Flow]
- **Role**: Stress-free, high-urgency rescue dispatch flow.
- **Top Section**: Fullscreen dark satellite/vector map centered on user's live GPS coordinates with 3 pulsing radar rings.
- **Emergency Service Selector (Horizontal Carousel)**:
  - [Tow Truck 🛻] • [Mobile Mechanic 🧰] • [Tire Puncture 🛞] • [Battery Jump 🔋] • [Fuel Delivery ⛽].
- **Slide-to-Rescue Slider**:
  - Full-width slider: *"Slide to Dispatch Emergency Rescue"*.
  - When dragged across: Triggers immediate haptic vibration, locks in GPS coordinate, and alerts the 3 nearest mobile units with a 15-second response countdown timer.
- **Floating Emergency Hotlines**: Secondary bar at bottom with 1-tap call buttons for Cambodia National Police (117), Ambulance (119), and TechTune 24/7 Helpline.

---

### [Screen 4: AI Diagnostic Scanner (Sound & Vision Telemetry)]
- **Role**: Next-gen vehicle issue detection using multimodal AI.
- **Mode Toggle**: [🎙️ Engine Sound Analysis]  |  [📸 Warning Light / Part Scanner].
- **Sound Mode**:
  - Circular high-fidelity visualizer with reacting cyber-cyan waveform.
  - Instruction: *"Hold phone near engine bay while running"*.
  - Live AI processing status: *"Filtering background noise... Analyzing RPM frequencies... Cross-referencing 10,000+ engine logs..."*.
- **Vision Mode**:
  - Augmented reality camera viewfinder with targeting bounding box and real-time edge detection overlay.
- **Diagnosis Result Bottom Sheet**:
  - Issue Detected Card: Worn Alternator Belt / Tensioner Pulley (Severity: *Moderate — Service within 5 days*).
  - Estimated Repair Cost Range: $35.00 – .00.
  - Direct Action: [Book Nearest Certified Specialist] (Pre-fills diagnosed issue in booking form).

---

### [Screen 5: Interactive Discovery Map & Service Booking]
- **Role**: Browsing, filtering, and booking verified service providers.
- **Map View**: Custom dark-mode vector map with custom map pins displaying provider rating and price badge.
- **Search & Filter Header**: Search bar (*"Brake repair, AC recharge, Honda specialist..."*) + Filter Pills (*Open 24/7*, *Mobile Service*, *Rating 4.8+*, *Distance < 5km*).
- **Provider Details Expandable Sheet**:
  - Workshop cover photo gallery with verified credentials.
  - Service Menu with transparent flat pricing.
  - Select Service → Pick Vehicle from Garage → Select Date & Time Slot (Morning / Afternoon / Express).
  - Button: Proceed to Booking Summary & Guarantee.

---

### [Screen 6: Live Uber-Style Tracking & Job Telemetry]
- **Role**: Real-time tracking of mechanic on their way to customer breakdown location.
- **Map View**:
  - Live polyline navigation path with real-time mechanic car icon moving along streets.
  - Traffic heat overlay and estimated time of arrival badge (ETA: 6 MINS).
- **Tracking Control Sheet (Swipeable Bottom Sheet)**:
  - Mechanic Card: High-res avatar, Mechanic Name (*Dara Chan*), Star Rating (⭐ 4.95), Total Completed Repairs (432 jobs), Vehicle Plate (Phnom Penh 2BC-8899).
  - Contact Actions: Circular [📞 Call Mechanic] and [💬 Live Chat] buttons.
  - Step Progress Indicator:
    - ● Dispatched → ● En Route (Current) → ○ Arrived at Location → ○ Diagnostic & Repair → ○ Completed.
  - Safety Pin / Code: Share 4-digit verification code with mechanic: [ 8 4 1 9 ].

---

### [Screen 7: Seamless Checkout & Bakong KHQR Bottom Sheet]
- **Role**: Frictionless payment settlement for services and parts.
- **Layout**: Clean iOS bottom sheet modal (no cluttered full-page redirects).
- **Invoice Breakdown**:
  - Diagnostic & Labor: $20.00
  - Replacement Alternator Belt: $18.50
  - Promo Discount: -.00
  - **Total Due**: USD .50 (or KHR 137,350 ៛).
- **Payment Method Selector**:
  - [🇰🇭 Bakong KHQR / ABA Payway] • [💳 Credit/Debit Card] • [💵 Cash on Service].
- **Dynamic KHQR Display**:
  - High-resolution Bakong KHQR code with embedded ABA Payway logo.
  - Real-time countdown timer: Valid for 04:59.
  - Instant action buttons: [Download QR Image] and [Open in ABA Mobile App].
  - Automated WebSocket listener that transitions instantly to a green checkmark celebration animation as soon as the bank settles the transaction.

---

### [Screen 8: My Garage (Vehicle Vault & Preventative Health Radar)]
- **Role**: User's personalized garage and maintenance log.
- **Vehicle Card Carousel**:
  - 3D/high-res rendering of customer's vehicle (2021 Toyota Hilux Revo, Plate: 2BB-1234).
  - Odometer input tracker (42,350 km).
- **Component Wear & Maintenance Radar**:
  - Engine Oil: 85% life remaining (Progress bar green).
  - Brake Pads: 15% life remaining (Progress bar amber — *"Inspection Recommended"*).
  - Battery Voltage: 12.6V (Optimal).
- **Service History Log**: Chronological timeline of all past repairs, downloadable PDF invoices, and mechanic warranty certificates.

---

### [Screen 9: Contextual Auto Parts Store & Fitment Guarantee]
- **Role**: E-commerce catalog tailored to the user's vehicle.
- **Vehicle Fitment Banner**: Showing parts guaranteed to fit your 2021 Toyota Hilux Revo with green check badge.
- **Product Cards**: High-res product photography, OEM part number, price, stock status, customer reviews, and [Add to Cart] button with micro-animation.
- **Floating Cart Button**: Floating pill with item count badge and subtotal calculation.

---

### [Screen 10: Provider Cockpit (Mechanic Live Operating System)]
- **Role**: Workstation for mechanics and workshop owners.
- **Top Bar**: Availability Switcher ([🟢 ONLINE - Accepting Jobs] / [🔴 OFFLINE]).
- **Today's Metric Tiles**:
  - Today's Revenue: $142.50
  - Completed Jobs: 4
  - Acceptance Rate: 98%
  - Customer Rating: ⭐ 4.96
- **Incoming Job Dispatch Alert (Modal Banner)**:
  - 30-second countdown circular timer with audio chime.
  - Emergency breakdown type (*Flat tire on Russian Blvd*), Distance (*1.2 km away*), Estimated payout (*.00*).
  - Swipe-to-Accept gesture bar.
- **Active Job Turn-by-Turn Screen**:
  - Integrated map routing with customer breakdown location pin.
  - Progress Slider: *"Slide to Mark Arrived"* → *"Slide to Begin Diagnostics"* → *"Slide to Finalize Repair"*.
  - Add Parts Used Button: Quickly append store parts to customer's final invoice.
