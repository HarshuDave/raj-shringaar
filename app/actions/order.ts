"use server";

import { createOrder } from "@/lib/data/repository";
import { OrderItem, ShippingAddress } from "@/lib/types";

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

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to process order." };
  }
}
