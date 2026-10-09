import crypto from "crypto";

// Unambiguous base-32 character set (omits 0, O, 1, I to eliminate visual ambiguity on screens/receipts)
const REFERENCE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const REFERENCE_LENGTH = 8;

/**
 * Generates a cryptographically random, non-sequential order reference.
 * Format: RS-XXXXXXXX (e.g. RS-8K3P9M2X)
 * 
 * Entropy: 32^8 = 2^40 ≈ 1,099,511,627,776 unique combinations.
 * Generated using Node's crypto CSPRNG to guarantee uniform distribution and unpredictability.
 */
export function generateOrderReference(): string {
  const bytes = crypto.randomBytes(REFERENCE_LENGTH);
  let code = "";
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    const index = bytes[i] % REFERENCE_CHARSET.length;
    code += REFERENCE_CHARSET[index];
  }
  return `RS-${code}`;
}

/**
 * Validates whether an order reference adheres to either:
 * 1. Legacy format: RS-XXXXXX (6 decimal digits, e.g. RS-285789)
 * 2. Current secure format: RS-XXXXXXXX (8 alphanumeric characters, e.g. RS-8K3P9M2X)
 * 
 * Guarantees backward compatibility with all historical customer orders while
 * enforcing strict validation against malicious or malformed input.
 */
export function isValidOrderReference(ref?: string | null): boolean {
  if (!ref || typeof ref !== "string") {
    return false;
  }
  const trimmed = ref.trim().toUpperCase();
  return /^RS-([0-9]{6}|[A-Z0-9]{8})$/.test(trimmed);
}
