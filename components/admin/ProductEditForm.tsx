"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/lib/types";
import { updateProductAction } from "@/app/actions/admin-products";

type VariantRow = {
  id: string;
  size: string;
  colour: string;
  price: number;
  discountPrice: number;
  stock: number;
};

type ProductEditFormProps = {
  product: Product;
  categories?: { id: string; name: string; slug: string }[];
  collections?: { id: string; name: string; slug: string }[];
};

const fallbackCategories = [
  { id: "cat-poshak", name: "Poshak", slug: "poshak" },
  { id: "cat-mukut", name: "Mukut", slug: "mukut" },
  { id: "cat-mala", name: "Mala", slug: "mala" },
  { id: "cat-shringaar", name: "Shringaar", slug: "shringaar" },
  { id: "cat-jhula", name: "Jhula", slug: "jhula" },
  { id: "cat-bansuri", name: "Bansuri", slug: "bansuri" },
  { id: "cat-combos", name: "Combos", slug: "combos" },
];

export default function ProductEditForm({
  product,
  categories = [],
  collections = [],
}: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableCategories = categories.length > 0 ? categories : fallbackCategories;
  const initialCatId =
    availableCategories.find(
      (c) =>
        c.id === product.categoryId ||
        c.name.toLowerCase() === product.categoryName.toLowerCase()
    )?.id ||
    availableCategories[0]?.id ||
    product.categoryId;

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCatId);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    product.collectionSlugs || []
  );

  const defaultImageOptions = [
    { label: "Premium Poshak", url: "/products/premium-poshak.png" },
    { label: "Designer Mukut", url: "/products/designer-mukut.png" },
    { label: "Krishna Mala", url: "/products/krishna-mala.png" },
    { label: "Gopal Jhula", url: "/products/laddu-gopal-jhula.png" },
    { label: "Shringaar Set", url: "/products/shringaar-set.png" },
    { label: "Poshak Category", url: "/categories/poshak.png" },
    { label: "Mukut Category", url: "/categories/mukut.png" },
    { label: "Bansuri Category", url: "/categories/bansuri.png" },
    { label: "Combos Category", url: "/categories/combos.png" },
  ];

  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || "/products/premium-poshak.png"
  );
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.map((v) => ({
      id: v.id,
      size: v.size || "",
      colour: v.colour || "",
      price: v.price,
      discountPrice: v.discountPrice || 0,
      stock: v.stock,
    }))
  );

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        size: "2",
        colour: "",
        price: 499,
        discountPrice: 0,
        stock: 5,
      },
    ]);
  };

  const removeVariantRow = (id: string) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariant = (
    id: string,
    field: keyof VariantRow,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (variants.length === 0) {
      setErrorMessage("At least one product variant must be configured.");
      return;
    }

    const seen = new Set<string>();
    for (const v of variants) {
      const sizeKey = (v.size || "").trim().toLowerCase();
      const colourKey = (v.colour || "").trim().toLowerCase();
      const comboKey = `${sizeKey}|${colourKey}`;

      if (seen.has(comboKey)) {
        setErrorMessage(
          `Duplicate variant detected: Size "${v.size || "Standard"}" and Colour "${v.colour || "Standard"}". Each size and colour combination must be unique.`
        );
        return;
      }
      seen.add(comboKey);

      const price = Number(v.price);
      if (isNaN(price) || price <= 0) {
        setErrorMessage("Each variant must have a valid selling price greater than ₹0.");
        return;
      }

      const stock = Number(v.stock);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        setErrorMessage("Variant stock must be a non-negative whole number (0 or higher).");
        return;
      }

      const discountPrice = Number(v.discountPrice);
      if (discountPrice && discountPrice > 0 && discountPrice < price) {
        setErrorMessage(
          `Original MRP (₹${discountPrice}) cannot be lower than the selling price (₹${price}).`
        );
        return;
      }
    }

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const finalImage = customImageUrl.trim() || selectedImage;
    formData.set("image1", finalImage);

    const cleanedVariants = variants.map((v) => ({
      id: v.id,
      size: v.size.trim() || undefined,
      colour: v.colour.trim() || undefined,
      price: Number(v.price) || 0,
      discountPrice: Number(v.discountPrice) || undefined,
      stock: Number(v.stock) || 0,
    }));
    formData.set("variants", JSON.stringify(cleanedVariants));

    startTransition(async () => {
      const res = await updateProductAction(product.id, formData);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setErrorMessage(res.error || "Failed to update product");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg text-royal border-b border-gold/20 pb-2">
          Edit General Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={product.name}
              className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
              Category *
            </label>
            <select
              name="categoryId"
              required
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="hidden"
              name="categoryName"
              value={availableCategories.find((c) => c.id === selectedCategoryId)?.name || product.categoryName}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
              Badge / Ribbon (Optional)
            </label>
            <input
              type="text"
              name="badge"
              defaultValue={product.badge || ""}
              placeholder="e.g. Best Seller, New Arrival, Festive"
              className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
              Material Specification
            </label>
            <input
              type="text"
              name="material"
              defaultValue={product.material || ""}
              placeholder="e.g. Pure Silk, Zari Border, Brass Polish"
              className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
            />
          </div>

          {collections.length > 0 && (
            <div className="sm:col-span-2 bg-ivory/50 border border-gold/20 p-3.5 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-royal">
                Assign To Curated Collections
              </label>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => {
                  const isSelected = selectedCollections.includes(col.slug);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() =>
                        setSelectedCollections((prev) =>
                          isSelected ? prev.filter((s) => s !== col.slug) : [...prev, col.slug]
                        )
                      }
                      className={`px-3 py-1.5 text-xs border rounded-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-royal text-gold border-gold"
                          : "bg-white text-royal/70 border-gold/30 hover:border-gold"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {col.name}
                    </button>
                  );
                })}
              </div>
              <input
                type="hidden"
                name="collectionSlugs"
                value={JSON.stringify(selectedCollections)}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
              Devotional Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={product.description}
              className="w-full p-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Image Selection */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg text-royal border-b border-gold/20 pb-2">
          Product Artwork &amp; Imagery
        </h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-2">
            Select Preset Project Image:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {defaultImageOptions.map((opt) => (
              <button
                key={opt.url}
                type="button"
                onClick={() => setSelectedImage(opt.url)}
                className={`p-2 border text-left text-[11px] transition-all flex flex-col items-center gap-1.5 ${
                  selectedImage === opt.url && !customImageUrl
                    ? "border-gold bg-cream text-royal font-bold ring-2 ring-gold"
                    : "border-gold/20 bg-white text-royal/70 hover:border-gold"
                }`}
              >
                <span className="truncate w-full text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
            Or Enter Custom Image URL:
          </label>
          <input
            type="text"
            value={customImageUrl}
            onChange={(e) => setCustomImageUrl(e.target.value)}
            placeholder="https://... or /products/your-image.png"
            className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Variants Builder */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gold/20 pb-2">
          <div>
            <h2 className="font-serif text-lg text-royal">
              Variants (Sizes &amp; Colours)
            </h2>
            <p className="text-xs text-royal/60">
              Update pricing and inventory units per size.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariantRow}
            className="px-3.5 py-1.5 bg-royal text-gold text-xs font-semibold uppercase tracking-wider hover:bg-royal-light"
          >
            + Add Variant Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-gold/20 text-royal font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Size (0-6)</th>
                <th className="py-2.5 px-3">Colour (Optional)</th>
                <th className="py-2.5 px-3">Selling Price (₹) *</th>
                <th className="py-2.5 px-3">Original MRP (₹)</th>
                <th className="py-2.5 px-3">Stock Units *</th>
                <th className="py-2.5 px-3 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15">
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(v.id, "size", e.target.value)
                      }
                      placeholder="e.g. 2"
                      className="w-20 h-9 px-2 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={v.colour}
                      onChange={(e) =>
                        updateVariant(v.id, "colour", e.target.value)
                      }
                      placeholder="e.g. Blue"
                      className="w-28 h-9 px-2 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(v.id, "price", Number(e.target.value))
                      }
                      className="w-24 h-9 px-2 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold font-bold"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      value={v.discountPrice}
                      onChange={(e) =>
                        updateVariant(
                          v.id,
                          "discountPrice",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 h-9 px-2 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold text-royal/60"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(v.id, "stock", Number(e.target.value))
                      }
                      className="w-20 h-9 px-2 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold font-bold text-emerald-800"
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariantRow(v.id)}
                      disabled={variants.length <= 1}
                      className="text-xs text-red-600 hover:underline disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-royal block">
            Storefront Visibility
          </label>
          <span className="text-xs text-royal/60">
            Publish or temporarily hide this product from customers
          </span>
        </div>
        <select
          name="isActive"
          defaultValue={product.isActive ? "true" : "false"}
          className="h-10 px-3 border border-gold/30 text-xs bg-white text-royal"
        >
          <option value="true">Active (Visible)</option>
          <option value="false">Hidden (Draft)</option>
        </select>
      </div>

      {/* Submit / Cancel Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/products"
          className="px-6 py-3 border border-gold/30 text-xs font-semibold uppercase tracking-wider text-royal hover:bg-cream transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 px-8 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPending ? "Updating Product..." : "Save Changes →"}
        </button>
      </div>
    </form>
  );
}
