import { ProductVariant } from "@/lib/types";

export interface VariantValidationResult {
  success: boolean;
  error?: string;
  cleanVariants?: ProductVariant[];
}

export function validateVariants(variants: any[]): VariantValidationResult {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return { success: false, error: "At least one product variant is required." };
  }

  const seenCombinations = new Set<string>();
  const cleanVariants: ProductVariant[] = [];

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const size = typeof v.size === "string" ? v.size.trim() : "";
    const colour = typeof v.colour === "string" ? v.colour.trim() : "";
    const comboKey = `${size.toLowerCase()}__${colour.toLowerCase()}`;

    if (seenCombinations.has(comboKey)) {
      return {
        success: false,
        error: `Duplicate variant detected: Size "${size || 'Default'}" and Colour "${colour || 'Default'}" already exists. Each variant combination must be unique.`,
      };
    }
    seenCombinations.add(comboKey);

    const price = Number(v.price);
    if (isNaN(price) || price <= 0) {
      return {
        success: false,
        error: `Invalid price for variant ${i + 1} (${size ? `Size ${size}` : "Standard"}). Price must be greater than ₹0.`,
      };
    }

    const stock = Number(v.stock);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      return {
        success: false,
        error: `Invalid stock for variant ${i + 1}. Stock must be a non-negative whole number (0 or higher).`,
      };
    }

    let discountPrice: number | undefined = undefined;
    if (v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice !== "") {
      const dp = Number(v.discountPrice);
      if (!isNaN(dp) && dp > 0) {
        if (dp < price) {
          return {
            success: false,
            error: `Original MRP (₹${dp}) cannot be less than selling price (₹${price}) for variant ${i + 1}.`,
          };
        }
        discountPrice = dp;
      }
    }

    cleanVariants.push({
      id: v.id || `var_${Date.now()}_${i}`,
      productId: v.productId || "",
      size: size || undefined,
      colour: colour || undefined,
      price,
      discountPrice,
      stock,
    });
  }

  return { success: true, cleanVariants };
}
