import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/data/repository";
import ProductDetailClient from "@/components/store/ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Raj Shringaar",
    };
  }

  return {
    title: `${product.name} | Raj Shringaar`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category or collections
  const related = await getProducts({ category: product.categoryName });
  const filteredRelated = related.filter((p) => p.id !== product.id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={filteredRelated}
    />
  );
}
