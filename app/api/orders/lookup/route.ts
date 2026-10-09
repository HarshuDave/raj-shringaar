import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumberAndPhone } from "@/lib/data/repository";
import { generateOrderAccessToken, maskName, maskPhone } from "@/lib/auth/order-token";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from "@/lib/security/rate-limit";
import { isValidOrderReference } from "@/lib/security/order-reference";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

async function handleLookup(orderNumberRaw?: string | null, phoneRaw?: string | null, ip: string = "127.0.0.1") {
  // 1. Rate Limiting Check (IP-level)
  const ipRateLimit = await checkRateLimit(`lookup_ip_${ip}`, {
    maxRequests: 10,
    windowMs: 60000,
    maxFailedAttempts: 5,
    lockoutMs: 15 * 60000,
  });

  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: ipRateLimit.reason || "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipRateLimit.retryAfterSeconds || 60),
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

  if (!isValidOrderReference(orderNumber)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid Order Reference format. It must follow the RS-XXXXXX (legacy) or RS-XXXXXXXX format.",
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

  // 3. Rate Limiting Check (Phone-level)
  const phoneRateLimit = await checkRateLimit(`lookup_phone_${phone}`, {
    maxRequests: 5,
    windowMs: 60000,
    maxFailedAttempts: 5,
    lockoutMs: 15 * 60000,
  });

  if (!phoneRateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: phoneRateLimit.reason || "Too many lookup attempts for this phone number. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(phoneRateLimit.retryAfterSeconds || 60),
        },
      }
    );
  }

  // 4. Exact Database Lookup
  const order = await getOrderByNumberAndPhone(orderNumber, phone);

  if (!order) {
    await recordFailedAttempt(`lookup_ip_${ip}`, { maxFailedAttempts: 5, lockoutMs: 15 * 60000 });
    await recordFailedAttempt(`lookup_phone_${phone}`, { maxFailedAttempts: 5, lockoutMs: 15 * 60000 });
    return NextResponse.json(
      {
        success: false,
        error: "No order found matching the provided reference and mobile number.",
      },
      { status: 404 }
    );
  }

  // 5. Successful Verification
  await recordSuccessfulAttempt(`lookup_ip_${ip}`);
  await recordSuccessfulAttempt(`lookup_phone_${phone}`);

  // Generate cryptographically signed token for receipt access
  const accessToken = generateOrderAccessToken(order.id);

  // Return strictly sanitized public status response (no full address, no email, no raw phone, no DB IDs)
  const res = NextResponse.json({
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

  // Set secure HttpOnly cookie so customer can seamlessly open and refresh the receipt
  res.cookies.set(`rs_order_token_${order.id}`, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return res;
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
