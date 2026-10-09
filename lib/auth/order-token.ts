import crypto from "crypto";

const ORDER_TOKEN_SECRET =
  process.env.ORDER_TOKEN_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "raj-shringaar-devotional-order-salt-2026";

/**
 * Generate a cryptographically secure, tamper-proof order access token.
 * Derived from the unique order ID, creation timestamp, and server-side secret.
 */
export function generateOrderAccessToken(orderId: string, createdAt: string): string {
  return crypto
    .createHmac("sha256", ORDER_TOKEN_SECRET)
    .update(`${orderId}:${createdAt}`)
    .digest("hex");
}

/**
 * Verify whether the provided access token matches the expected signature for the order.
 * Uses timingSafeEqual to guard against timing analysis attacks.
 */
export function verifyOrderAccessToken(
  orderId: string,
  createdAt: string,
  tokenCandidate?: string | null
): boolean {
  if (!tokenCandidate || typeof tokenCandidate !== "string") {
    return false;
  }

  const expected = generateOrderAccessToken(orderId, createdAt);
  if (expected.length !== tokenCandidate.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(tokenCandidate, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Mask a 10-digit phone number for public display (e.g. "••••••7197").
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `••••••${digits.slice(-4)}`;
}

/**
 * Mask a full name for public display (e.g. "Harshu Dave" -> "H***** D***").
 */
export function maskName(name: string): string {
  if (!name || name.trim().length === 0) return "Devotee";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 2) return `${part[0]}*`;
      return `${part[0]}${"*".repeat(part.length - 2)}${part[part.length - 1]}`;
    })
    .join(" ");
}
