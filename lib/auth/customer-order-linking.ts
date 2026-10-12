import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/security/phone";

export type CustomerIdentityRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  verifiedPhone: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: Date | null;
};

export type HistoricalOrderCandidate = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
};

export type OrderLinkingReport = {
  customer: CustomerIdentityRecord;
  isNewCustomer: boolean;
  linkedOrderCount: number;
  linkedOrderNumbers: string[];
  skippedAmbiguousOrderCount: number;
  skippedAlreadyLinkedCount: number;
  conflictingCustomerRecordsCount: number;
};

export interface CustomerLinkingDataAdapter {
  runInTransaction<T>(fn: (tx: CustomerLinkingTx) => Promise<T>): Promise<T>;
}

export interface CustomerLinkingTx {
  findCustomerByVerifiedPhone(verifiedPhone: string): Promise<CustomerIdentityRecord | null>;
  findCustomersByRawPhone(phoneVariants: string[]): Promise<CustomerIdentityRecord[]>;
  findVerifiedCustomersByEmails(emails: string[]): Promise<CustomerIdentityRecord[]>;
  createVerifiedCustomer(data: {
    verifiedPhone: string;
    phone: string;
    name: string;
    phoneVerifiedAt: Date;
  }): Promise<CustomerIdentityRecord>;
  updateCustomerName(customerId: string, name: string): Promise<CustomerIdentityRecord>;
  findCandidateOrdersByPhoneVariants(phoneVariants: string[]): Promise<HistoricalOrderCandidate[]>;
  linkOrdersToCustomer(orderIds: string[], customerId: string): Promise<number>;
}

const prismaLinkingAdapter: CustomerLinkingDataAdapter = {
  async runInTransaction<T>(fn: (tx: CustomerLinkingTx) => Promise<T>): Promise<T> {
    return await prisma.$transaction(async (prismaTx) => {
      const txAdapter: CustomerLinkingTx = {
        async findCustomerByVerifiedPhone(verifiedPhone) {
          return await prismaTx.customer.findUnique({
            where: { verifiedPhone },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verifiedPhone: true,
              phoneVerified: true,
              phoneVerifiedAt: true,
            },
          });
        },

        async findCustomersByRawPhone(phoneVariants) {
          return await prismaTx.customer.findMany({
            where: {
              OR: [
                { phone: { in: phoneVariants } },
                { verifiedPhone: { in: phoneVariants } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verifiedPhone: true,
              phoneVerified: true,
              phoneVerifiedAt: true,
            },
          });
        },

        async findVerifiedCustomersByEmails(emails) {
          if (emails.length === 0) return [];
          return await prismaTx.customer.findMany({
            where: {
              email: { in: emails },
              phoneVerified: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verifiedPhone: true,
              phoneVerified: true,
              phoneVerifiedAt: true,
            },
          });
        },

        async createVerifiedCustomer(data) {
          return await prismaTx.customer.create({
            data: {
              name: data.name,
              phone: data.phone,
              verifiedPhone: data.verifiedPhone,
              phoneVerified: true,
              phoneVerifiedAt: data.phoneVerifiedAt,
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verifiedPhone: true,
              phoneVerified: true,
              phoneVerifiedAt: true,
            },
          });
        },

        async updateCustomerName(customerId, name) {
          return await prismaTx.customer.update({
            where: { id: customerId },
            data: { name },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verifiedPhone: true,
              phoneVerified: true,
              phoneVerifiedAt: true,
            },
          });
        },

        async findCandidateOrdersByPhoneVariants(phoneVariants) {
          return await prismaTx.order.findMany({
            where: {
              customerPhone: { in: phoneVariants },
            },
            select: {
              id: true,
              orderNumber: true,
              customerId: true,
              customerName: true,
              customerEmail: true,
              customerPhone: true,
              shippingAddress: true,
            },
          });
        },

        async linkOrdersToCustomer(orderIds, customerId) {
          if (orderIds.length === 0) return 0;
          const res = await prismaTx.order.updateMany({
            where: {
              id: { in: orderIds },
              customerId: null, // Strictly guard against reassigning an already-linked order
            },
            data: {
              customerId,
            },
          });
          return res.count;
        },
      };

      return await fn(txAdapter);
    });
  },
};

