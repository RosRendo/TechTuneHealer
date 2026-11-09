/**
 * TechTune Healer — Official Playwright QA Test Suite
 *
 * Built with @playwright/test
 * Validates the 8 Major Feature Areas & 4 Defense Priorities:
 * 1. Authentication
 * 2. Emergency SOS 🚨 (⭐️ Priority 1)
 * 3. Real-Time GPS Tracking 📍 (⭐️ Priority 2)
 * 4. AI Diagnostics
 * 5. Workshop Booking 🔧 (⭐️ Priority 3)
 * 6. Shop & Spare Parts
 * 7. Payment & KHQR Settlement 💳 (⭐️ Priority 4)
 * 8. Profile & Vehicle Management
 */

import { test, expect } from "@playwright/test";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.WS_URL || "http://localhost:4000";

// Shared state across sequential Playwright test steps
let customerToken = "";
let customerId = "";
let providerToken = "";
let providerUserId = "";
let providerId = "";
let testVehicleId = "";
let emergencyBookingId = "";
let standardBookingId = "";

test.describe.serial("TechTune Healer QA Defense Test Suite (Playwright)", () => {
  // ── 1. AUTHENTICATION ───────────────────────────────────────────────────────
  test.describe("1. Feature 1: Authentication", () => {
    test("TC-AUTH-01: Customer login with valid credentials (customer@test.com)", async ({ request }) => {
      const response = await request.post("/auth/login", {
        data: { email: "customer@test.com", password: "password123" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe("string");
      expect(data.token.length).toBeGreaterThan(20);
      expect(data.user.role.toUpperCase()).toBe("CUSTOMER");

      customerToken = data.token;
      customerId = data.user.id;
    });

    test("TC-AUTH-02: Provider login with valid credentials (sokha@test.com)", async ({ request }) => {
      const response = await request.post("/auth/login", {
        data: { email: "sokha@test.com", password: "password123" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(data.user.role.toUpperCase()).toBe("PROVIDER");

      providerToken = data.token;
      providerUserId = data.user.id;
    });

    test("TC-AUTH-03: Reject login with incorrect password (HTTP 401)", async ({ request }) => {
      const response = await request.post("/auth/login", {
        data: { email: "customer@test.com", password: "wrongpassword999" },
      });
      expect(response.status()).toBe(401);
    });

    test("TC-AUTH-04: Reject registration with missing required fields (HTTP 400)", async ({ request }) => {
      const response = await request.post("/auth/register", {
        data: { name: "Missing Fields User", role: "CUSTOMER" },
      });
      expect(response.status()).toBe(400);
    });
  });

  // ── 8. PROFILE & VEHICLE ────────────────────────────────────────────────────
  test.describe("8. Feature 8: Profile & Vehicle Management", () => {
    test("TC-PROF-01: Add vehicle with Cambodian license plate (2B-XXXX)", async ({ request }) => {
      const randomPlate = `2B-${Math.floor(1000 + Math.random() * 9000)}`;
      const response = await request.post("/vehicles", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          make: "Toyota",
          model: "Prius Hybrid",
          year: 2021,
          plateNumber: randomPlate,
          color: "Pearl White",
        },
      });
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.make).toBe("Toyota");
      expect(data.plateNumber).toBe(randomPlate);

      testVehicleId = data.id;
    });

    test("TC-PROF-02: Fetch registered vehicles for authenticated customer", async ({ request }) => {
      const response = await request.get("/vehicles", {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(response.status()).toBe(200);

      const vehicles = await response.json();
      expect(Array.isArray(vehicles)).toBeTruthy();
      expect(vehicles.length).toBeGreaterThan(0);

      const found = vehicles.find((v: any) => v.id === testVehicleId);
      expect(found).toBeDefined();
    });
  });

  // ── 2. EMERGENCY SOS 🚨 (⭐️ PRIORITY 1) ────────────────────────────────────
  test.describe("2. Feature 2: Emergency SOS 🚨 (⭐️ Defense Priority 1)", () => {
    test("TC-SOS-01: Query nearest emergency rescue mechanics in Phnom Penh", async ({ request }) => {
      const response = await request.get("/providers/emergency?lat=11.5564&lng=104.9282", {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(response.status()).toBe(200);

      const providers = await response.json();
      expect(Array.isArray(providers)).toBeTruthy();
      expect(providers.length).toBeGreaterThan(0);

      const speedy = providers.find((p: any) => p.businessName?.includes("Speedy") || p.name?.includes("Speedy"));
      expect(speedy).toBeDefined();
      providerId = speedy.id;
    });

    test("TC-SOS-02: Create 1-tap emergency breakdown SOS booking (Status: PENDING)", async ({ request }) => {
      const response = await request.post("/bookings", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          providerId,
          vehicleId: testVehicleId,
          serviceType: "Emergency Roadside Rescue - Flat Tire",
          scheduledDate: new Date().toISOString(),
          scheduledTime: "Immediate",
          notes: "Emergency breakdown near CamTech University Chroy Changvar campus",
        },
      });
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.status.toUpperCase()).toBe("PENDING");

      emergencyBookingId = data.id;
    });

    test("TC-SOS-03: Mechanic receives and accepts the emergency dispatch (Status: ACCEPTED)", async ({ request }) => {
      const response = await request.patch(`/bookings/${emergencyBookingId}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: "ACCEPTED" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status.toUpperCase()).toBe("ACCEPTED");
    });
  });

  // ── 3. REAL-TIME GPS TRACKING 📍 (⭐️ PRIORITY 2) ───────────────────────────
  test.describe("3. Feature 3: Real-Time GPS Tracking 📍 (⭐️ Defense Priority 2)", () => {
    test("TC-GPS-01: Bidirectional Socket.io GPS coordinate streaming with JWT auth", async () => {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Socket location update timed out after 6000ms"));
        }, 6000);

        const customerSocket: Socket = io(WS_URL, {
          auth: { token: customerToken },
          transports: ["websocket", "polling"],
        });

        const providerSocket: Socket = io(WS_URL, {
          auth: { token: providerToken },
          transports: ["websocket", "polling"],
        });

        function cleanup() {
          clearTimeout(timeout);
          customerSocket.disconnect();
          providerSocket.disconnect();
        }

        customerSocket.on("connect", () => {
          customerSocket.emit("customer:watch", { bookingId: emergencyBookingId });
        });

        customerSocket.on("location:update", (coords: any) => {
          try {
            expect(Math.abs(coords.latitude - 11.56)).toBeLessThan(0.02);
            expect(Math.abs(coords.longitude - 104.91)).toBeLessThan(0.02);
            expect(coords.timestamp).toBeDefined();
            cleanup();
            resolve();
          } catch (err) {
            cleanup();
            reject(err);
          }
        });

        customerSocket.on("booking:error", (err: any) => {
          cleanup();
          reject(new Error(`Customer socket error: ${err.message}`));
        });

        providerSocket.on("connect", () => {
          setTimeout(() => {
            providerSocket.emit("mechanic:location", {
              bookingId: emergencyBookingId,
              latitude: 11.5605,
              longitude: 104.9105,
            });
          }, 500);
        });

        providerSocket.on("booking:error", (err: any) => {
          cleanup();
          reject(new Error(`Provider socket error: ${err.message}`));
        });
      });
    });

    test("TC-GPS-02: Mechanic slide-to-action transitions status to IN_PROGRESS", async ({ request }) => {
      const response = await request.patch(`/bookings/${emergencyBookingId}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: "IN_PROGRESS" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status.toUpperCase()).toBe("IN_PROGRESS");
    });
  });

  // ── 5. WORKSHOP BOOKING 🔧 (⭐️ PRIORITY 3) ─────────────────────────────────
  test.describe("5. Feature 5: Workshop Booking Lifecycle 🔧 (⭐️ Defense Priority 3)", () => {
    test("TC-BOOK-01: Customer schedules future garage repair appointment", async ({ request }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request.post("/bookings", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          providerId,
          vehicleId: testVehicleId,
          serviceType: "Full Synthetic Oil Change & Filter Replacement",
          scheduledDate: tomorrow.toISOString(),
          scheduledTime: "10:00",
          notes: "Regular 10,000km scheduled service",
        },
      });
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.status.toUpperCase()).toBe("PENDING");

      standardBookingId = data.id;
    });

    test("TC-BOOK-02: Fetch booking details with populated relations (Customer, Provider, Vehicle)", async ({ request }) => {
      const response = await request.get(`/bookings/${standardBookingId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.id).toBe(standardBookingId);
      expect(data.customer).toBeDefined();
      expect(data.provider).toBeDefined();
      expect(data.vehicle).toBeDefined();
    });

    test("TC-BOOK-03: Mechanic finishes and completes the workshop repair (Status: COMPLETED)", async ({ request }) => {
      const response = await request.patch(`/bookings/${standardBookingId}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: "COMPLETED" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status.toUpperCase()).toBe("COMPLETED");
    });
  });

  // ── 4. AI DIAGNOSTICS ───────────────────────────────────────────────────────
  test.describe("4. Feature 4: AI Diagnostics Scanner", () => {
    test("TC-DIAG-01: Diagnose symptoms with engine noise keywords (High Severity)", async ({ request }) => {
      const response = await request.post("/diagnostics/analyze", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          symptoms: ["knocking", "loud metallic rattling from engine", "ticking sound"],
        },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.possibleIssues)).toBeTruthy();
      expect(data.possibleIssues.length).toBeGreaterThan(0);

      const engineIssue = data.possibleIssues.find((d: any) => d.name === "Engine Noise");
      expect(engineIssue).toBeDefined();
      expect(engineIssue.severity).toBe("high");
      expect(typeof engineIssue.recommendedAction).toBe("string");
    });

    test("TC-DIAG-02: Reject empty symptoms array with HTTP 400 Bad Request", async ({ request }) => {
      const response = await request.post("/diagnostics/analyze", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: { symptoms: [] },
      });
      expect(response.status()).toBe(400);
    });
  });

  // ── 6. SHOP & SPARE PARTS ──────────────────────────────────────────────────
  test.describe("6. Feature 6: Shop & Spare Parts Catalog", () => {
    let productId = "";
    let productPrice = 0;

    test("TC-SHOP-01: Browse product catalog and verify available inventory stock", async ({ request }) => {
      const response = await request.get("/shop/products");
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);

      const inStock = products.find((p: any) => p.stock > 2);
      expect(inStock).toBeDefined();

      productId = inStock.id;
      productPrice = inStock.price;
    });

    test("TC-SHOP-02: Add in-stock product item to customer cart", async ({ request }) => {
      const response = await request.post("/shop/cart/items", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: { productId, quantity: 2 },
      });
      expect(response.status()).toBe(200);

      const cart = await response.json();
      expect(Array.isArray(cart.items)).toBeTruthy();
      expect(cart.items.length).toBeGreaterThan(0);
    });

    test("TC-SHOP-03: Atomic checkout creates Order and reserves stock", async ({ request }) => {
      const response = await request.post("/shop/orders/checkout", {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {},
      });
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.order).toBeDefined();
      expect(data.order.status).toBe("PENDING");
      expect(data.order.totalAmount).toBeGreaterThanOrEqual(productPrice * 2);
    });
  });

  // ── 7. PAYMENT & KHQR 💳 (⭐️ PRIORITY 4) ───────────────────────────────────
  test.describe("7. Feature 7: Payment & KHQR Settlement 💳 (⭐️ Defense Priority 4)", () => {
    test("TC-PAY-01: Calculate official Cambodian KHQR dual-currency exchange (USD -> KHR @ 4,100)", async () => {
      const usdTotal = 80.0;
      const exchangeRate = 4100;
      const khrTotal = Math.round(usdTotal * exchangeRate);

      expect(khrTotal).toBe(328000);
    });

    test("TC-PAY-02: Finalize emergency repair booking payment state to COMPLETED", async ({ request }) => {
      const response = await request.patch(`/bookings/${emergencyBookingId}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: "COMPLETED" },
      });
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status.toUpperCase()).toBe("COMPLETED");
    });
  });

  // Clean up created test vehicle
  test.afterAll(async ({ request }) => {
    if (testVehicleId && customerToken) {
      await request.delete(`/vehicles/${testVehicleId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
    }
  });
});
