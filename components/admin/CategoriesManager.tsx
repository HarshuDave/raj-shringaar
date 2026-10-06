"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/types";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryStatusAction,
} from "@/app/actions/admin-categories";

const PRESET_IMAGES = [
  { label: "Poshak", url: "/categories/poshak.png" },
  { label: "Mukut", url: "/categories/mukut.png" },
  { label: "Mala", url: "/categories/mala.png" },
  { label: "Shringaar", url: "/categories/shringaar.png" },
  { label: "Jhula", url: "/categories/jhula.png" },
  { label: "Bansuri", url: "/categories/bansuri.png" },
  { label: "Combos", url: "/categories/combos.png" },
];

export default function CategoriesManager({
  initialCategories,
  productCounts,
}: {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedImage, setSelectedImage] = useState("/categories/poshak.png");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(
    initialCategories.length ? Math.max(...initialCategories.map((c) => c.displayOrder)) + 1 : 1
  );
  const [isActive, setIsActive] = useState(true);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(autoSlug);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter a category name");
      return;
    }

    const finalImage = customImageUrl.trim() || selectedImage;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("image", finalImage);
    formData.append("displayOrder", displayOrder.toString());
    formData.append("isActive", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await createCategoryAction(formData);
      if (res.success && res.category) {
        setCategories((prev) =>
          [...prev.filter((c) => c.id !== res.category!.id && c.slug !== res.category!.slug), res.category!].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )
        );
        setSuccessMsg(`Category "${res.category.name}" added successfully!`);
        setIsCreateOpen(false);
        // Reset form
        setName("");
        setSlug("");
        setCustomImageUrl("");
        setSelectedImage("/categories/poshak.png");
        setDisplayOrder((prev) => prev + 1);
      } else {
        setErrorMsg(res.error || "Failed to create category");
      }
    });
  };

  const handleDeleteClick = (cat: Category) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCategoryToDelete(cat);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(categoryToDelete.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setSuccessMsg(`Category "${categoryToDelete.name}" deleted successfully.`);
        setCategoryToDelete(null);
      } else {
        setErrorMsg(res.error || "Cannot delete category");
        setCategoryToDelete(null);
      }
    });
  };

  const handleToggleStatus = (cat: Category) => {
    const newStatus = !cat.isActive;
    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: newStatus } : c))
    );

    startTransition(async () => {
      const res = await toggleCategoryStatusAction(cat.id, newStatus);
      if (!res.success) {
        // Revert on failure
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !newStatus } : c))
        );
        setErrorMsg("Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert banners */}
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs text-red-700 flex justify-between items-center shadow-xs">
          <span>⚠️ {errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-xs text-emerald-800 flex justify-between items-center shadow-xs">
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gold/20 p-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
            Live Taxonomy
          </span>
          <h2 className="font-serif text-xl text-royal">
            Categories ({categories.length})
          </h2>
          <p className="text-xs text-royal/60 mt-0.5">
            Active: {categories.filter((c) => c.isActive).length} | Hidden:{" "}
            {categories.filter((c) => !c.isActive).length}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-royal text-gold px-4 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-royal/90 transition-all border border-gold/40 shadow-xs cursor-pointer"
        >
          <span>✦</span> Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const count = productCounts[cat.id] ?? 0;
          return (
            <div
              key={cat.id}
              className={`bg-white border p-4 flex flex-col justify-between shadow-xs transition-all ${
                cat.isActive ? "border-gold/30" : "border-gray-200 opacity-70"
              }`}
            >
              <div className="flex gap-4 items-start">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-royal/10 border border-gold/20 rounded-xs">
                  <Image
                    src={cat.image || "/categories/poshak.png"}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-base text-royal font-bold truncate">
                      {cat.name}
                    </h3>
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      disabled={isPending}
                      className={`text-[9px] px-1.5 py-0.5 font-bold uppercase transition-colors cursor-pointer ${
                        cat.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title="Click to toggle Active/Hidden"
                    >
                      {cat.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>
                  <p className="text-[10px] text-royal/50 mt-0.5 font-mono truncate">
                    /{cat.slug}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-royal/70">
                    <span>Order #{cat.displayOrder}</span>
                    <span>•</span>
                    <span className="font-medium text-gold-dark">
                      {count} {count === 1 ? "Product" : "Products"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-gold/15 flex items-center justify-between text-xs">
                <Link
                  href={`/shop?category=${cat.slug}`}
                  target="_blank"
                  className="text-royal/60 hover:text-gold transition-colors text-[11px]"
                >
                  View in Shop ↗
                </Link>

                <button
                  onClick={() => handleDeleteClick(cat)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-800 font-medium text-[11px] hover:underline cursor-pointer flex items-center gap-1"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE CATEGORY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-gold max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                  New Taxonomy Item
                </span>
                <h3 className="font-serif text-2xl text-royal">Add Category</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-royal/50 hover:text-royal text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-royal mb-1 uppercase tracking-wider">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patka, Chhatra, Singhasan"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-gold/30 bg-ivory/50 px-3 py-2 text-sm text-royal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-royal mb-1 uppercase tracking-wider">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gold/30 bg-ivory/50 px-3 py-2 text-sm text-royal font-mono focus:outline-none focus:border-gold"
                />
                <span className="text-[10px] text-royal/50">
                  Shop URL: /shop?category={slug || "slug"}
                </span>
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-xs font-bold text-royal mb-1.5 uppercase tracking-wider">
                  Category Image
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setSelectedImage(img.url);
                        setCustomImageUrl("");
                      }}
                      className={`relative aspect-square border overflow-hidden p-1 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedImage === img.url && !customImageUrl
                          ? "border-2 border-gold ring-2 ring-gold/20 bg-gold/10"
                          : "border-gold/20 hover:border-gold/50"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.label}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-royal/80 text-[8px] text-gold text-center py-0.5 truncate">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-royal/60 block mb-1">
                    Or specify custom image URL:
                  </span>
                  <input
                    type="text"
                    placeholder="https://... or /categories/name.png"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full border border-gold/30 bg-ivory/50 px-3 py-1.5 text-xs text-royal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-royal mb-1 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-gold/30 bg-ivory/50 px-3 py-2 text-sm text-royal focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-royal">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-gold h-4 w-4"
                    />
                    Publish / Active
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs text-royal/70 hover:text-royal uppercase font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-royal text-gold px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-royal/90 transition-all border border-gold cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-red-500 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl text-royal font-bold mb-2">
              Delete Category &quot;{categoryToDelete.name}&quot;?
            </h3>

            {(productCounts[categoryToDelete.id] ?? 0) > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 leading-relaxed">
                  ⚠️ <strong>Cannot Delete Immediately:</strong> This category is
                  currently assigned to{" "}
                  <strong>
                    {productCounts[categoryToDelete.id]} product(s)
                  </strong>
                  .
                  <p className="mt-1">
                    To maintain database integrity, please reassign or delete
                    those products first. Alternatively, you can toggle this
                    category to <strong>Hidden</strong> to remove it from the
                    storefront without affecting existing items.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setCategoryToDelete(null)}
                    className="bg-royal text-gold px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-royal/70 leading-relaxed">
                  Are you sure you want to permanently delete this category? This
                  action will remove it from both the database and the storefront.
                </p>
                <div className="flex justify-end gap-3 pt-3 border-t border-gold/15">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    className="px-4 py-2 text-xs text-royal/70 hover:text-royal uppercase font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isPending}
                    className="bg-red-600 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
