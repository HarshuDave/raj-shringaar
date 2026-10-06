"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/data/repository";
import { OrderStatus } from "@/lib/types";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const updated = await updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
