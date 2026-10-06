import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us | Raj Shringaar",
  description:
    "Discover the spiritual legacy and devotional craftsmanship behind Raj Shringaar.",
};

export default function AboutPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">About Us</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-2">
            Divine Elegance
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl text-royal mb-4">
            Shringar jo Prem se ho.
          </h1>
          <div className="h-0.5 w-16 bg-gold mx-auto mb-6" />
          <p className="text-xs sm:text-sm text-royal/70 max-w-xl mx-auto leading-relaxed">
            Raj Shringaar was born from an unwavering devotion to Bal Gopal. We
            believe that adorning Thakurji is not mere ornamentation—it is the
            highest expression of sacred love (Bhakti).
          </p>
        </div>

        {/* Story Section */}
        <div id="story" className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="relative aspect-4/3 w-full overflow-hidden border border-gold/30 bg-royal shadow-md">
            <Image
              src="/hero-laddu-gopal.png"
              alt="Bal Gopal Shringar by Raj Shringaar"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-royal/80 leading-relaxed">
            <h2 className="font-serif text-2xl text-royal">Our Sacred Journey</h2>
            <p>
              In Hindu tradition, Laddu Gopal is cherished not as a stone or metal
              idol, but as a living member of the family—the divine child who fills
              the household with eternal joy and blessings.
            </p>
            <p>
              Observing the lack of authentically traditional yet exquisitely
              crafted shringar in the modern online marketplace, we established
              Raj Shringaar. We source and curate premium fabrics, certified
              zari, unblemished moti, and hand-molded mukuts that honor sacred
              Vedic traditions.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div id="why" className="bg-cream border border-gold/30 p-8 sm:p-12 mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl text-royal text-center mb-8">
            The Raj Shringaar Promise
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-royal/80">
            <div className="bg-white p-6 border border-gold/20">
              <span className="text-2xl text-gold mb-2 block">🪷</span>
              <h3 className="font-serif text-base text-royal font-semibold mb-2">
                Pure Fabrics
              </h3>
              <p className="leading-relaxed">
                Raw silk, soft velvet, and pure brocade gentle enough for
                Thakurji&apos;s holy vigraha.
              </p>
            </div>

            <div className="bg-white p-6 border border-gold/20">
              <span className="text-2xl text-gold mb-2 block">✦</span>
              <h3 className="font-serif text-base text-royal font-semibold mb-2">
                Sanctified Craft
              </h3>
              <p className="leading-relaxed">
                Crafted in traditional pilgrim towns by artisans steeped in generations
                of devotional sewa.
              </p>
            </div>

            <div className="bg-white p-6 border border-gold/20">
              <span className="text-2xl text-gold mb-2 block">📦</span>
              <h3 className="font-serif text-base text-royal font-semibold mb-2">
                Pious Handling
              </h3>
              <p className="leading-relaxed">
                Packed with deep reverence and shipped directly to your home
                temple.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center bg-royal px-10 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-royal transition-colors shadow-sm"
          >
            Explore the Collection →
          </Link>
        </div>
      </div>
    </div>
  );
}
