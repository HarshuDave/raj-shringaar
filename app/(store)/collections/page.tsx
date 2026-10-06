import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/data/repository";

export const metadata = {
  title: "Curated Collections | Raj Shringaar",
  description:
    "Explore festive and devotional collections crafted with divine elegance for Laddu Gopal.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="bg-ivory py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Collections</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-2">
            Curated For Thakurji
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl text-royal mb-4">
            Divine Collections
          </h1>
          <p className="text-xs sm:text-sm text-royal/70 leading-relaxed">
            Every collection is themed around holy festivals, traditions, and the
            sacred bond between the devotee and Bal Gopal.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative h-[320px] sm:h-[400px] overflow-hidden border border-gold/30 bg-royal shadow-md"
            >
              <Image
                src={col.image || "/janmashtami-special.png"}
                alt={col.name}
                fill
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-75"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-royal via-royal/40 to-transparent" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold mb-2">
                  Special Collection
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2 group-hover:text-gold transition-colors">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="text-xs text-white/80 line-clamp-2 max-w-md mb-4">
                    {col.description}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold group-hover:gap-3 transition-all">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
