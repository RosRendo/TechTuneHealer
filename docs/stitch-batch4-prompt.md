# TechTune Healer — Stitch Prompt (Batch 4: Auto Parts Store & Bakong KHQR Checkout)

**Platform**: iOS & Android Mobile App (React Native / Expo)
**Target**: Google Stitch (Generates 4 Screens)
**Aesthetic Style**: Modern Business Marketplace (Clean, Trustworthy, Professional — Apple Store × Amazon × Grab). Crisp white cards, light slate gray background (#F8FAFC), deep navy typography (#0F172A), royal blue accents (#1E40AF / #2563EB), emerald green (#10B981) for vehicle fitment guarantee and payment confirmation. Zero cyberpunk or neon sci-fi.

---

## 📱 The 4 Screens to Generate

### Screen 13: Auto Parts Marketplace & Catalog
- **Top Header**: Screen title "Auto Parts Store", search input with barcode scanner icon, and floating Cart icon with badge "(2)".
- **Vehicle Fitment Banner (Top Sticky Card)**:
  - Clean white container with green shield icon: "✓ Showing parts guaranteed to fit your 2021 Toyota Hilux Revo" and a small "[Change]" link.
- **Category Filter Chips (Horizontal Scroll)**:
  - [All Parts] • [🛢️ Oils & Fluids (Selected)] • [🛑 Brake Pads] • [🌪️ Air & Oil Filters] • [🔋 Batteries] • [⚙️ Belts & Hoses].
- **2-Column Product Grid**:
  - Product Card 1:
    • High-res product photo on clean white background: *Motul 8100 X-cess 5W-40 Synthetic Oil (4L)*.
    • Badge: "OEM Approved" (Green tag).
    • Rating: "⭐ 4.9 (84)".
    • Price: ".00" (Strikethrough: ".00").
    • Quick Add: Circular blue "+" button.
  - Product Card 2:
    • Photo: *Toyota Genuine Oil Filter (90915-YZZD2)*.
    • Badge: "100% Genuine Toyota".
    • Price: ".50".
    • Quick Add: Circular blue "+" button.
  - Product Card 3:
    • Photo: *Brembo Ceramic Front Brake Pads Set*.
    • Badge: "Fits Your Vehicle".
    • Price: ".00" • Quick Add button.
- **Bottom Floating Cart Pill**:
  - Elevated capsule bar: "2 items in cart • Total: .50" with text link "[View Cart ➔]".

---

### Screen 14: Product Detail & Fitment Verification
- **Top Header**: Back arrow, share icon, and heart bookmark icon over clean product hero image.
- **Product Image Carousel**: High-resolution studio photography of oil bottle and seal with page indicator dots (● ○ ○).
- **Title & Pricing Card**:
  - Brand & Title: "Motul 8100 X-cess Gen2 5W-40 Fully Synthetic Engine Oil (4L Bottle)".
  - Star Rating: "⭐ 4.9 (84 customer reviews) • 320 sold".
  - Price: ".00" with "In Stock • Ships in 2 Hours".
- **Guaranteed Vehicle Fitment Card**:
  - Green border container with checkmark shield:
    • "Guaranteed to Fit: 2021 Toyota Hilux Revo 2.8L Diesel (1GD-FTV)".
    • Subtext: "Matches OEM oil viscosity and ACEA A3/B4 specifications."
- **Specifications & Features Accordion**:
  - Viscosity: 5W-40 • Volume: 4 Liters • Origin: Made in France.
  - Recommended Change Interval: 10,000 km or 6 months.
- **Customer Reviews Summary**:
  - Review quote: *"Fixed engine ticking noise on cold start. Very fast delivery to Toul Kork."* — Sovann M.
- **Bottom Fixed Purchase Bar**:
  - Quantity Stepper: [-] [ 1 ] [+].
  - Primary Royal Blue Button: "[Add to Cart - .00]" (Full width, height 50px).

---

### Screen 15: Shopping Cart & Order Delivery Mode
- **Top Header**: Back arrow, title "My Cart (2 items)", and "Clear All" link.
- **Cart Item List**:
  - Item 1:
    • Thumbnail, "Motul 8100 X-cess 5W-40 (4L)", ".00".
    • Quantity stepper: [-] [ 1 ] [+] • Trash delete icon.
  - Item 2:
    • Thumbnail, "Toyota Genuine Oil Filter", ".50".
    • Quantity stepper: [-] [ 1 ] [+] • Trash icon.
- **Delivery Destination Selector (Radio Cards)**:
  - Option A (Selected):
    • [🏠 Express Home Delivery]
    • "Delivered to: 128 Norodom Blvd, Phnom Penh (Est. 45–60 mins) • Fee: .50".
  - Option B:
    • [🔧 Deliver to Workshop for Installation]
    • "Send directly to Bona Motors & Care for your booked appointment tomorrow".
- **Promo Code Box**: Input field "[ Enter discount code ]" with "[Apply]" button.
- **Order Cost Breakdown**:
  - Subtotal: $46.50
  - Express Delivery Fee: $1.50
  - Promo Discount: -.00
  - **Total to Pay**: **$45.00 (approx. 184,500 ៛)**.
- **Bottom Fixed CTA Bar**:
  - Primary Full-Width Blue Button: "[Proceed to Payment - .00 ➔]".

---

### Screen 16: Frictionless Payment Sheet (Bakong KHQR + ABA Payway + Card)
- **Modal Context**: Clean iOS slide-up bottom sheet with rounded top corners (28px radius) and top drag indicator.
- **Header**: Title "Select Payment Method", close "✕" button, and Total Due badge: ".00 / 184,500 ៛".
- **Payment Method Segmented Tabs**:
  - [🇰🇭 Bakong KHQR (Selected)] • [💳 Credit/Debit Card] • [💵 Cash on Delivery].
- **Dynamic Bakong KHQR Display Card**:
  - Clean white card with royal blue header banner: "Scan to Pay with Any Banking App".
  - High-resolution dynamic Bakong KHQR Code with central ABA Payway / Bakong logo.
  - Merchant Name: "TechTune Healer Auto Marketplace" • Amount: "USD .00".
  - Live Expiration Countdown: "QR valid for 04:59" with live progress bar.
  - Action Row:
    • Secondary outline button: "[📥 Save QR Image]".
    • Secondary outline button: "[📱 Open in ABA Mobile]".
- **Live Payment Status Indicator**:
  - Animated pulsing status row at bottom: "Waiting for payment confirmation from bank...".
  - Subtext: "The screen will automatically update as soon as payment is verified."
- **Alternative Action**:
  - Text link: "Change payment method or pay cash on delivery".
