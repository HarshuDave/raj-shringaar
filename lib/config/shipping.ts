// Centralized, configurable shipping parameters for Raj Shringaar

export interface ShippingConfig {
  freeShippingThreshold: number;
  standardShippingFee: number;
}

// Configurable via environment variables with pious defaults (₹999 threshold, ₹99 fee)
export const shippingConfig: ShippingConfig = {
  freeShippingThreshold:
    typeof process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD === "string"
      ? parseInt(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD, 10) || 999
      : 999,
  standardShippingFee:
    typeof process.env.NEXT_PUBLIC_STANDARD_SHIPPING_FEE === "string"
      ? parseInt(process.env.NEXT_PUBLIC_STANDARD_SHIPPING_FEE, 10) || 99
      : 99,
};

/**
 * Calculates shipping fee given an order subtotal.
 * Orders >= freeShippingThreshold (or subtotal of 0) get free shipping (₹0).
 */
export function calculateShippingFee(
  subtotal: number,
  config: ShippingConfig = shippingConfig
): number {
  if (subtotal === 0 || subtotal >= config.freeShippingThreshold) {
    return 0;
  }
  return config.standardShippingFee;
}

/**
 * Calculates remaining amount needed to qualify for free delivery.
 */
export function getAmountToFreeShipping(
  subtotal: number,
  config: ShippingConfig = shippingConfig
): number {
  return Math.max(0, config.freeShippingThreshold - subtotal);
}
