"use server";

import { revalidatePath } from "next/cache";
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

export async function createProductAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
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

    const description = (formData.get("description") as string) || "";
    const material = (formData.get("material") as string) || "";
    const featured = formData.get("featured") === "true";
    const isActive = formData.get("isActive") !== "false";
    const badge = (formData.get("badge") as string) || undefined;
    const image1 = (formData.get("image1") as string) || "/products/premium-poshak.png";
    const image2 = (formData.get("image2") as string) || "";

    // Generate slug automatically
    const slug = name
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
    let variants: ProductVariant[] = [];

    if (variantsRaw) {
      try {
        variants = JSON.parse(variantsRaw);
      } catch (e) {
        console.error("Variants parse error", e);
      }
    }

    if (variants.length === 0) {
      variants = [
        {
          id: `var_${Date.now()}_0`,
          productId: `prod_${Date.now()}`,
          size: "2",
          price: 499,
          stock: 10,
        },
      ];
    }

    const productId = `prod_${Date.now()}`;
    const images = [image1];
    if (image2) images.push(image2);

    const newProduct: Product = {
      id: productId,
      name,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
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
      variants: variants.map((v, i) => ({
        ...v,
        id: v.id || `var_${Date.now()}_${i}`,
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
    await deleteProduct(productId);
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/collections");
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStockAction(variantId: string, newStock: number) {
  try {
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
    const existing = await getProductById(productId);
    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    const name = formData.get("name") as string;
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

    const description = (formData.get("description") as string) || "";
    const material = (formData.get("material") as string) || "";
    const featured = formData.get("featured") === "true";
    const isActive = formData.get("isActive") !== "false";
    const badge = (formData.get("badge") as string) || undefined;
    const image1 = (formData.get("image1") as string) || existing.images[0] || "/products/premium-poshak.png";

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
    let variants: ProductVariant[] = existing.variants;

    if (variantsRaw) {
      try {
        const parsed = JSON.parse(variantsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          variants = parsed.map((v: any, i: number) => ({
            ...v,
            id: v.id || `var_${Date.now()}_${i}`,
            productId,
          }));
        }
      } catch (e) {
        console.error("Variants parse error", e);
      }
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
      variants,
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
