/**
 * Indian Mobile Number Normalization & Validation Utility
 *
 * Enforces canonical 10-digit Indian mobile numbers (starting with 6, 7, 8, or 9).
 * Safely strips formatting (+91, 0091, leading 0, spaces, hyphens, parentheses)
 * only when the resulting national number is a valid 10-digit Indian mobile number.
 * Never performs partial or substring matching.
 */

export function normalizeIndianPhone(rawInput?: string | null): string | null {
  if (!rawInput || typeof rawInput !== "string") {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  // Reject inputs containing unexpected alphabetic characters
  if (/[a-zA-Z]/.test(trimmed)) {
    return null;
  }

  // Keep only digits and leading '+'
  const cleaned = trimmed.replace(/[\s\-().]/g, "");

  let digits = cleaned;
  if (digits.startsWith("+91")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0091")) {
    digits = digits.slice(4);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Must be strictly 10 digits and begin with 6, 7, 8, or 9 (TRAI Indian mobile numbering plan)
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return null;
  }

  // Reject trivial all-identical digit strings (e.g., 9999999999, 6666666666)
  if (/^(\d)\1{9}$/.test(digits)) {
    return null;
  }

  return digits;
}

export function isValidIndianPhone(rawInput?: string | null): boolean {
  return normalizeIndianPhone(rawInput) !== null;
}

export function formatIndianPhoneE164(normalized10DigitPhone: string): string {
  const clean = normalizeIndianPhone(normalized10DigitPhone);
  if (!clean) {
    throw new Error("Invalid Indian mobile number for E.164 formatting.");
  }
  return `+91${clean}`;
}
