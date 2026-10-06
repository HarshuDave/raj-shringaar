import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductById,
  getAllCategories,
  getAllCollections,
} from "@/lib/data/repository";
import ProductEditForm from "@/components/admin/ProductEditForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Product | Raj Shringaar Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getAllCollections(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="border-b border-gold/20 pb-4">
        <Link
          href="/admin/products"
          className="text-xs text-gold font-semibold hover:underline mb-2 inline-block"
        >
          ← Back to All Products
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">
          Catalog Editor
        </span>
        <h1 className="font-serif text-3xl text-royal mt-0.5">
          Edit Product: {product.name}
        </h1>
      </div>

      <ProductEditForm
        product={product}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
