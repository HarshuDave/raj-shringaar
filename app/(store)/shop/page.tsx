import Link from "next/link";
import { getProducts, getCategories } from "@/lib/data/repository";
import ProductCard from "@/components/store/ProductCard";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.category;
  const selectedSize = params.size;
  const selectedSort = (params.sort as any) || "featured";
  const searchQuery = params.search;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: selectedCategory,
      size: selectedSize,
      sort: selectedSort,
      search: searchQuery,
    }),
  ]);

  const sizes = ["0", "1", "2", "3", "4", "5", "6"];

  return (
    <div className="bg-ivory py-10 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Shop</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="capitalize text-gold font-semibold">
                {selectedCategory}
              </span>
            </>
          )}
        </nav>

        {/* Page Title */}
        <div className="mb-8 border-b border-gold/20 pb-6 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl text-royal capitalize">
            {selectedCategory ? `${selectedCategory} Shringar` : "All Divine Shringar"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-royal/70 max-w-2xl">
            Pure devotional craftsmanship for Thakurji. Explore handcrafted Poshak,
            Mukut, Mala, and Shringaar for Laddu Gopal.
          </p>
        </div>

        {/* Categories Bar / Quick filter pills */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/shop"
            className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              !selectedCategory
                ? "bg-royal text-gold"
                : "bg-cream text-royal border border-gold/20 hover:border-gold"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug.toLowerCase()}`}
              className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                selectedCategory?.toLowerCase() === cat.slug.toLowerCase()
                  ? "bg-royal text-gold"
                  : "bg-cream text-royal border border-gold/20 hover:border-gold"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block space-y-6">
            {/* Filter by Category */}
            <div className="bg-cream p-5 border border-gold/20">
              <h3 className="font-serif text-base text-royal mb-4 border-b border-gold/20 pb-2">
                Categories
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/shop"
                    className={`block py-1 hover:text-gold transition-colors ${
                      !selectedCategory ? "text-gold font-bold" : "text-royal/80"
                    }`}
                  >
                    All Shringar ({products.length})
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug.toLowerCase()}`}
                      className={`block py-1 hover:text-gold transition-colors ${
                        selectedCategory?.toLowerCase() === cat.slug.toLowerCase()
                          ? "text-gold font-bold"
                          : "text-royal/80"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter by Laddu Gopal Size */}
            <div className="bg-cream p-5 border border-gold/20">
              <div className="flex items-center justify-between mb-4 border-b border-gold/20 pb-2">
                <h3 className="font-serif text-base text-royal">Gopal Size</h3>
                <Link
                  href="/size-guide"
                  className="text-[10px] text-gold hover:underline"
                >
                  Size Guide →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((sz) => (
                  <Link
                    key={sz}
                    href={`/shop?${new URLSearchParams({
                      ...(selectedCategory ? { category: selectedCategory } : {}),
                      ...(selectedSize === sz ? {} : { size: sz }),
                    }).toString()}`}
                    className={`flex h-9 items-center justify-center text-xs font-semibold border transition-all ${
                      selectedSize === sz
                        ? "bg-gold border-gold text-royal"
                        : "bg-white border-gold/20 text-royal hover:border-gold"
                    }`}
                  >
                    Size {sz}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Sizing Helper Callout */}
            <div className="bg-royal p-5 text-white border-l-2 border-gold">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1 font-semibold">
                Sizing Help
              </p>
              <p className="text-xs text-white/80 leading-relaxed mb-3">
                Unsure about your Thakurji&apos;s exact size? Consult our comprehensive size guide.
              </p>
              <Link
                href="/size-guide"
                className="text-xs text-gold font-semibold hover:underline inline-flex items-center gap-1"
              >
                View Size Chart →
              </Link>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {/* Toolbar: Count + Sort */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 pb-4">
              <p className="text-xs text-royal/70 font-medium">
                Showing <span className="font-bold text-royal">{products.length}</span>{" "}
                {products.length === 1 ? "divine product" : "divine products"}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-royal/70">Sort by:</span>
                <div className="flex gap-1 text-xs">
                  <Link
                    href={`/shop?${new URLSearchParams({
                      ...(selectedCategory ? { category: selectedCategory } : {}),
                      ...(selectedSize ? { size: selectedSize } : {}),
                      sort: "featured",
                    }).toString()}`}
                    className={`px-2.5 py-1 text-[11px] ${
                      selectedSort === "featured"
                        ? "bg-royal text-gold font-semibold"
                        : "text-royal/80 hover:text-gold"
                    }`}
                  >
                    Featured
                  </Link>
                  <Link
                    href={`/shop?${new URLSearchParams({
                      ...(selectedCategory ? { category: selectedCategory } : {}),
                      ...(selectedSize ? { size: selectedSize } : {}),
                      sort: "price-asc",
                    }).toString()}`}
                    className={`px-2.5 py-1 text-[11px] ${
                      selectedSort === "price-asc"
                        ? "bg-royal text-gold font-semibold"
                        : "text-royal/80 hover:text-gold"
                    }`}
                  >
                    Price: Low to High
                  </Link>
                  <Link
                    href={`/shop?${new URLSearchParams({
                      ...(selectedCategory ? { category: selectedCategory } : {}),
                      ...(selectedSize ? { size: selectedSize } : {}),
                      sort: "price-desc",
                    }).toString()}`}
                    className={`px-2.5 py-1 text-[11px] ${
                      selectedSort === "price-desc"
                        ? "bg-royal text-gold font-semibold"
                        : "text-royal/80 hover:text-gold"
                    }`}
                  >
                    Price: High to Low
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-cream p-12 text-center border border-gold/20 my-6">
                <span className="text-4xl text-gold mb-3 block">🪷</span>
                <h3 className="font-serif text-xl text-royal mb-2">
                  No divine products found
                </h3>
                <p className="text-xs text-royal/70 max-w-md mx-auto mb-6">
                  We could not find matching products for the selected filters.
                  Try clearing your filters to view all products.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center justify-center bg-royal px-6 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-royal transition-colors"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
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
      </div>
    </div>
  );
}
