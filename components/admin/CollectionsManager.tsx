"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/lib/types";
import {
  createCollectionAction,
  deleteCollectionAction,
  toggleCollectionStatusAction,
} from "@/app/actions/admin-collections";

const PRESET_COLLECTION_IMAGES = [
  { label: "Janmashtami Theme", url: "/janmashtami-special.png" },
  { label: "Hero Bal Gopal", url: "/hero-laddu-gopal.png" },
  { label: "Premium Poshak", url: "/products/premium-poshak.png" },
  { label: "Designer Mukut", url: "/products/designer-mukut.png" },
  { label: "Shringaar Set", url: "/products/shringaar-set.png" },
  { label: "Jhula Theme", url: "/products/laddu-gopal-jhula.png" },
];

export default function CollectionsManager({
  initialCollections,
  productCounts,
}: {
  initialCollections: Collection[];
  productCounts: Record<string, number>;
}) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState("/janmashtami-special.png");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(
    initialCollections.length ? Math.max(...initialCollections.map((c) => c.displayOrder)) + 1 : 1
  );
  const [isActive, setIsActive] = useState(true);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

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
      setErrorMsg("Please enter a collection name");
      return;
    }

    const finalImage = customImageUrl.trim() || selectedImage;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("description", description.trim());
    formData.append("image", finalImage);
    formData.append("displayOrder", displayOrder.toString());
    formData.append("isActive", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await createCollectionAction(formData);
      if (res.success && res.collection) {
        setCollections((prev) =>
          [...prev.filter((c) => c.id !== res.collection!.id && c.slug !== res.collection!.slug), res.collection!].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )
        );
        setSuccessMsg(`Collection "${res.collection.name}" created successfully!`);
        setIsCreateOpen(false);
        // Reset form
        setName("");
        setSlug("");
        setDescription("");
        setCustomImageUrl("");
        setSelectedImage("/janmashtami-special.png");
        setDisplayOrder((prev) => prev + 1);
      } else {
        setErrorMsg(res.error || "Failed to create collection");
      }
    });
  };

  const handleDeleteClick = (col: Collection) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setCollectionToDelete(col);
  };

  const confirmDelete = () => {
    if (!collectionToDelete) return;

    startTransition(async () => {
      const res = await deleteCollectionAction(collectionToDelete.id);
      if (res.success) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionToDelete.id));
        setSuccessMsg(`Collection "${collectionToDelete.name}" deleted successfully.`);
        setCollectionToDelete(null);
      } else {
        setErrorMsg(res.error || "Cannot delete collection");
        setCollectionToDelete(null);
      }
    });
  };

  const handleToggleStatus = (col: Collection) => {
    const newStatus = !col.isActive;
    // Optimistic UI update
    setCollections((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, isActive: newStatus } : c))
    );

    startTransition(async () => {
      const res = await toggleCollectionStatusAction(col.id, newStatus);
      if (!res.success) {
        // Revert on failure
        setCollections((prev) =>
          prev.map((c) => (c.id === col.id ? { ...c, isActive: !newStatus } : c))
        );
        setErrorMsg("Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
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

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gold/20 p-4 shadow-xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
            Curated Themes
          </span>
          <h2 className="font-serif text-xl text-royal">
            Collections ({collections.length})
          </h2>
          <p className="text-xs text-royal/60 mt-0.5">
            Active: {collections.filter((c) => c.isActive).length} | Hidden:{" "}
            {collections.filter((c) => !c.isActive).length}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-royal text-gold px-4 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-royal/90 transition-all border border-gold/40 shadow-xs cursor-pointer"
        >
          <span>✦</span> Add New Collection
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {collections.map((col) => {
          const count = productCounts[col.id] ?? 0;
          return (
            <div
              key={col.id}
              className={`bg-white border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                col.isActive ? "border-gold/30" : "border-gray-200 opacity-70"
              }`}
            >
              <div>
                <div className="relative h-44 w-full bg-royal">
                  <Image
                    src={col.image || "/janmashtami-special.png"}
                    alt={col.name}
                    fill
                    className="object-cover opacity-70"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal/95 via-royal/40 to-transparent flex items-end justify-between p-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gold font-bold block mb-1">
                        Order #{col.displayOrder}
                      </span>
                      <h3 className="font-serif text-xl text-gold font-bold">
                        {col.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(col)}
                      disabled={isPending}
                      className={`text-[9px] px-2 py-0.5 font-bold uppercase transition-colors cursor-pointer ${
                        col.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      title="Click to toggle Active/Hidden"
                    >
                      {col.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-royal/70 mb-3 leading-relaxed line-clamp-2">
                    {col.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-royal/60">
                    <span className="font-mono">slug: /{col.slug}</span>
                    <span>•</span>
                    <span className="font-semibold text-gold-dark">
                      {count} {count === 1 ? "Product" : "Products"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 py-3 bg-ivory/50 border-t border-gold/15 flex items-center justify-between text-xs">
                <Link
                  href={`/collections/${col.slug}`}
                  target="_blank"
                  className="text-royal/60 hover:text-gold font-medium transition-colors text-[11px]"
                >
                  View on Store ↗
                </Link>

                <button
                  onClick={() => handleDeleteClick(col)}
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

      {/* CREATE COLLECTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-gold max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                  Curated Theme
                </span>
                <h3 className="font-serif text-2xl text-royal">
                  Add New Collection
                </h3>
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
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holi Mahotsav, Radhashtami Special"
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
                  Store URL: /collections/{slug || "slug"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-royal mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this devotional collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gold/30 bg-ivory/50 px-3 py-2 text-xs text-royal focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Cover Image Selection */}
              <div>
                <label className="block text-xs font-bold text-royal mb-1.5 uppercase tracking-wider">
                  Collection Banner Image
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESET_COLLECTION_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setSelectedImage(img.url);
                        setCustomImageUrl("");
                      }}
                      className={`relative aspect-video border overflow-hidden p-1 flex flex-col items-center justify-center cursor-pointer transition-all ${
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
                        sizes="120px"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-royal/80 text-[8px] text-gold text-center py-0.5 truncate">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-royal/60 block mb-1">
                    Or specify custom banner URL:
                  </span>
                  <input
                    type="text"
                    placeholder="https://... or /image.png"
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
                  {isPending ? "Saving..." : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-red-500 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl text-royal font-bold mb-2">
              Delete Collection &quot;{collectionToDelete.name}&quot;?
            </h3>
            <p className="text-xs text-royal/70 leading-relaxed mb-4">
              Are you sure you want to permanently delete this collection?
              Products assigned to this theme will remain safely in your catalog
              and will only be unlinked from this collection.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-gold/15">
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
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
        </div>
      )}
    </div>
  );
}
