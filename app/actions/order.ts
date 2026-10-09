"use server";

import { cookies, headers } from "next/headers";
import { createOrder, getOrderById } from "@/lib/data/repository";
import { OrderItem, ShippingAddress } from "@/lib/types";
import { generateOrderAccessToken } from "@/lib/auth/order-token";
import { checkRateLimit, recordFailedAttempt, recordSuccessfulAttempt } from "@/lib/security/rate-limit";

export type PlaceOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
};

export async function placeOrderAction(input: PlaceOrderInput) {
  try {
    if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
      return { success: false, error: "Your bag is empty." };
    }

    const trimmedName = input.customerName?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Please provide a valid customer name." };
    }

    const trimmedEmail = input.customerEmail?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const cleanPhone = input.customerPhone?.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, error: "Please provide a valid 10-digit mobile number." };
    }

    const addr = input.shippingAddress;
    if (!addr) {
      return { success: false, error: "Shipping address is missing." };
    }

    const trimmedAddress1 = addr.addressLine1?.trim();
    if (!trimmedAddress1 || trimmedAddress1.length < 5) {
      return { success: false, error: "Please provide a valid street address." };
    }

    const trimmedCity = addr.city?.trim();
    if (!trimmedCity) {
      return { success: false, error: "Please provide a delivery city." };
    }

    const trimmedState = addr.state?.trim();
    if (!trimmedState) {
      return { success: false, error: "Please provide a delivery state." };
    }

    const cleanPincode = addr.pincode?.replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length !== 6) {
      return { success: false, error: "Please provide a valid 6-digit postal PIN code." };
    }

    // Validate each cart item
    for (const item of input.items) {
      if (!item.variantId || !item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { success: false, error: "Invalid item quantity in bag." };
      }
    }

    // Create order with server-side inventory deduction
    const order = await createOrder({
      customerName: trimmedName,
      customerEmail: trimmedEmail,
      customerPhone: cleanPhone,
      shippingAddress: {
        ...addr,
        fullName: trimmedName,
        email: trimmedEmail,
        phone: cleanPhone,
        addressLine1: trimmedAddress1,
        addressLine2: addr.addressLine2?.trim() || "",
        city: trimmedCity,
        state: trimmedState,
        pincode: cleanPincode,
      },
      items: input.items,
      totalAmount: input.totalAmount,
      orderStatus: "Confirmed",
      paymentStatus: "Paid", // Demo prepaid status until Razorpay keys plugged in
      paymentMethod: "Online (Prepaid)",
    });

    // Generate cryptographic order access token for the purchaser
    const accessToken = generateOrderAccessToken(order.id, order.createdAt);

    // Set secure httpOnly cookie so the user has immediate, seamless access to the receipt
    const cookieStore = await cookies();
    cookieStore.set(`rs_order_token_${order.id}`, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessToken,
    };
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to process order." };
  }
}

/**
 * Server action to verify ownership of an order and unlock the full receipt.
 * Used when a visitor arrives at /order-confirmation/[orderId] without an existing access token.
 */
export async function verifyOrderReceiptAccessAction(orderId: string, phoneInput: string) {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : headerStore.get("x-real-ip") || "127.0.0.1";

    const rateLimit = checkRateLimit(`receipt_verify_${ip}`, {
      maxRequests: 5,
      windowMs: 60000,
      maxFailedAttempts: 5,
      lockoutMs: 15 * 60000,
    });

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: rateLimit.reason || "Too many verification attempts. Please wait.",
      };
    }

    const cleanPhone = phoneInput.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    const order = await getOrderById(orderId);
    if (!order) {
      recordFailedAttempt(`receipt_verify_${ip}`);
      return { success: false, error: "Order not found." };
    }

    const orderPhone = order.customerPhone.replace(/\D/g, "");
    if (orderPhone !== cleanPhone) {
      recordFailedAttempt(`receipt_verify_${ip}`);
      return {
        success: false,
        error: "The mobile number entered does not match this order reference.",
      };
    }

    recordSuccessfulAttempt(`receipt_verify_${ip}`);

    // Generate token and set session cookie
    const accessToken = generateOrderAccessToken(order.id, order.createdAt);
    const cookieStore = await cookies();
    cookieStore.set(`rs_order_token_${order.id}`, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return { success: true, accessToken };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to verify receipt access." };
  }
}
