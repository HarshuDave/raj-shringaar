import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const CUSTOMER_SESSION_COOKIE = "rs_customer_session";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type AuthenticatedCustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  verifiedPhone: string;
  phoneVerified: boolean;
  phoneVerifiedAt: Date | null;
  sessionId: string;
};

/**
 * Generates a high-entropy 256-bit (32-byte) opaque session token.
 */
export function generateRawSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes the SHA-256 hash of a raw session token for database storage.
 * Raw session tokens are never stored in the database.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export interface CustomerSessionStore {
  createSession(data: {
    customerId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string }>;
  findValidSessionByHash(tokenHash: string, now: Date): Promise<{
    id: string;
    customerId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    customer: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      verifiedPhone: string | null;
      phoneVerified: boolean;
      phoneVerifiedAt: Date | null;
    };
  } | null>;
  revokeSessionByHash(tokenHash: string, now: Date): Promise<void>;
  revokeAllCustomerSessions(customerId: string, now: Date): Promise<void>;
}

const prismaSessionStore: CustomerSessionStore = {
  async createSession(data) {
    return await prisma.customerSession.create({
      data: {
        customerId: data.customerId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      select: { id: true },
    });
  },

  async findValidSessionByHash(tokenHash, now) {
    const session = await prisma.customerSession.findUnique({
      where: { tokenHash },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verifiedPhone: true,
            phoneVerified: true,
            phoneVerifiedAt: true,
          },
        },
      },
    });

    if (!session) return null;
    if (session.revokedAt !== null) return null;
    if (session.expiresAt <= now) return null;
    return session;
  },

  async revokeSessionByHash(tokenHash, now) {
    await prisma.customerSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: now },
    });
  },

  async revokeAllCustomerSessions(customerId, now) {
    await prisma.customerSession.updateMany({
      where: { customerId, revokedAt: null },
      data: { revokedAt: now },
    });
  },
};

let activeSessionStore: CustomerSessionStore = prismaSessionStore;

export function setCustomerSessionStoreForTesting(store: CustomerSessionStore | null) {
  activeSessionStore = store || prismaSessionStore;
}

/**
 * Creates a new database-backed session, invalidating any prior session token
 * present on the request (session rotation to prevent session fixation).
 */
export async function createCustomerSession(params: {
  customerId: string;
  existingRawToken?: string | null;
  ipAddress?: string;
  userAgent?: string;
  ttlSeconds?: number;
}): Promise<{ rawToken: string; expiresAt: Date; sessionId: string }> {
  const now = new Date();

  // Session fixation protection: if caller had an existing token, revoke it before issuing new one
  if (params.existingRawToken && typeof params.existingRawToken === "string") {
    const oldHash = hashSessionToken(params.existingRawToken);
    await activeSessionStore.revokeSessionByHash(oldHash, now).catch(() => {});
  }

  const rawToken = generateRawSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const ttl = params.ttlSeconds ?? SESSION_TTL_SECONDS;
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  const created = await activeSessionStore.createSession({
    customerId: params.customerId,
    tokenHash,
    expiresAt,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    rawToken,
    expiresAt,
    sessionId: created.id,
  };
}

/**
 * Verifies a raw session token against the database session store.
 * Enforces:
 * - Token syntax (64 hex chars)
 * - Hash existence in CustomerSession table
 * - Not revoked (revokedAt === null)
 * - Not expired (expiresAt > now)
 * - Associated Customer has phoneVerified === true and non-null verifiedPhone
 */
export async function verifyCustomerSessionToken(
  rawToken?: string | null
): Promise<AuthenticatedCustomer | null> {
  if (!rawToken || typeof rawToken !== "string" || !/^[a-f0-9]{64}$/i.test(rawToken)) {
    return null;
  }

  const now = new Date();
  const tokenHash = hashSessionToken(rawToken);
  const session = await activeSessionStore.findValidSessionByHash(tokenHash, now);

  if (!session) {
    return null;
  }

  const { customer } = session;
  if (!customer || !customer.phoneVerified || !customer.verifiedPhone) {
    return null;
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    verifiedPhone: customer.verifiedPhone,
    phoneVerified: customer.phoneVerified,
    phoneVerifiedAt: customer.phoneVerifiedAt,
    sessionId: session.id,
  };
}

/**
 * Revokes a session token server-side in the database.
 */
export async function revokeCustomerSessionToken(rawToken?: string | null): Promise<void> {
  if (!rawToken || typeof rawToken !== "string" || !/^[a-f0-9]{64}$/i.test(rawToken)) {
    return;
  }
  const tokenHash = hashSessionToken(rawToken);
  await activeSessionStore.revokeSessionByHash(tokenHash, new Date());
}

/**
 * Sets the HttpOnly, Secure (in prod), SameSite=Lax session cookie on Next.js cookieStore.
 */
export async function setCustomerSessionCookie(rawToken: string, maxAgeSeconds = SESSION_TTL_SECONDS) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/**
 * Reads and verifies the current request's customer session from cookies().
 */
export async function getAuthenticatedCustomer(): Promise<AuthenticatedCustomer | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (!rawToken) return null;
    return await verifyCustomerSessionToken(rawToken);
  } catch {
    return null;
  }
}

/**
 * Revokes the current customer session in the database and deletes the session cookie.
 */
export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (rawToken) {
    await revokeCustomerSessionToken(rawToken).catch(() => {});
  }
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}
