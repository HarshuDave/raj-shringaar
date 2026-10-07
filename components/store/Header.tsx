"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";
import { useCartStore } from "@/lib/store/cart";
import { shippingConfig } from "@/lib/config/shipping";

const navigation = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/shop" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "COMBOS", href: "/shop?category=combos" },
  { label: "SIZE GUIDE", href: "/size-guide" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { openCart, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30">
        {/* Announcement Bar */}
        <div className="h-8 bg-royal px-4 text-[10px] text-white">
          <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between">
            <span>
              Free Shipping on Orders above ₹{shippingConfig.freeShippingThreshold}
            </span>

            <span className="hidden text-gold sm:block">
              ॥ श्री कृष्णाय नमः ॥
            </span>

            <span className="hidden sm:block">Happy Janmashtami 🌸</span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="border-b border-white/10 bg-royal">
          <div className="mx-auto flex h-[82px] max-w-[1440px] items-center px-5 lg:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-30 -mb-8 flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-visible"
            >
              <Image
                src="/logo.png"
                alt="Raj Shringaar"
                width={120}
                height={120}
                priority
                className="h-[120px] w-[120px] scale-[2.25] object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="ml-auto hidden items-center gap-6 xl:flex">
              {navigation.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group relative py-8 text-[11px] font-medium tracking-wide transition-colors ${
                      active ? "text-gold font-semibold" : "text-white hover:text-gold"
                    }`}
                  >
                    {item.label}

                    {active ? (
                      <span className="absolute bottom-4 left-0 h-[2px] w-full bg-gold shadow-[0_0_8px_rgba(201,162,77,0.5)]" />
                    ) : (
                      <span className="absolute bottom-4 left-0 h-[2px] w-0 bg-gold/60 transition-all duration-300 group-hover:w-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="ml-6 flex items-center gap-4 text-white">
              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className={`transition-colors ${searchOpen ? "text-gold" : "hover:text-gold"}`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </button>

              {/* Account — hidden on mobile */}
              <Link
                href="/account"
                aria-label="Account"
                className="hidden transition-colors hover:text-gold sm:block"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
                </svg>
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                aria-label="View cart"
                className="relative transition-colors hover:text-gold"
              >
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 8h14l1 13H4L5 8Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>

                {/* Cart count */}
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-royal">
                  {totalItems}
                </span>
              </button>

              {/* Mobile Hamburger — visible below xl */}
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className="xl:hidden"
              >
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="bg-royal-light border-b border-gold/30 px-5 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto flex max-w-[800px] items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Poshak, Mukut, Mala, Shringar, Jhula..."
                  className="w-full h-11 pl-4 pr-10 bg-white/10 border border-gold/40 text-xs text-white placeholder-white/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-11 px-6 bg-gold text-royal text-xs font-bold uppercase tracking-wider hover:bg-gold-light transition-colors shrink-0"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-white/60 hover:text-white text-xs px-2"
                aria-label="Close search"
              >
                Close
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
