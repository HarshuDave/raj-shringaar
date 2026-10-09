import crypto from "crypto";

/**
 * Retrieves the cryptographic secret key for signing order access tokens.
 * Enforces strict presence and strength in production environments.
 */
export function getOrderTokenSecret(): string {
  const secret = process.env.ORDER_TOKEN_SECRET;
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

  if (isProduction) {
    if (!secret || secret.trim().length === 0) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: ORDER_TOKEN_SECRET is required in production. Refusing to operate with fallback secrets."
      );
    }
    if (secret.length < 32) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: ORDER_TOKEN_SECRET must be at least 32 characters in production."
      );
    }
    return secret;
  }

  // Non-production fallback (development and local test suite only)
  return secret || "raj-shringaar-dev-only-secret-do-not-use-in-production-min32chars!";
}

// Default token validity: 7 days (in seconds)
export const DEFAULT_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Generate a cryptographically secure, tamper-proof order access token.
 * Token structure: `<orderId>.<expiresAt>.<hmacSignature>`
 * 
 * - orderId: bound strictly to the specific order.
 * - expiresAt: UNIX epoch in seconds.
 * - hmacSignature: HMAC-SHA256 signature over `<orderId>.<expiresAt>`.
 */
export function generateOrderAccessToken(
  orderId: string,
  ttlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS
): string {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("Invalid orderId for token generation.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${orderId}.${expiresAt}`;
  const secret = getOrderTokenSecret();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

/**
 * Verify whether the provided access token:
 * 1. Has valid syntax and structure (`<tokenOrderId>.<expiresAt>.<signature>`)
 * 2. Matches the expected order ID (guarantees cross-order token isolation)
 * 3. Has not expired
 * 4. Carries a valid, un-tampered server-side HMAC-SHA256 signature
 *
 * Uses constant-time comparison (timingSafeEqual) to prevent timing attacks.
 */
export function verifyOrderAccessToken(
  expectedOrderId: string,
  tokenCandidate?: string | null
): boolean {
  if (!tokenCandidate || typeof tokenCandidate !== "string") {
    return false;
  }

  const parts = tokenCandidate.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [tokenOrderId, expiresAtStr, providedSignature] = parts;

  // 1. Order Binding Check: Token must be issued for this exact order ID
  if (tokenOrderId !== expectedOrderId) {
    return false;
  }

  // 2. Expiration Check
  const expiresAt = parseInt(expiresAtStr, 10);
  if (!Number.isFinite(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
    return false;
  }

  // 3. Signature Verification
  const payload = `${tokenOrderId}.${expiresAtStr}`;
  let secret: string;
  try {
    secret = getOrderTokenSecret();
  } catch {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (expectedSignature.length !== providedSignature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(providedSignature, "hex")
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
