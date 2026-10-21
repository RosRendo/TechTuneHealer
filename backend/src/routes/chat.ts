import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import type { Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Seed greeting exchange the first time a thread is opened for a booking
async function ensureThreadInitialized(
  bookingId: string,
  customerName?: string,
  serviceType?: string,
  notes?: string
) {
  const existing = await prisma.chatMessage.count({ where: { bookingId } });
  if (existing > 0) return;

  const cust = customerName || "Motorist";
  const greetingText = notes
    ? `Hello! ${notes}`
    : `Hello, I requested ${serviceType || "emergency assistance"} for my vehicle. Are you able to assist?`;

  await prisma.chatMessage.createMany({
    data: [
      {
        bookingId,
        senderId: "customer",
        senderName: cust,
        senderRole: "customer",
        text: greetingText,
      },
      {
        bookingId,
        senderId: "provider",
        senderName: "Speedy Auto Fix",
        senderRole: "provider",
        text: "Hello! We received your dispatch request. A certified technician is assigned and preparing tools.",
      },
    ],
  });
}

function formatMessage(m: {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}) {
  return {
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  };
}

// ─── GET /chat/threads ──────────────────────────────────────────────────────
// Returns all active dispatch chat channels with latest message preview
router.get("/threads", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true } },
        vehicle: { select: { make: true, model: true, plateNumber: true } },
      },
    });

    const bookingIds = bookings.map((b) => b.id);
    const latestByBooking = new Map<string, { text: string; createdAt: string }>();
    if (bookingIds.length) {
      const messages = await prisma.chatMessage.findMany({
        where: { bookingId: { in: bookingIds } },
        orderBy: { createdAt: "asc" },
      });
      for (const m of messages) {
        latestByBooking.set(m.bookingId, {
          text: m.text,
          createdAt: m.createdAt.toISOString(),
        });
      }
    }

    // Create seed messages lazily for any thread that has none yet
    for (const b of bookings) {
      if (!latestByBooking.has(b.id)) {
        await ensureThreadInitialized(b.id, b.customer.name, b.serviceType, b.notes || undefined);
        latestByBooking.set(b.id, {
          text: "We received your dispatch request. A certified technician is assigned.",
          createdAt: new Date().toISOString(),
        });
      }
    }

    const counts = await prisma.chatMessage.groupBy({
      by: ["bookingId"],
      where: { bookingId: { in: bookingIds } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.bookingId, c._count._all]));

    const threads = bookings.map((b) => {
      const lastMsg = latestByBooking.get(b.id);
      return {
        bookingId: b.id,
        serviceType: b.serviceType,
        status: b.status,
        customerName: b.customer.name,
        customerPhone: b.customer.phone,
        providerName: b.provider.businessName,
        vehicleInfo: b.vehicle
          ? `${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.plateNumber})`
          : "Vehicle",
        lastMessage: lastMsg?.text || "No messages yet",
        lastMessageTime: lastMsg?.createdAt || b.createdAt,
        messageCount: countMap.get(b.id) ?? 0,
      };
    });

    res.json(threads);
  } catch (error) {
    console.error("Error fetching chat threads:", error);
    res.status(500).json({ message: "Error fetching chat threads" });
  }
});

// ─── GET /chat/:bookingId ───────────────────────────────────────────────────
// Fetch all messages for a specific booking
router.get("/:bookingId", authenticate, async (req: AuthRequest, res: Response) => {
  const bookingId = req.params["bookingId"] as string;
  try {
    let messages = await prisma.chatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });
    if (messages.length === 0) {
      const b = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: { select: { name: true } } },
      });
      if (b) {
        await ensureThreadInitialized(bookingId, b.customer?.name, b.serviceType, b.notes || undefined);
        messages = await prisma.chatMessage.findMany({
          where: { bookingId },
          orderBy: { createdAt: "asc" },
        });
      }
    }
    res.json(messages.map(formatMessage));
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Error fetching chat messages" });
  }
});

// ─── POST /chat/:bookingId ──────────────────────────────────────────────────
// Send a message
router.post("/:bookingId", authenticate, async (req: AuthRequest, res: Response) => {
  const bookingId = req.params["bookingId"] as string;
  const { text, senderName, senderRole } = req.body as {
    text: string;
    senderName?: string;
    senderRole?: string;
  };

  if (!text?.trim()) {
    res.status(400).json({ message: "Message text required" });
    return;
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const message = await prisma.chatMessage.create({
    data: {
      bookingId,
      senderId: req.userId || senderRole || "provider",
      senderName: senderName || "Speedy Auto Fix",
      senderRole: senderRole || null,
      text: text.trim(),
    },
  });

  res.status(201).json(formatMessage(message));
});

export default router;
