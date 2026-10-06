"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/shop" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "COMBOS", href: "/shop?category=combos" },
  { label: "SIZE GUIDE", href: "/size-guide" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    const cleanHref = href.split("?")[0];
    if (href.includes("category=combos")) {
      if (typeof window !== "undefined" && window.location.search.includes("combos")) {
        return true;
      }
      return false;
    }
    if (cleanHref === "/shop") {
      if (typeof window !== "undefined" && window.location.search.includes("combos")) {
        return false;
      }
      return pathname.startsWith("/shop") || pathname.startsWith("/product");
    }
    return pathname.startsWith(cleanHref);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] max-w-[85vw] flex-col bg-royal transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/logo.png"
              alt="Raj Shringaar"
              width={52}
              height={52}
              className="h-13 w-13 object-contain"
            />
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white"
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

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-5 py-6">
          {navigation.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between border-b border-white/10 py-4 text-[11px] font-medium tracking-[0.3em] transition-colors ${
                  active
                    ? "text-gold font-bold bg-white/5 px-2 -mx-2 border-l-2 border-l-gold"
                    : "text-white/75 hover:text-gold"
                }`}
              >
                {item.label}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={active ? "text-gold opacity-100" : "opacity-40"}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Account + Cart */}
        <div className="border-t border-white/10 px-5 py-5">
          <div className="mb-4 flex items-center gap-6">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-2 text-[11px] text-white/60 transition-colors hover:text-gold"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
              </svg>
              Account
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-2 text-[11px] text-white/60 transition-colors hover:text-gold"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M5 8h14l1 13H4L5 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              Cart
            </Link>
          </div>

          <p className="text-[10px] tracking-[0.25em] text-white/25">
            ॥ श्री कृष्णाय नमः ॥
          </p>
        </div>
      </div>
    </>
  );
}
