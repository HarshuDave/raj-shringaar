"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@rajShringaar";
const COOKIE_NAME = "rs_admin_auth";

export async function loginAdminAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Incorrect admin password." };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "authenticated";
}
