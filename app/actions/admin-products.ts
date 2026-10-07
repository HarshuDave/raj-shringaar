"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/app/actions/admin-auth";
import {
  saveProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductById,
  getCategoryById,
  getCategoryBySlug,
  updateStock,
} from "@/lib/data/repository";
import { Product, ProductVariant } from "@/lib/types";
import { validateVariants } from "@/lib/validation/variants";

export async function createProductAction(formData: FormData) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: "Product name must be at least 2 characters long." };
    }

    let categoryId = (formData.get("categoryId") as string)?.trim();
    let categoryName = (formData.get("categoryName") as string)?.trim();

    if (categoryId) {
      const cat = (await getCategoryById(categoryId)) || (await getCategoryBySlug(categoryId));
      if (cat) {
        categoryId = cat.id;
        categoryName = cat.name;
      }
    } else if (categoryName) {
      const cat = await getCategoryBySlug(categoryName.toLowerCase());
      if (cat) {
        categoryId = cat.id;
        categoryName = cat.name;
      } else {
        categoryId = `cat-${categoryName.toLowerCase().replace(/\s+/g, "-")}`;
      }
    } else {
      categoryId = "cat-poshak";
      categoryName = "Poshak";
    }

    const description = (formData.get("description") as string)?.trim() || "";
    const material = (formData.get("material") as string)?.trim() || "";
    const featured = formData.get("featured") === "true";
    const isActive = formData.get("isActive") !== "false";
    const badge = (formData.get("badge") as string)?.trim() || undefined;
    const image1 = (formData.get("image1") as string)?.trim() || "/products/premium-poshak.png";
    const image2 = (formData.get("image2") as string)?.trim() || "";

    // Generate slug automatically
    const slugBase = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Parse collections
    const collectionSlugsRaw = formData.get("collectionSlugs") as string;
    let collectionSlugs: string[] = [];
    if (collectionSlugsRaw) {
      try {
        collectionSlugs = JSON.parse(collectionSlugsRaw);
      } catch (e) {
        collectionSlugs = collectionSlugsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (collectionSlugs.length === 0) {
      collectionSlugs = ["new-arrivals"];
    }

    // Parse variants JSON passed from client form
    const variantsRaw = formData.get("variants") as string;
    let rawVariants: any[] = [];
    if (variantsRaw) {
      try {
        rawVariants = JSON.parse(variantsRaw);
      } catch (e) {
        return { success: false, error: "Malformed variant data." };
      }
    }

    const validation = validateVariants(rawVariants);
    if (!validation.success || !validation.cleanVariants) {
      return { success: false, error: validation.error || "Invalid variant data." };
    }

    const productId = `prod_${Date.now()}`;
    const images = [image1];
    if (image2) images.push(image2);

    const newProduct: Product = {
      id: productId,
      name,
      slug: `${slugBase}-${Math.floor(100 + Math.random() * 900)}`,
      categoryId,
      categoryName,
      description,
      material,
      featured,
      isActive,
      badge,
      rating: 5.0,
      reviewsCount: 1,
      images,
      variants: validation.cleanVariants.map((v) => ({
        ...v,
        productId,
      })),
      collectionSlugs,
      createdAt: new Date().toISOString(),
    };

    await saveProduct(newProduct);
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/collections");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, product: newProduct };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const res = await deleteProduct(productId);
    if (!res.success) {
      return { success: false, error: res.error || "Cannot delete product." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/collections");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, message: res.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStockAction(variantId: string, newStock: number) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    if (typeof newStock !== "number" || isNaN(newStock) || newStock < 0 || !Number.isInteger(newStock)) {
      return { success: false, error: "Stock must be a non-negative whole number (0 or higher)." };
    }

    const allProducts = await getAllProductsAdmin();
    for (const p of allProducts) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) {
        await updateStock(variantId, newStock);
        revalidatePath("/admin/inventory");
        revalidatePath("/admin/products");
        revalidatePath(`/product/${p.slug}`);
        revalidatePath("/shop");
        return { success: true };
      }
    }
    return { success: false, error: "Variant not found" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const existing = await getProductById(productId);
    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: "Product name must be at least 2 characters long." };
    }

    let categoryId = (formData.get("categoryId") as string)?.trim();
    let categoryName = (formData.get("categoryName") as string)?.trim();

    if (categoryId) {
      const cat = (await getCategoryById(categoryId)) || (await getCategoryBySlug(categoryId));
      if (cat) {
        categoryId = cat.id;
        categoryName = cat.name;
      }
    } else if (categoryName) {
      const cat = await getCategoryBySlug(categoryName.toLowerCase());
      if (cat) {
        categoryId = cat.id;
        categoryName = cat.name;
      } else {
        categoryId = existing.categoryId;
        categoryName = existing.categoryName;
      }
    } else {
      categoryId = existing.categoryId;
      categoryName = existing.categoryName;
    }

    const description = (formData.get("description") as string)?.trim() || "";
    const material = (formData.get("material") as string)?.trim() || "";
    const featured = formData.get("featured") === "true";
    const isActive = formData.get("isActive") !== "false";
    const badge = (formData.get("badge") as string)?.trim() || undefined;
    const image1 = (formData.get("image1") as string)?.trim() || existing.images[0] || "/products/premium-poshak.png";

    // Parse collections
    const collectionSlugsRaw = formData.get("collectionSlugs") as string;
    let collectionSlugs: string[] = existing.collectionSlugs;
    if (collectionSlugsRaw) {
      try {
        collectionSlugs = JSON.parse(collectionSlugsRaw);
      } catch (e) {
        collectionSlugs = collectionSlugsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const variantsRaw = formData.get("variants") as string;
    let rawVariants: any[] = existing.variants;
    if (variantsRaw) {
      try {
        rawVariants = JSON.parse(variantsRaw);
      } catch (e) {
        return { success: false, error: "Malformed variant data." };
      }
    }

    const validation = validateVariants(rawVariants);
    if (!validation.success || !validation.cleanVariants) {
      return { success: false, error: validation.error || "Invalid variant data." };
    }

    const updatedProduct: Product = {
      ...existing,
      name,
      categoryId,
      categoryName,
      description,
      material,
      featured,
      isActive,
      badge,
      images: [image1, ...existing.images.slice(1)],
      variants: validation.cleanVariants.map((v) => ({
        ...v,
        productId,
      })),
      collectionSlugs,
    };

    await saveProduct(updatedProduct);
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/collections");
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, product: updatedProduct };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" };
  }
}