let activeLinkingAdapter: CustomerLinkingDataAdapter = prismaLinkingAdapter;

export function setCustomerLinkingAdapterForTesting(adapter: CustomerLinkingDataAdapter | null) {
  activeLinkingAdapter = adapter || prismaLinkingAdapter;
}

/**
 * Builds exact formatting variants of a normalized 10-digit Indian mobile number
 * for exact database lookup (never substring or partial matching).
 */
export function buildExactPhoneLookupVariants(normalized10Digit: string): string[] {
  const part1 = normalized10Digit.slice(0, 5);
  const part2 = normalized10Digit.slice(5);
  return [
    normalized10Digit,
    `${part1} ${part2}`,
    `${part1}-${part2}`,
    `+91${normalized10Digit}`,
    `+91 ${normalized10Digit}`,
    `+91 ${part1} ${part2}`,
    `+91-${normalized10Digit}`,
    `+91-${part1}-${part2}`,
    `91${normalized10Digit}`,
    `0${normalized10Digit}`,
  ];
}

/**
 * Resolves (or creates) the verified Customer identity and safely links eligible
 * historical guest orders inside an atomic database transaction.
 *
 * Security & Integrity Guarantees:
 * 1. Requires `otpVerified === true` (unverified phones are strictly rejected).
 * 2. Never merges into unverified Customer rows based on unverified phone or email.
 * 3. Never uses partial/substring phone matching.
 * 4. Never modifies shippingAddress, customerName, customerEmail, or customerPhone on Order rows.
 * 5. Never reassigns an Order that already has `customerId !== null`.
 * 6. Leaves orders unlinked if ownership is ambiguous (e.g., conflicting shippingAddress.phone
 *    or email belonging to a different verified customer, or multiple conflicting customer rows).
 * 7. Completely idempotent and safe to execute repeatedly.
 */
