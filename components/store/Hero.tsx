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
        {/* Left Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-20 sm:px-12 lg:px-16 xl:px-20">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-gold">
            Divine Elegance
          </p>

          <h1 className="max-w-xl font-serif text-5xl leading-[1.05] text-gold sm:text-6xl lg:text-[68px]">
            Shringar jo
            <br />
            Prem se ho.
          </h1>

          <div className="my-7 h-px w-20 bg-gold" />

          <p className="max-w-md text-base leading-7 text-white/80 sm:text-lg">
            Premium Poshak & Shringaar
            <br />
            for your Laddu Gopal.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/shop?category=poshak"
              className="inline-flex h-12 items-center justify-center gap-3 bg-gold px-7 text-xs font-semibold tracking-wide text-royal transition-all hover:bg-gold-light"
            >
              SHOP POSHAK
              <span>→</span>
            </Link>

            <Link
              href="/collections"
              className="inline-flex h-12 items-center justify-center gap-3 border border-gold/70 px-7 text-xs font-semibold tracking-wide text-white transition-all hover:bg-gold hover:text-royal"
            >
              EXPLORE COLLECTIONS
              <span>→</span>
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-x-5">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <span className="mb-2 text-xl text-gold">{item.icon}</span>

                <span className="text-[10px] uppercase tracking-wide text-white/70">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative min-h-[430px] overflow-hidden lg:min-h-full">
          <Image
            src="/hero-laddu-gopal.png"
            alt="Laddu Gopal in premium blue and gold shringaar"
            fill
            priority
            className="object-cover object-right"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* Subtle blend into the left content */}
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-royal to-transparent" />
        </div>
      </div>
    </section>
  );
}
