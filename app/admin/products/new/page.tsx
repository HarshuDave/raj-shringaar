import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { getAllCategories, getAllCollections } from "@/lib/data/repository";

export const metadata = {
  title: "Add New Product | Raj Shringaar Admin",
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    getAllCategories(),
    getAllCollections(),
  ]);

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gold/20 pb-4">
        <Link
          href="/admin/products"
          className="text-xs text-gold font-semibold hover:underline mb-2 inline-block"
        >
          ← Back to All Products
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">
          Catalog Creation
        </span>
        <h1 className="font-serif text-3xl text-royal mt-0.5">
          Add New Divine Product
        </h1>
      </div>

      <ProductForm
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
