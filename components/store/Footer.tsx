import Image from "next/image";
import Link from "next/link";

const shopLinks = [
  { label: "Poshak", href: "/shop?category=poshak" },
  { label: "Mukut", href: "/shop?category=mukut" },
  { label: "Mala", href: "/shop?category=mala" },
  { label: "Shringar", href: "/shop?category=shringar" },
  { label: "Jhula", href: "/shop?category=jhula" },
  { label: "Bansuri", href: "/shop?category=bansuri" },
  { label: "Combos", href: "/shop?category=combos" },
  { label: "All Products", href: "/shop" },
];

const helpLinks = [
  { label: "Size Guide", href: "/size-guide" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return & Exchange", href: "/return-policy" },
  { label: "FAQs", href: "/faqs" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact Us", href: "/contact" },
];

const aboutLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Story", href: "/about#story" },
  { label: "Why Raj Shringaar", href: "/about#why" },
];

export default function Footer() {
  return (
    <footer className="bg-royal text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Raj Shringaar"
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
            </Link>

            <p className="mt-4 font-serif text-lg text-gold">
              Divine Elegance
            </p>

            <p className="mt-2 text-sm leading-relaxed text-white/60 max-w-[240px]">
              Premium Poshak &amp; Shringar for your Laddu Gopal. Crafted with
              devotion, delivered with care.
            </p>

            <div className="mt-4 text-xs text-white/60 space-y-1">
              <p className="text-gold font-medium">📍 Shreenathji Temple, Naya Bazar</p>
              <p>Nathdwara, Rajasthan – 313301</p>
              <p className="pt-0.5">
                📞{" "}
                <a
                  href="tel:+916367217197"
                  className="hover:text-gold transition-colors font-medium text-white/80"
                >
                  +91 63672 17197
                </a>
              </p>
            </div>

            <p className="mt-5 text-xs tracking-[0.3em] text-white/30">
              ॥ श्री कृष्णाय नमः ॥
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-4">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="text-white/50 transition-colors hover:text-gold"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="text-white/50 transition-colors hover:text-gold"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch us on YouTube"
                className="text-white/50 transition-colors hover:text-gold"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Newsletter */}
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              About
            </h4>
            <ul className="mb-8 space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                Newsletter
              </h4>
              <p className="mb-3 text-xs leading-relaxed text-white/50">
                Stay updated with new arrivals and festive collections.
              </p>
              <form className="flex flex-col gap-2" action="#" method="POST">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="h-10 border border-white/20 bg-white/5 px-3 text-sm text-white placeholder-white/30 outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  className="h-10 bg-gold text-[10px] font-semibold uppercase tracking-widest text-royal transition-colors hover:bg-gold-light"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-6 py-5 text-[11px] text-white/40 sm:flex-row lg:px-12">
          <p>© {new Date().getFullYear()} Raj Shringaar. All rights reserved.</p>

          <p className="text-center">
            Shringar jo Prem se ho.{" "}
            <span className="text-white/20">·</span>{" "}
            Made in India 🇮🇳
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
