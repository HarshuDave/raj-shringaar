"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { shippingConfig, getAmountToFreeShipping } from "@/lib/config/shipping";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const totalPrice = getTotalPrice();
  const amountToFreeShipping = getAmountToFreeShipping(totalPrice);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[90vw] flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 bg-royal px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-wide text-gold">
              Your Shringar Bag
            </span>
            <span className="text-xs text-white/60">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="bg-cream px-5 py-2.5 border-b border-gold/20">
          {amountToFreeShipping > 0 ? (
            <p className="text-[11px] text-royal/80 text-center font-medium">
              Add <span className="font-bold text-royal">₹{amountToFreeShipping}</span> more for <span className="text-gold font-bold">Free Delivery</span>
            </p>
          ) : (
            <p className="text-[11px] text-green-800 text-center font-semibold">
              🎉 Congratulations! You have unlocked Free Delivery!
            </p>
          )}
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-3xl text-gold mb-3">🪷</span>
              <p className="font-serif text-lg text-royal mb-1">Your bag is empty</p>
              <p className="text-xs text-royal/60 max-w-[200px] mb-6">
                Discover divine poshak and shringar for Laddu Gopal.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="bg-royal text-gold px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-gold hover:text-royal transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3.5 border-b border-gold/15 pb-4 last:border-b-0"
                >
                  {/* Item Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xs border border-gold/20 bg-royal/10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-sm text-royal hover:text-gold transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="text-royal/40 hover:text-red-600 transition-colors"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] text-royal/60">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.colour && <span>Color: {item.colour}</span>}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-gold/30 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center text-xs text-royal hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-royal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="flex h-6 w-6 items-center justify-center text-xs text-royal hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-royal text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gold/20 bg-cream p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-royal/70">
                Subtotal
              </span>
              <span className="font-serif text-lg font-bold text-royal">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-[10px] text-royal/60 mb-4 text-center">
              Shipping & taxes calculated at checkout
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex h-11 w-full items-center justify-center bg-royal text-xs font-semibold uppercase tracking-widest text-gold hover:bg-royal-light transition-colors"
              >
                Proceed to Checkout →
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                className="flex h-9 w-full items-center justify-center text-xs font-medium text-royal/80 hover:text-royal transition-colors"
              >
                View Full Bag
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
