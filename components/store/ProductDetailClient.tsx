"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";
import { shippingConfig } from "@/lib/config/shipping";
import ProductCard from "./ProductCard";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const [activeImage, setActiveImage] = useState(
    product.images[0] || "/products/premium-poshak.png"
  );

  // Extract unique available sizes and colours
  const uniqueSizes = Array.from(
    new Set(
      product.variants
        .map((v) => v.size)
        .filter((s): s is string => Boolean(s))
    )
  );

  const uniqueColours = Array.from(
    new Set(
      product.variants
        .map((v) => v.colour)
        .filter((c): c is string => Boolean(c))
    )
  );

  // Selected variant state
  const [selectedSize, setSelectedSize] = useState<string | null>(
    uniqueSizes.length > 0 ? (uniqueSizes[0] ?? null) : null
  );

  const [selectedColour, setSelectedColour] = useState<string | null>(
    uniqueColours.length > 0 ? (uniqueColours[0] ?? null) : null
  );

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Find active variant matching current size & colour selections
  const currentVariant: ProductVariant =
    product.variants.find((v) => {
      const sizeMatch = !selectedSize || v.size === selectedSize;
      const colourMatch = !selectedColour || v.colour === selectedColour;
      return sizeMatch && colourMatch;
    }) || product.variants[0];

  const currentPrice = currentVariant?.price ?? 499;
  const currentDiscountPrice = currentVariant?.discountPrice;
  const currentStock = currentVariant?.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const discountPercent =
    currentDiscountPrice && currentDiscountPrice > currentPrice
      ? Math.round(
          ((currentDiscountPrice - currentPrice) / currentDiscountPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        variantId: currentVariant.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: activeImage,
        size: currentVariant.size,
        colour: currentVariant.colour,
        price: currentPrice,
        maxStock: currentStock,
      },
      quantity
    );

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="bg-ivory py-10 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gold transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.categoryName.toLowerCase()}`}
            className="hover:text-gold transition-colors"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-royal font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 border border-gold/20 shadow-sm">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#102c4d] border border-gold/20">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {product.badge && (
                <span className="absolute left-4 top-4 bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-royal shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 transition-all ${
                      activeImage === img
                        ? "border-gold shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Form */}
          <div className="flex flex-col">
            {/* Brand and Devotional Phrase */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                Divine Elegance
              </span>
              <span className="text-[11px] text-royal/40">
                ॥ श्री कृष्णाय नमः ॥
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl text-royal leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex text-gold text-xs">
                {"★".repeat(Math.floor(product.rating))}
                {product.rating % 1 !== 0 && "½"}
              </div>
              <span className="text-xs font-semibold text-royal">
                {product.rating}
              </span>
              <span className="text-xs text-royal/50">
                ({product.reviewsCount} devotional reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="mb-6 flex items-baseline gap-3 border-y border-gold/20 py-4 bg-cream/40 px-4">
              <span className="font-serif text-3xl font-bold text-royal">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              {currentDiscountPrice && currentDiscountPrice > currentPrice && (
                <>
                  <span className="text-sm text-royal/40 line-through">
                    ₹{currentDiscountPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="bg-royal px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
              <span className="ml-auto text-[11px] text-royal/60">
                Inclusive of all taxes
              </span>
            </div>

            {/* Size Selector — only rendered if sizes exist */}
            {uniqueSizes.length > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-royal">
                    Laddu Gopal Size:{" "}
                    <span className="text-gold font-bold">Size {selectedSize}</span>
                  </label>
                  <Link
                    href="/size-guide"
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    Sizing Guide →
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((sz) => {
                    const variantForSize = product.variants.find(
                      (v) => v.size === sz
                    );
                    const isAvailable =
                      variantForSize && variantForSize.stock > 0;

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`flex h-11 min-w-[50px] px-3 items-center justify-center text-xs font-semibold border transition-all ${
                          selectedSize === sz
                            ? "border-gold bg-gold text-royal shadow-sm"
                            : isAvailable
                            ? "border-gold/30 bg-white text-royal hover:border-gold"
                            : "border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                        }`}
                      >
                        Size {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colour Selector — only rendered if colours exist */}
            {uniqueColours.length > 0 && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-royal">
                  Colour: <span className="text-gold">{selectedColour}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColours.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColour(col ?? null)}
                      className={`h-9 px-4 text-xs font-medium border transition-all ${
                        selectedColour === col
                          ? "border-gold bg-royal text-gold font-semibold"
                          : "border-gold/30 bg-white text-royal hover:border-gold"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                  Currently Out of Stock
                </span>
              ) : currentStock <= 5 ? (
                <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
                  Only {currentStock} left in stock — Order soon!
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  In Stock ({currentStock} available for dispatch)
                </span>
              )}
            </div>

            {/* Quantity and Action Buttons */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3">
              {/* Quantity */}
              <div className="flex h-12 w-32 items-center justify-between border border-gold/40 bg-white px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="text-base text-royal hover:text-gold disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-semibold text-royal text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(currentStock, q + 1))
                  }
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="text-base text-royal hover:text-gold disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex h-12 flex-1 items-center justify-center bg-gold px-6 text-xs font-bold uppercase tracking-widest text-royal hover:bg-gold-light disabled:opacity-40 transition-colors shadow-sm"
              >
                Add to Cart
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex h-12 flex-1 items-center justify-center border-2 border-royal bg-royal px-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-royal-light disabled:opacity-40 transition-colors"
              >
                Buy Now →
              </button>
            </div>

            {/* Added Notice Toast */}
            {addedNotice && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                <span>✓ Added to your Shringar Bag!</span>
                <Link href="/cart" className="font-bold underline">
                  View Bag →
                </Link>
              </div>
            )}

            {/* Trust Points */}
            <div className="grid grid-cols-2 gap-3 border-t border-gold/20 pt-6 text-xs text-royal/70">
              <div className="flex items-center gap-2">
                <span className="text-gold">✦</span>
                <span>Handcrafted with Devotion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold">✦</span>
                <span>Free Shipping over ₹{shippingConfig.freeShippingThreshold}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold">✦</span>
                <span>Secure Spiritual Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gold">✦</span>
                <span>Dispatches within 24-48 hrs</span>
              </div>
            </div>

            {/* Description & Details Accordion / Tabs */}
            <div className="mt-8 border-t border-gold/20 pt-6">
              <h3 className="font-serif text-lg text-royal mb-2">
                Product Details
              </h3>
              <p className="text-xs text-royal/80 leading-relaxed mb-4">
                {product.description}
              </p>

              {product.material && (
                <div className="mb-3 text-xs">
                  <span className="font-semibold text-royal">Material:</span>{" "}
                  <span className="text-royal/80">{product.material}</span>
                </div>
              )}

              <div className="text-xs">
                <span className="font-semibold text-royal">Care Instructions:</span>{" "}
                <span className="text-royal/80">
                  Keep in dry velvet cloth. Wipe with soft cotton. Avoid contact
                  with water and perfume.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-center justify-center gap-4">
              <span className="h-px w-16 bg-gold/50"></span>
              <h2 className="font-serif text-2xl text-royal">
                Complete the Shringar
              </h2>
              <span className="h-px w-16 bg-gold/50"></span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {relatedProducts.slice(0, 4).map((rel) => {
                const minPrice = Math.min(...rel.variants.map((v) => v.price));
                const originalPrice = rel.variants[0]?.discountPrice;
                const availableSizes = Array.from(
                  new Set(
                    rel.variants
                      .map((v) => v.size)
                      .filter((s): s is string => Boolean(s))
                  )
                );

                return (
                  <ProductCard
                    key={rel.id}
                    name={rel.name}
                    slug={rel.slug}
                    image={rel.images[0] || "/products/premium-poshak.png"}
                    price={minPrice}
                    originalPrice={originalPrice}
                    badge={rel.badge}
                    availableSizes={availableSizes}
                    rating={rel.rating}
                    reviews={rel.reviewsCount}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