export async function resolveVerifiedCustomerAndLinkOrders(params: {
  rawPhone: string;
  otpVerified: boolean;
}): Promise<OrderLinkingReport> {
  if (params.otpVerified !== true) {
    throw new Error("SECURITY VIOLATION: Cannot resolve verified customer or link orders without OTP verification.");
  }

  const normalizedPhone = normalizeIndianPhone(params.rawPhone);
  if (!normalizedPhone) {
    throw new Error("Invalid Indian mobile number.");
  }

  const phoneVariants = buildExactPhoneLookupVariants(normalizedPhone);
  const now = new Date();

  return await activeLinkingAdapter.runInTransaction(async (tx) => {
    // 1. Check all existing Customer rows that reference this phone (verified or unverified)
    const matchingCustomers = await tx.findCustomersByRawPhone(phoneVariants);
    let verifiedCustomer = await tx.findCustomerByVerifiedPhone(normalizedPhone);
    let isNewCustomer = false;

    // Count any other Customer rows with the same phone that are NOT our verifiedCustomer
    const otherMatchingCustomers = matchingCustomers.filter(
      (c) => !verifiedCustomer || c.id !== verifiedCustomer.id
    );

    if (!verifiedCustomer) {
      // Do NOT silently merge into unverified legacy Customer rows.
      // Create a clean verified Customer identity bound to verifiedPhone.
      verifiedCustomer = await tx.createVerifiedCustomer({
        verifiedPhone: normalizedPhone,
        phone: normalizedPhone,
        name: "",
        phoneVerifiedAt: now,
      });
      isNewCustomer = true;
    }

    const conflictingCustomerRecordsCount = otherMatchingCustomers.length;

    // 2. Inspect candidate orders matching exact phone variants
    const candidateOrders = await tx.findCandidateOrdersByPhoneVariants(phoneVariants);

    // Check if any candidate order emails belong to a DIFFERENT verified customer
    const candidateEmails = Array.from(
      new Set(
        candidateOrders
          .map((o) => o.customerEmail?.trim().toLowerCase())
          .filter((e): e is string => Boolean(e))
      )
    );
    const verifiedCustomersWithEmails = await tx.findVerifiedCustomersByEmails(candidateEmails);
    const emailToOtherVerifiedCustomer = new Map<string, string>();
    for (const vc of verifiedCustomersWithEmails) {
      if (vc.email && vc.id !== verifiedCustomer.id) {
        emailToOtherVerifiedCustomer.set(vc.email.trim().toLowerCase(), vc.id);
      }
    }

    const eligibleOrderIds: string[] = [];
    const eligibleOrderNumbers: string[] = [];
    let skippedAmbiguousOrderCount = 0;
    let skippedAlreadyLinkedCount = 0;
    let inferredName = "";

    for (const order of candidateOrders) {
      // Rule A: Never reassign an order that is already linked
      if (order.customerId !== null) {
        if (order.customerId === verifiedCustomer.id) {
          if (!inferredName && order.customerName?.trim()) {
            inferredName = order.customerName.trim();
          }
        } else {
          skippedAlreadyLinkedCount++;
        }
        continue;
      }

      // Rule B: Verify exact normalized 10-digit phone match (never partial match)
      const orderNormalizedPhone = normalizeIndianPhone(order.customerPhone);
      if (orderNormalizedPhone !== normalizedPhone) {
        skippedAmbiguousOrderCount++;
        continue;
      }

      // Rule C: If shippingAddress contains a phone field, it must not conflict with customerPhone
      const shippingPhoneRaw =
        order.shippingAddress &&
        typeof order.shippingAddress === "object" &&
        typeof order.shippingAddress.phone === "string"
          ? order.shippingAddress.phone.trim()
          : "";

      if (shippingPhoneRaw) {
        const shippingNormalizedPhone = normalizeIndianPhone(shippingPhoneRaw);
        if (shippingNormalizedPhone !== normalizedPhone) {
          // Ambiguous ownership: order contact phone and shipping phone differ
          skippedAmbiguousOrderCount++;
          continue;
        }
      }

      // Rule D: If order email belongs to a DIFFERENT verified customer account, treat as ambiguous
      const cleanOrderEmail = order.customerEmail?.trim().toLowerCase();
      if (cleanOrderEmail && emailToOtherVerifiedCustomer.has(cleanOrderEmail)) {
        skippedAmbiguousOrderCount++;
        continue;
      }

      // Rule E: If multiple conflicting Customer records exist for this phone number, do not guess ownership
      if (conflictingCustomerRecordsCount > 0) {
        skippedAmbiguousOrderCount++;
        continue;
      }

      eligibleOrderIds.push(order.id);
      eligibleOrderNumbers.push(order.orderNumber);
      if (!inferredName && order.customerName?.trim()) {
        inferredName = order.customerName.trim();
      }
    }

    // 3. Atomically link eligible guest orders (where customerId IS NULL)
    const linkedOrderCount = await tx.linkOrdersToCustomer(eligibleOrderIds, verifiedCustomer.id);

    // 4. Populate Customer display name if blank (without modifying Order records)
    if (!verifiedCustomer.name && inferredName) {
      verifiedCustomer = await tx.updateCustomerName(verifiedCustomer.id, inferredName);
    }

    return {
      customer: verifiedCustomer,
      isNewCustomer,
      linkedOrderCount,
      linkedOrderNumbers: eligibleOrderNumbers.slice(0, linkedOrderCount),
      skippedAmbiguousOrderCount,
      skippedAlreadyLinkedCount,
      conflictingCustomerRecordsCount,
    };
  });
}
