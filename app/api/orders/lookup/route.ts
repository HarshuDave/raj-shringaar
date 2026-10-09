import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumberAndPhone } from "@/lib/data/repository";
import { generateOrderAccessToken, maskName, maskPhone } from "@/lib/auth/order-token";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from "@/lib/security/rate-limit";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

async function handleLookup(orderNumberRaw?: string | null, phoneRaw?: string | null, ip: string = "127.0.0.1") {
  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(ip, {
    maxRequests: 10,
    windowMs: 60000,
    maxFailedAttempts: 5,
    lockoutMs: 15 * 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimit.reason || "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds || 60),
        },
      }
    );
  }

  // 2. Strict Input Validation
  const orderNumber = orderNumberRaw?.trim().toUpperCase();
  const phone = phoneRaw?.replace(/\D/g, "");

  if (!orderNumber || !phone) {
    return NextResponse.json(
      {
        success: false,
        error: "Both Order Reference Number and 10-digit mobile number are required.",
      },
      { status: 400 }
    );
  }

  const orderNumberRegex = /^RS-\d{6}$/;
  if (!orderNumberRegex.test(orderNumber)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid Order Reference format. It must follow the RS-XXXXXX format (e.g. RS-123456).",
      },
      { status: 400 }
    );
  }

  if (phone.length !== 10) {
    return NextResponse.json(
      {
        success: false,
        error: "Please enter a valid 10-digit mobile number.",
      },
      { status: 400 }
    );
  }

  // 3. Exact Database Lookup
  const order = await getOrderByNumberAndPhone(orderNumber, phone);

  if (!order) {
    recordFailedAttempt(ip, { maxFailedAttempts: 5, lockoutMs: 15 * 60000 });
    return NextResponse.json(
      {
        success: false,
        error: "No order found matching the provided reference and mobile number.",
      },
      { status: 404 }
    );
  }

  // 4. Successful Verification
  recordSuccessfulAttempt(ip);

  // Generate cryptographically signed token for receipt access
  const accessToken = generateOrderAccessToken(order.id, order.createdAt);

  // Return strictly sanitized public status response (no full address, no email, no raw phone, no DB IDs)
  return NextResponse.json({
    success: true,
    tracking: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      destinationCity: order.shippingAddress.city,
      destinationState: order.shippingAddress.state,
      maskedRecipientName: maskName(order.shippingAddress.fullName || order.customerName),
      maskedPhone: maskPhone(order.customerPhone),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: order.totalAmount,
      itemsSummary: order.items.map((i) => ({
        productName: i.productName,
        size: i.size,
        colour: i.colour,
        quantity: i.quantity,
      })),
    },
    orderId: order.id,
    accessToken,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ip = getClientIp(req);
  return handleLookup(searchParams.get("orderNumber"), searchParams.get("phone"), ip);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = getClientIp(req);
    return handleLookup(body.orderNumber, body.phone, ip);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON request body." }, { status: 400 });
  }
}
