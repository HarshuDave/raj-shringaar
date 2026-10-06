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
    if (!input.items || input.items.length === 0) {
      return { success: false, error: "Your bag is empty." };
    }

    if (!input.customerName || !input.customerEmail || !input.customerPhone) {
      return { success: false, error: "Please provide all customer contact details." };
    }

    if (
      !input.shippingAddress.addressLine1 ||
      !input.shippingAddress.city ||
      !input.shippingAddress.state ||
      !input.shippingAddress.pincode
    ) {
      return { success: false, error: "Please complete all mandatory shipping address fields." };
    }

    // Create order with server-side inventory deduction
    const order = await createOrder({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
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
