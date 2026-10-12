import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getOrderTokenSecret } from "@/lib/auth/order-token";
import { normalizeIndianPhone } from "@/lib/security/phone";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from "@/lib/security/rate-limit";
import { sendMobileOtpSms } from "@/lib/sms/provider";

export const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60; // 60 seconds between sends
export const OTP_DAILY_PHONE_LIMIT = 8; // Max 8 OTP dispatches per phone per 24h

export type OtpChallengeRecord = {
  id: string;
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  consumedAt: Date | null;
  invalidatedAt: Date | null;
  ipAddress: string | null;
  createdAt: Date;
};

export interface OtpChallengeStore {
  findLatestByPhone(phone: string): Promise<OtpChallengeRecord | null>;
  countSentSince(phone: string, since: Date): Promise<number>;
  invalidateActiveForPhone(phone: string, now: Date): Promise<void>;
  createChallenge(data: {
    phone: string;
    otpHash: string;
    expiresAt: Date;
    maxAttempts: number;
    ipAddress?: string;
  }): Promise<OtpChallengeRecord>;
  invalidateChallengeById(id: string, now: Date): Promise<void>;
  atomicIncrementAttempt(id: string, now: Date): Promise<boolean>;
  atomicConsumeChallenge(id: string, now: Date): Promise<boolean>;
}

const prismaOtpStore: OtpChallengeStore = {
  async findLatestByPhone(phone) {
    return await prisma.otpChallenge.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
  },

  async countSentSince(phone, since) {
    return await prisma.otpChallenge.count({
      where: {
        phone,
        createdAt: { gte: since },
        invalidatedAt: null, // Undelivered/aborted challenges don't penalize user
      },
    });
  },

  async invalidateActiveForPhone(phone, now) {
    await prisma.otpChallenge.updateMany({
      where: {
        phone,
        consumedAt: null,
        invalidatedAt: null,
      },
      data: {
        invalidatedAt: now,
      },
    });
  },

  async createChallenge(data) {
    return await prisma.otpChallenge.create({
      data: {
        phone: data.phone,
        otpHash: data.otpHash,
        expiresAt: data.expiresAt,
        maxAttempts: data.maxAttempts,
        ipAddress: data.ipAddress || null,
      },
    });
  },

  async invalidateChallengeById(id, now) {
    await prisma.otpChallenge.updateMany({
      where: { id, invalidatedAt: null },
      data: { invalidatedAt: now },
    });
  },

  async atomicIncrementAttempt(id, now) {
    // Atomically increment attempts only if challenge is still active, unconsumed, unexpired, and below maxAttempts
    const res = await prisma.otpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: OTP_MAX_ATTEMPTS },
      },
      data: {
        attempts: { increment: 1 },
      },
    });
    return res.count === 1;
  },

  async atomicConsumeChallenge(id, now) {
    const res = await prisma.otpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        invalidatedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        consumedAt: now,
      },
    });
    return res.count === 1;
  },
};

let activeOtpStore: OtpChallengeStore = prismaOtpStore;

export function setOtpChallengeStoreForTesting(store: OtpChallengeStore | null) {
  activeOtpStore = store || prismaOtpStore;
}

/**
 * Generates a cryptographically random 6-digit OTP code (100000–999999).
 */
export function generateCryptographicOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Computes a domain-separated HMAC-SHA256 hash of the OTP bound to the normalized phone number.
 * Plaintext OTPs are never stored in the database.
 */
export function hashOtpForPhone(normalizedPhone: string, otpCode: string): string {
  const secret = getOrderTokenSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`rs_customer_otp_v1:${normalizedPhone}:${otpCode}`)
    .digest("hex");
}

/**
 * Constant-time comparison of two hex HMAC digests.
 */
export function verifyOtpHashConstantTime(expectedHex: string, candidateHex: string): boolean {
  if (expectedHex.length !== candidateHex.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHex, "hex"),
      Buffer.from(candidateHex, "hex")
    );
  } catch {
    return false;
  }
}

export type RequestOtpResult = {
  success: boolean;
  normalizedPhone?: string;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
  error?: string;
};

