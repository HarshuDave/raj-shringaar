"use server";

import { revalidatePath } from "next/cache";
import { checkAdminAuth } from "@/app/actions/admin-auth";
import {
  saveCollection,
  deleteCollection,
  toggleCollectionStatus,
  getAllCollections,
} from "@/lib/data/repository";
import { Collection } from "@/lib/types";

export async function createCollectionAction(formData: FormData) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: "Collection name must be at least 2 characters long." };
    }

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

    const description = (formData.get("description") as string)?.trim() || undefined;
    const image = (formData.get("image") as string)?.trim() || "/janmashtami-special.png";
    const displayOrder = parseInt((formData.get("displayOrder") as string) || "10", 10);
    const isActive = formData.get("isActive") !== "false";

    const newCollection: Collection = {
      id: `col-${slug}`,
      name,
      slug,
      image,
      description,
      displayOrder,
      isActive,
    };

    const saved = await saveCollection(newCollection);

    // Revalidate paths
    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath(`/collections/${slug}`);
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, collection: saved };
  } catch (error: any) {
    console.error("Failed to create collection:", error);
    return { success: false, error: error.message || "Failed to create collection" };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const res = await deleteCollection(id);
    if (!res.success) {
      return { success: false, error: res.error || "Cannot delete collection" };
    }

    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath("/admin/products/new");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: error.message || "Failed to delete collection" };
  }
}

export async function toggleCollectionStatusAction(id: string, isActive: boolean) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    await toggleCollectionStatus(id, isActive);

    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle collection status:", error);
    return { success: false, error: error.message };
  }
}
