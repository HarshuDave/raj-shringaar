import { Redis } from "@upstash/redis";

type RateLimitRecord = {
  count: number;
  resetAt: number;
  failedAttempts: number;
  lockedUntil?: number;
};

// In-memory fallback store (emergency fail-safe & local development)
const memoryStore = new Map<string, RateLimitRecord>();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetAt && (!record.lockedUntil || now > record.lockedUntil)) {
      memoryStore.delete(key);
    }
  }
}, 60000);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

let redisInstance: Redis | null = null;
let customRedisClient: any = null;

/**
 * Allows test suites to supply a simulated/mock Redis client to verify distributed logic
 * and failure behaviors without requiring external cloud credentials.
 */
export function setRedisClientForTesting(client: any) {
  customRedisClient = client;
}

export function resetRedisClientForTesting() {
  customRedisClient = null;
  redisInstance = null;
  memoryStore.clear();
}

function getRedisClient(): Redis | null {
  if (customRedisClient !== null) {
    return customRedisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redisInstance) {
    try {
      redisInstance = new Redis({ url, token });
    } catch (e) {
      console.error("[RateLimiter] Failed to initialize Upstash Redis client:", e);
      return null;
    }
  }

  return redisInstance;
}

export type RateLimitOptions = {
  maxRequests?: number;
  windowMs?: number;
  maxFailedAttempts?: number;
  lockoutMs?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
  source?: "distributed_redis" | "memory_fallback";
};

/**
 * In-memory rate limiting check (used directly in local dev or as fail-safe fallback).
 */
function checkRateLimitMemory(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const {
    maxRequests = 10,
    windowMs = 60000,
    maxFailedAttempts = 5,
    lockoutMs = 15 * 60000,
  } = options;

  const now = Date.now();
  let record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
      failedAttempts: record?.failedAttempts || 0,
      lockedUntil: record?.lockedUntil,
    };
    memoryStore.set(identifier, record);
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      reason: `Too many failed lookup attempts. Please try again in ${retryAfterSeconds} seconds.`,
      source: "memory_fallback",
    };
  }

  record.count++;
  if (record.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      reason: `Lookup request rate exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`,
      source: "memory_fallback",
    };
  }

  return { allowed: true, source: "memory_fallback" };
}

/**
 * Checks whether an identifier is within allowable rate-limiting boundaries.
 * 
 * Production architecture:
 * 1. Checks shared Upstash Redis instance (if configured) across all serverless lambdas.
 * 2. Checks active lockout key (rs_rl:locked:${identifier}).
 * 3. Enforces atomic request counter with expiration window (rs_rl:req:${identifier}).
 * 4. FAIL-SAFE: If Redis throws or is unreachable, does NOT silently leave the endpoint unrestricted;
 *    instead falls back to the instance memory limiter to actively throttle abuse.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const {
    maxRequests = 10,
    windowMs = 60000,
    lockoutMs = 15 * 60000,
  } = options;

  const redis = getRedisClient();

  if (!redis) {
    // Distributed credentials not provided: enforce via local in-memory rate limiter
    return checkRateLimitMemory(identifier, options);
  }

  try {
    const lockedKey = `rs_rl:locked:${identifier}`;
    const reqKey = `rs_rl:req:${identifier}`;

    // 1. Check shared lockout across serverless instances
    const lockedTtl = await redis.ttl(lockedKey);
    if (lockedTtl > 0) {
      return {
        allowed: false,
        retryAfterSeconds: lockedTtl,
        reason: `Too many failed lookup attempts. Please try again in ${lockedTtl} seconds.`,
        source: "distributed_redis",
      };
    }

    // 2. Atomic request increment and TTL set
    const pipeline = redis.pipeline();
    pipeline.incr(reqKey);
    pipeline.ttl(reqKey);
    const results = await pipeline.exec<[number, number]>();
    const count = Number(results[0]);
    const ttl = Number(results[1]);

    const windowSec = Math.ceil(windowMs / 1000);
    if (ttl < 0) {
      await redis.expire(reqKey, windowSec);
    }

    if (count > maxRequests) {
      const retryAfterSeconds = ttl > 0 ? ttl : windowSec;
      return {
        allowed: false,
        retryAfterSeconds,
        reason: `Lookup request rate exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`,
        source: "distributed_redis",
      };
    }

    return { allowed: true, source: "distributed_redis" };
  } catch (err) {
    console.error("[RateLimiter] Distributed Redis check failed, falling back to emergency local rate limiter:", err);
    // FAIL SAFE: Never allow an unrestricted endpoint. Evaluate against local emergency memory limiter.
    return checkRateLimitMemory(identifier, options);
  }
}

/**
 * Record a failed attempt (e.g. wrong order number or non-matching phone).
 * Increments failed counter across serverless instances and locks key upon reaching threshold.
 */
export async function recordFailedAttempt(
  identifier: string,
  options: {
    maxFailedAttempts?: number;
    lockoutMs?: number;
  } = {}
): Promise<void> {
  const { maxFailedAttempts = 5, lockoutMs = 15 * 60000 } = options;
  const lockoutSec = Math.ceil(lockoutMs / 1000);

  // Always record locally as baseline
  const now = Date.now();
  let record = memoryStore.get(identifier);
  if (!record) {
    record = { count: 1, resetAt: now + 60000, failedAttempts: 0 };
    memoryStore.set(identifier, record);
  }
  record.failedAttempts++;
  if (record.failedAttempts >= maxFailedAttempts) {
    record.lockedUntil = now + lockoutMs;
  }

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const failedKey = `rs_rl:failed:${identifier}`;
    const lockedKey = `rs_rl:locked:${identifier}`;

    const pipeline = redis.pipeline();
    pipeline.incr(failedKey);
    pipeline.ttl(failedKey);
    const results = await pipeline.exec<[number, number]>();
    const failedCount = Number(results[0]);
    const ttl = Number(results[1]);

    if (ttl < 0) {
      await redis.expire(failedKey, lockoutSec);
    }

    if (failedCount >= maxFailedAttempts) {
      await redis.set(lockedKey, "1", { ex: lockoutSec });
    }
  } catch (err) {
    console.error("[RateLimiter] Failed to record failure in Redis, fallback recorded in memory:", err);
  }
}

/**
 * Clear failed attempt count after a successful verification.
 */
export async function recordSuccessfulAttempt(identifier: string): Promise<void> {
  // Clear local memory
  const record = memoryStore.get(identifier);
  if (record) {
    record.failedAttempts = 0;
    record.lockedUntil = undefined;
  }

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const failedKey = `rs_rl:failed:${identifier}`;
    const lockedKey = `rs_rl:locked:${identifier}`;

    const pipeline = redis.pipeline();
    pipeline.del(failedKey);
    pipeline.del(lockedKey);
    await pipeline.exec();
  } catch (err) {
    console.error("[RateLimiter] Failed to reset failures in Redis:", err);
  }
}