/**
 * Generates, hashes, stores, and dispatches a mobile OTP challenge.
 * Enforces IP rate limits, phone rate limits, 60-second resend cooldown, and 24-hour daily cap.
 * Never exposes whether the phone number already has an account.
 */
export async function requestCustomerOtp(params: {
  rawPhone: string;
  ipAddress: string;
}): Promise<RequestOtpResult> {
  const normalizedPhone = normalizeIndianPhone(params.rawPhone);
  if (!normalizedPhone) {
    return {
      success: false,
      error: "Please enter a valid 10-digit Indian mobile number.",
    };
  }

  const ip = params.ipAddress || "127.0.0.1";

  // 1. Distributed / Fallback Rate Limiting (IP + Phone + Daily)
  const ipLimit = await checkRateLimit(`otp_req_ip_${ip}`, {
    maxRequests: 6,
    windowMs: 10 * 60 * 1000, // 6 per 10 mins per IP
    maxFailedAttempts: 10,
    lockoutMs: 15 * 60 * 1000,
  });
  if (!ipLimit.allowed) {
    return {
      success: false,
      cooldownSeconds: ipLimit.retryAfterSeconds || 60,
      error: "Too many OTP requests from this network. Please wait before trying again.",
    };
  }

  const phoneBurstLimit = await checkRateLimit(`otp_req_phone_${normalizedPhone}`, {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 3 per 10 mins per phone
    maxFailedAttempts: 5,
    lockoutMs: 15 * 60 * 1000,
  });
  if (!phoneBurstLimit.allowed) {
    return {
      success: false,
      cooldownSeconds: phoneBurstLimit.retryAfterSeconds || 60,
      error: "Too many OTP requests for this mobile number. Please wait a few minutes.",
    };
  }

  const now = new Date();

  // 2. Database-enforced Resend Cooldown (60 seconds)
  const latestChallenge = await activeOtpStore.findLatestByPhone(normalizedPhone);
  if (latestChallenge && latestChallenge.invalidatedAt === null && latestChallenge.consumedAt === null) {
    const elapsedSeconds = Math.floor((now.getTime() - latestChallenge.createdAt.getTime()) / 1000);
    if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
      const remainingCooldown = OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      return {
        success: false,
        cooldownSeconds: remainingCooldown,
        error: `Please wait ${remainingCooldown} seconds before requesting another OTP.`,
      };
    }
  }

  // 3. Database-enforced 24-Hour Daily Limit
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sentLast24h = await activeOtpStore.countSentSince(normalizedPhone, twentyFourHoursAgo);
  if (sentLast24h >= OTP_DAILY_PHONE_LIMIT) {
    return {
      success: false,
      error: "Daily OTP limit reached for this mobile number. Please try again tomorrow or use Track Order.",
    };
  }

  // 4. Invalidate any previous active challenges for this phone
  await activeOtpStore.invalidateActiveForPhone(normalizedPhone, now);

  // 5. Generate CSPRNG OTP and store only its HMAC-SHA256 hash
  const otpCode = generateCryptographicOtp();
  const otpHash = hashOtpForPhone(normalizedPhone, otpCode);
  const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);

  const challenge = await activeOtpStore.createChallenge({
    phone: normalizedPhone,
    otpHash,
    expiresAt,
    maxAttempts: OTP_MAX_ATTEMPTS,
    ipAddress: ip,
  });

  // 6. Dispatch via real SMS OTP provider
  const delivery = await sendMobileOtpSms(normalizedPhone, otpCode);
  if (!delivery.delivered) {
    // Invalidate the challenge immediately so undelivered OTPs cannot remain active or lock cooldown
    await activeOtpStore.invalidateChallengeById(challenge.id, new Date()).catch(() => {});
    return {
      success: false,
      error:
        "Unable to send verification SMS right now. Please try again later or continue with guest checkout.",
    };
  }

  return {
    success: true,
    normalizedPhone,
    cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    expiresInSeconds: OTP_TTL_SECONDS,
  };
}

export type VerifyOtpResult = {
  verified: boolean;
  normalizedPhone?: string;
  error?: string;
};

