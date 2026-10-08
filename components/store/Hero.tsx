import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    icon: "♡",
    title: "Premium Quality",
  },
  {
    icon: "♢",
    title: "Made with Devotion",
  },
  {
    icon: "□",
    title: "Secure Packaging",
  },
  {
    icon: "⌁",
    title: "Fast Delivery",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-royal text-white">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#17395f] opacity-30 blur-[120px]" />

      <div className="mx-auto grid min-h-[560px] max-w-[1440px] lg:grid-cols-2">
        {/* Left Content Column */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center lg:items-start lg:text-left px-5 py-10 sm:px-8 sm:py-14 lg:px-16 xl:px-20 lg:py-20">
          <p className="mb-3 sm:mb-5 text-[11px] sm:text-xs font-medium uppercase tracking-[0.35em] text-gold">
            Divine Elegance
          </p>

          <h1 className="max-w-xl font-serif text-4xl sm:text-5xl lg:text-[68px] leading-[1.1] sm:leading-[1.05] text-gold">
            Shringar jo
            <br />
            Prem se ho.
          </h1>

          <div className="my-5 sm:my-7 h-px w-16 sm:w-20 bg-gold mx-auto lg:mx-0" />

          <p className="max-w-md text-sm sm:text-base lg:text-lg leading-relaxed text-white/85">
            Premium Poshak &amp; Shringaar
            <br />
            for your Laddu Gopal.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 sm:mt-9 flex flex-wrap justify-center lg:justify-start gap-3.5 sm:gap-4 w-full">
            <Link
              href="/shop?category=poshak"
              className="inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 sm:gap-3 bg-gold px-6 sm:px-7 text-xs font-semibold tracking-wide text-royal transition-all hover:bg-gold-light"
            >
              SHOP POSHAK
              <span>→</span>
            </Link>

            <Link
              href="/collections"
              className="inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 sm:gap-3 border border-gold/70 px-6 sm:px-7 text-xs font-semibold tracking-wide text-white transition-all hover:bg-gold hover:text-royal"
            >
              EXPLORE COLLECTIONS
              <span>→</span>
            </Link>
          </div>

          {/* Mobile Hero Image — Rendered directly after CTA buttons */}
          <div className="relative mt-7 sm:mt-9 w-full max-w-[340px] sm:max-w-[420px] mx-auto block lg:hidden">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs border border-gold/30 shadow-lg bg-[#102c4d]">
              <Image
                src="/hero-laddu-gopal.png"
                alt="Laddu Gopal in premium blue and gold shringaar"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 640px) 90vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-royal/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Highlights — 2×2 grid on mobile, 4-column on desktop */}
          <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-5 max-w-sm sm:max-w-xl mx-auto lg:mx-0 w-full">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <span className="mb-1.5 sm:mb-2 text-lg sm:text-xl text-gold">{item.icon}</span>

                <span className="text-[10px] uppercase tracking-wide text-white/70">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual — Desktop only */}
        <div className="relative hidden lg:block overflow-hidden min-h-[560px]">
          <Image
            src="/hero-laddu-gopal.png"
            alt="Laddu Gopal in premium blue and gold shringaar"
            fill
            priority
            className="object-cover object-right"
            sizes="50vw"
          />

          {/* Subtle blend into the left content */}
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-royal to-transparent" />
        </div>
      </div>
    </section>
  );
}
