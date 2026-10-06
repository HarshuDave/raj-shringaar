"use server";

import { revalidatePath } from "next/cache";
import {
  saveCategory,
  deleteCategory,
  toggleCategoryStatus,
  getAllCategories,
} from "@/lib/data/repository";
import { Category } from "@/lib/types";

export async function createCategoryAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    if (!name) {
      return { success: false, error: "Category name is required" };
    }

    // Auto-generate slug if not specified or clean existing
    let slug = (formData.get("slug") as string)?.trim();
    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    } else {
      slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const image = (formData.get("image") as string)?.trim() || "/categories/poshak.png";
    const displayOrder = parseInt((formData.get("displayOrder") as string) || "10", 10);
    const isActive = formData.get("isActive") !== "false";

    const newCategory: Category = {
      id: `cat-${slug}`,
      name,
      slug,
      image,
      displayOrder,
      isActive,
    };

    const saved = await saveCategory(newCategory);

    // Revalidate storefront and admin pages
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, category: saved };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const res = await deleteCategory(id);
    if (!res.success) {
      return { success: false, error: res.error || "Cannot delete category" };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

export async function toggleCategoryStatusAction(id: string, isActive: boolean) {
  try {
    await toggleCategoryStatus(id, isActive);

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle category status:", error);
    return { success: false, error: error.message };
  }
}
