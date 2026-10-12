"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requestCustomerOtp, verifyCustomerOtp } from "@/lib/auth/customer-otp";
import { resolveVerifiedCustomerAndLinkOrders } from "@/lib/auth/customer-order-linking";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSession,
  destroyCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/auth/customer-session";

async function getClientMetadata(): Promise<{ ip: string; userAgent: string }> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headerStore.get("x-real-ip") || "127.0.0.1";
  const userAgent = headerStore.get("user-agent") || "unknown";
  return { ip, userAgent };
}

/**
 * Server action to request a mobile OTP for customer sign-in.
 * Never returns or logs the OTP value.
 */
export async function sendCustomerOtpAction(phoneInput: string): Promise<{
  success: boolean;
  normalizedPhone?: string;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
  error?: string;
}> {
  try {
    const { ip } = await getClientMetadata();
    return await requestCustomerOtp({
      rawPhone: phoneInput,
      ipAddress: ip,
    });
  } catch {
    return {
      success: false,
      error: "Unable to process OTP request right now. Please try again later.",
    };
  }
}

/**
 * Server action to verify a mobile OTP, resolve/create the verified Customer identity,
 * link eligible historical guest orders safely, and issue an HttpOnly session cookie.
 */
export async function verifyCustomerOtpAndLoginAction(
  phoneInput: string,
  otpInput: string
): Promise<{
  success: boolean;
  linkedOrderCount?: number;
  error?: string;
}> {
  try {
    const { ip, userAgent } = await getClientMetadata();

    // 1. Verify OTP server-side atomically
    const verifyRes = await verifyCustomerOtp({
      rawPhone: phoneInput,
      otpInput,
      ipAddress: ip,
    });

    if (!verifyRes.verified || !verifyRes.normalizedPhone) {
      return {
        success: false,
        error:
          verifyRes.error ||
          "Invalid or expired verification code. Please check the code or request a new OTP.",
      };
    }

    // 2. Resolve verified Customer identity & link eligible historical guest orders
    const linkReport = await resolveVerifiedCustomerAndLinkOrders({
      rawPhone: verifyRes.normalizedPhone,
      otpVerified: true,
    });

    // 3. Rotate any prior session token and create a new hashed database session
    const cookieStore = await cookies();
    const existingRawToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

    const session = await createCustomerSession({
      customerId: linkReport.customer.id,
      existingRawToken,
      ipAddress: ip,
      userAgent,
    });

    // 4. Set HttpOnly, Secure (in prod), SameSite=Lax cookie
    await setCustomerSessionCookie(session.rawToken);

    revalidatePath("/account");

    return {
      success: true,
      linkedOrderCount: linkReport.linkedOrderCount,
    };
  } catch {
    return {
      success: false,
      error: "Unable to complete sign-in right now. Please try again.",
    };
  }
}

/**
 * Server action to log out the authenticated customer, revoking the database session
 * and clearing the session cookie.
 */
export async function logoutCustomerAction(): Promise<{ success: boolean }> {
  try {
    await destroyCustomerSession();
    revalidatePath("/account");
    return { success: true };
  } catch {
    return { success: false };
  }
}
