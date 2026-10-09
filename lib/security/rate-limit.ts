type RateLimitRecord = {
  count: number;
  resetAt: number;
  failedAttempts: number;
  lockedUntil?: number;
};

const store = new Map<string, RateLimitRecord>();

// Periodic in-memory cleanup of expired records (unref so process exit is not blocked)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt && (!record.lockedUntil || now > record.lockedUntil)) {
      store.delete(key);
    }
  }
}, 60000);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

/**
 * Check whether a given client identifier is within allowable rate-limit boundaries.
 */
export function checkRateLimit(
  identifier: string,
  options: {
    maxRequests?: number;
    windowMs?: number;
    maxFailedAttempts?: number;
    lockoutMs?: number;
  } = {}
): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
  const {
    maxRequests = 10,
    windowMs = 60000,
    maxFailedAttempts = 5,
    lockoutMs = 15 * 60000,
  } = options;

  const now = Date.now();
  let record = store.get(identifier);

  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
      failedAttempts: record?.failedAttempts || 0,
      lockedUntil: record?.lockedUntil,
    };
    store.set(identifier, record);
  }

  // Check lockout
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      reason: `Too many failed lookup attempts. Please try again in ${retryAfterSeconds} seconds.`,
    };
  }

  // Check window request count
  record.count++;
  if (record.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      reason: `Lookup request rate exceeded. Please wait ${retryAfterSeconds} seconds before trying again.`,
    };
  }

  return { allowed: true };
}

/**
 * Record a failed attempt (e.g. wrong order number or non-matching phone).
 * Increments failed counter and applies temporary lockout upon reaching threshold.
 */
export function recordFailedAttempt(
  identifier: string,
  options: {
    maxFailedAttempts?: number;
    lockoutMs?: number;
  } = {}
) {
  const { maxFailedAttempts = 5, lockoutMs = 15 * 60000 } = options;
  const now = Date.now();
  let record = store.get(identifier);
  if (!record) {
    record = { count: 1, resetAt: now + 60000, failedAttempts: 0 };
    store.set(identifier, record);
  }
  record.failedAttempts++;
  if (record.failedAttempts >= maxFailedAttempts) {
    record.lockedUntil = now + lockoutMs;
  }
}

/**
 * Clear failed attempt count after a successful verification.
 */
export function recordSuccessfulAttempt(identifier: string) {
  const record = store.get(identifier);
  if (record) {
    record.failedAttempts = 0;
    record.lockedUntil = undefined;
  }
}
