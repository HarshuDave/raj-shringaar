import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCollectionBySlug, getProducts } from "@/lib/data/repository";
import ProductCard from "@/components/store/ProductCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found | Raj Shringaar",
    };
  }

  return {
    title: `${collection.name} | Raj Shringaar`,
    description: collection.description || "Divine collections for Laddu Gopal",
  };
}

export default async function SingleCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = await getProducts({ collection: slug });

  return (
    <div className="bg-ivory pb-16">
      {/* Hero Banner for Collection */}
      <div className="relative h-[280px] sm:h-[360px] w-full overflow-hidden bg-royal">
        <Image
          src={collection.image || "/janmashtami-special.png"}
          alt={collection.name}
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-royal via-royal/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <nav className="mb-4 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-gold transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-gold font-medium">{collection.name}</span>
          </nav>

          <span className="text-[10px] uppercase tracking-[0.35em] text-gold mb-2 font-semibold">
            Curated Devotional Series
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white mb-3">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products in Collection */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 mt-12">
        <div className="mb-8 flex items-center justify-between border-b border-gold/20 pb-4">
          <p className="text-xs text-royal/70">
            Showing <span className="font-bold text-royal">{products.length}</span>{" "}
            items in this collection
          </p>
          <Link
            href="/shop"
            className="text-xs text-gold font-semibold hover:underline"
          >
            ← View All Products
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-cream p-12 text-center border border-gold/20">
            <p className="font-serif text-lg text-royal mb-2">
              New items coming soon to this collection
            </p>
            <p className="text-xs text-royal/60 mb-6">
              Our artisans are currently crafting new designs for this collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-10 items-center justify-center bg-royal px-6 text-xs uppercase tracking-wider text-gold font-semibold hover:bg-gold hover:text-royal transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const minPrice = Math.min(...product.variants.map((v) => v.price));
              const originalPrice = product.variants[0]?.discountPrice;
              const availableSizes = Array.from(
                new Set(
                  product.variants
                    .map((v) => v.size)
                    .filter((s): s is string => Boolean(s))
                )
              );

              return (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  slug={product.slug}
                  image={product.images[0] || "/products/premium-poshak.png"}
                  price={minPrice}
                  originalPrice={originalPrice}
                  badge={product.badge}
                  availableSizes={availableSizes}
                  rating={product.rating}
                  reviews={product.reviewsCount}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
