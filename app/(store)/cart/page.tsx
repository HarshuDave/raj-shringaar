"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-ivory min-h-[60vh] flex items-center justify-center">
        <span className="text-sm text-royal/60">Loading bag...</span>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="bg-ivory py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Shringar Bag</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl text-royal mb-8">
          Shopping Bag
        </h1>

        {items.length === 0 ? (
          <div className="bg-white border border-gold/30 p-12 text-center max-w-lg mx-auto shadow-sm">
            <span className="text-5xl text-gold mb-4 block">🪷</span>
            <h2 className="font-serif text-2xl text-royal mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs text-royal/70 mb-6 leading-relaxed">
              Explore our exquisite collection of divine Poshak, Mukut, and
              Shringar for your beloved Bal Gopal.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center bg-royal px-8 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-royal transition-colors shadow-sm"
            >
              Explore All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free delivery alert banner */}
              <div className="bg-cream border border-gold/30 p-4">
                {remainingForFreeShipping > 0 ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-royal/80">
                      Add items worth{" "}
                      <strong className="text-royal">
                        ₹{remainingForFreeShipping}
                      </strong>{" "}
                      for <strong className="text-gold">FREE Delivery</strong>
                    </span>
                    <span className="text-[10px] text-royal/60 font-semibold uppercase">
                      ₹999 min
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-green-800 font-semibold text-center">
                    🎉 You have qualified for FREE standard delivery!
                  </p>
                )}
              </div>

              {/* Items Card */}
              <div className="bg-white border border-gold/20 divide-y divide-gold/15 shadow-sm">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-royal/10 border border-gold/20">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-serif text-base text-royal hover:text-gold transition-colors font-medium line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex gap-3 text-xs text-royal/60 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.colour && <span>Color: {item.colour}</span>}
                        </div>
                        <span className="text-sm font-semibold text-royal mt-1 block">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-gold/30 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="h-8 w-8 text-royal hover:bg-cream flex items-center justify-center text-sm"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-9 text-center text-xs font-semibold text-royal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="h-8 w-8 text-royal hover:bg-cream flex items-center justify-center text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <span className="font-semibold text-royal text-sm min-w-[70px] text-right">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-royal/40 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/shop"
                  className="text-xs text-gold font-semibold hover:underline"
                >
                  ← Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-royal/50 hover:text-red-600 transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-white border border-gold/20 p-6 shadow-sm h-fit">
              <h2 className="font-serif text-xl text-royal mb-4 border-b border-gold/20 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs border-b border-gold/20 pb-4">
                <div className="flex justify-between text-royal/80">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-royal">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-royal/80">
                  <span>Standard Delivery</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-700 font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-baseline">
                <span className="font-serif text-base text-royal font-bold">
                  Total Payable
                </span>
                <span className="font-serif text-2xl font-bold text-royal">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="text-[11px] text-royal/60 mb-6">
                Inclusive of GST and applicable taxes
              </p>

              <Link
                href="/checkout"
                className="flex h-12 w-full items-center justify-center bg-royal text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-royal transition-all duration-300 shadow-sm"
              >
                Proceed to Checkout →
              </Link>

              <div className="mt-6 border-t border-gold/15 pt-4 text-[11px] text-royal/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  <span>100% Genuine Devotional Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  <span>Safe & Secure Packaging</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
