import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";

const fallbackCategories = [
  { name: "Poshak", href: "/shop?category=poshak", image: "/categories/poshak.png" },
  { name: "Mukut", href: "/shop?category=mukut", image: "/categories/mukut.png" },
  { name: "Mala", href: "/shop?category=mala", image: "/categories/mala.png" },
  { name: "Shringaar", href: "/shop?category=shringaar", image: "/categories/shringaar.png" },
  { name: "Jhula", href: "/shop?category=jhula", image: "/categories/jhula.png" },
  { name: "Bansuri", href: "/shop?category=bansuri", image: "/categories/bansuri.png" },
  { name: "Combos", href: "/shop?category=combos", image: "/categories/combos.png" },
];

export default function CategorySection({
  categories,
}: {
  categories?: Category[];
}) {
  const displayItems =
    categories && categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          href: `/shop?category=${c.slug}`,
          image: c.image || "/categories/poshak.png",
        }))
      : fallbackCategories;

  return (
    <section className="bg-ivory px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <div className="mb-10 flex items-center justify-center gap-5">
          <span className="hidden h-px w-20 bg-gold/50 sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-gold">✦</span>

            <h2 className="font-serif text-3xl text-royal sm:text-4xl">
              Shop by Category
            </h2>

            <span className="text-sm text-gold">✦</span>
          </div>

          <span className="hidden h-px w-20 bg-gold/50 sm:block" />
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {displayItems.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group overflow-hidden rounded-xl border border-gold/30 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[1.15/1] overflow-hidden bg-[#102c4d]">
                <Image
                  src={category.image}
                  alt={`${category.name} for Laddu Gopal`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/0" />
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between bg-white px-4 py-4">
                <h3 className="font-serif text-lg text-royal">
                  {category.name}
                </h3>

                <span className="text-xs font-medium uppercase tracking-wide text-royal transition-transform duration-300 group-hover:translate-x-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