const GENERIC_VERIFY_ERROR =
  "Invalid or expired verification code. Please check the code or request a new OTP.";

/**
 * Verifies a customer OTP code atomically and prevents concurrent brute-force or replay attacks.
 */
export async function verifyCustomerOtp(params: {
  rawPhone: string;
  otpInput: string;
  ipAddress: string;
}): Promise<VerifyOtpResult> {
  const normalizedPhone = normalizeIndianPhone(params.rawPhone);
  const cleanOtp = (params.otpInput || "").trim();

  if (!normalizedPhone || !/^\d{6}$/.test(cleanOtp)) {
    return {
      verified: false,
      error: "Please enter a valid 10-digit mobile number and 6-digit verification code.",
    };
  }

  const ip = params.ipAddress || "127.0.0.1";

  // 1. Rate Limit Check (IP + Phone)
  const ipVerifyLimit = await checkRateLimit(`otp_verify_ip_${ip}`, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    maxFailedAttempts: 8,
    lockoutMs: 15 * 60 * 1000,
  });
  if (!ipVerifyLimit.allowed) {
    return {
      verified: false,
      error: "Too many verification attempts. Please wait before trying again.",
    };
  }

  const phoneVerifyLimit = await checkRateLimit(`otp_verify_phone_${normalizedPhone}`, {
    maxRequests: 8,
    windowMs: 15 * 60 * 1000,
    maxFailedAttempts: 5,
    lockoutMs: 15 * 60 * 1000,
  });
  if (!phoneVerifyLimit.allowed) {
    return {
      verified: false,
      error: "Too many failed verification attempts. Please wait or request a new OTP.",
    };
  }

  const now = new Date();
  const challenge = await activeOtpStore.findLatestByPhone(normalizedPhone);

  // 2. Check challenge existence, status, expiry, and attempt ceiling
  if (
    !challenge ||
    challenge.consumedAt !== null ||
    challenge.invalidatedAt !== null ||
    challenge.expiresAt <= now ||
    challenge.attempts >= challenge.maxAttempts
  ) {
    await recordFailedAttempt(`otp_verify_ip_${ip}`);
    await recordFailedAttempt(`otp_verify_phone_${normalizedPhone}`);
    return {
      verified: false,
      error: GENERIC_VERIFY_ERROR,
    };
  }

  // 3. Concurrency-safe atomic attempt increment
  // Ensures concurrent requests cannot bypass the 5-attempt ceiling
  const attemptIncremented = await activeOtpStore.atomicIncrementAttempt(challenge.id, now);
  if (!attemptIncremented) {
    await recordFailedAttempt(`otp_verify_ip_${ip}`);
    await recordFailedAttempt(`otp_verify_phone_${normalizedPhone}`);
    return {
      verified: false,
      error: GENERIC_VERIFY_ERROR,
    };
  }

  // 4. Constant-time HMAC verification
  const candidateHash = hashOtpForPhone(normalizedPhone, cleanOtp);
  const isMatch = verifyOtpHashConstantTime(challenge.otpHash, candidateHash);

  if (!isMatch) {
    // If this attempt reached maxAttempts, mark challenge invalidated
    if (challenge.attempts + 1 >= challenge.maxAttempts) {
      await activeOtpStore.invalidateChallengeById(challenge.id, now).catch(() => {});
    }
    await recordFailedAttempt(`otp_verify_ip_${ip}`);
    await recordFailedAttempt(`otp_verify_phone_${normalizedPhone}`);
    return {
      verified: false,
      error: GENERIC_VERIFY_ERROR,
    };
  }

  // 5. Atomic single-use consumption (prevents OTP replay under concurrent requests)
  const consumed = await activeOtpStore.atomicConsumeChallenge(challenge.id, now);
  if (!consumed) {
    return {
      verified: false,
      error: GENERIC_VERIFY_ERROR,
    };
  }

  await recordSuccessfulAttempt(`otp_verify_ip_${ip}`);
  await recordSuccessfulAttempt(`otp_verify_phone_${normalizedPhone}`);

  return {
    verified: true,
    normalizedPhone,
  };
}
