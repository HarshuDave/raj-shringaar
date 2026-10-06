"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductCardProps = {
  image: string;
  name: string;
  slug: string;
  badge?: string;
  price: number;
  originalPrice?: number;
  availableSizes?: string[];
  rating?: number;
  reviews?: number;
};

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          className={
            i < fullStars
              ? "text-gold"
              : i === fullStars && hasHalf
              ? "text-gold/60"
              : "text-gray-200"
          }
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({
  image,
  name,
  slug,
  badge,
  price,
  originalPrice,
  availableSizes = [],
  rating = 4.8,
  reviews = 0,
}: ProductCardProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    // TODO: Wire to Zustand cart store in Phase 5
    router.push(`/product/${slug}`);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  return (
    <article className="group flex flex-col bg-white border border-gold/20 hover:border-gold/50 hover:shadow-xl transition-all duration-300">
      {/* Image Area */}
      <Link
        href={`/product/${slug}`}
        className="relative block overflow-hidden bg-[#102c4d]"
        style={{ aspectRatio: "3/4" }}
        aria-label={`View ${name}`}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Product badge — top left */}
        {badge && (
          <span className="absolute left-3 top-3 bg-gold px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-royal">
            {badge}
          </span>
        )}

        {/* Discount badge — top right */}
        {discount > 0 && (
          <span className="absolute right-3 top-3 bg-royal px-2 py-1 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist — appears on hover */}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center bg-white/90 text-royal/50 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:text-red-500 hover:bg-white"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Wishlist functionality
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Rating */}
        <div className="mb-2 flex items-center gap-2">
          <StarRating rating={rating} />
          {reviews > 0 && (
            <span className="text-[10px] text-gray-400">({reviews})</span>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/product/${slug}`}>
          <h3 className="mb-2 font-serif text-[15px] leading-snug text-royal line-clamp-2 hover:text-gold transition-colors duration-200">
            {name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-base font-semibold text-royal">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Size Selector — shown only if variants have sizes */}
        {availableSizes.length > 0 && (
          <div className="mb-3">
            <p
              className={`mb-1.5 text-[10px] font-medium uppercase tracking-wide ${
                sizeError ? "text-red-500" : "text-gray-500"
              }`}
            >
              {sizeError ? "Please select a size" : "Size"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  aria-pressed={selectedSize === size}
                  aria-label={`Size ${size}`}
                  className={`h-7 min-w-[28px] px-2 text-[11px] font-medium border transition-all duration-150 ${
                    selectedSize === size
                      ? "border-gold bg-gold text-royal"
                      : sizeError
                      ? "border-red-300 text-royal hover:border-gold"
                      : "border-gray-200 text-royal hover:border-gold"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-auto w-full h-10 bg-royal text-white text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 hover:bg-gold hover:text-royal"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
