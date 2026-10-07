"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/app/actions/admin-auth";
import { updateOrderStatus } from "@/lib/data/repository";
import { OrderStatus } from "@/lib/types";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const updated = await updateOrderStatus(orderId, status);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
