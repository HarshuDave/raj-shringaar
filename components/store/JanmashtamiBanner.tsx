import Image from "next/image";
import Link from "next/link";

export default function JanmashtamiBanner() {
  return (
    <section className="w-full bg-cream px-4 py-10 sm:px-6 lg:px-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden">
        {/* Background Image */}
        <div className="relative h-[380px] sm:h-[460px] lg:h-[540px]">
          <Image
            src="/janmashtami-special.png"
            alt="Janmashtami Special — Raj Shringaar"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />

          {/* Gradient overlay — left-to-right so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-royal/90 via-royal/65 to-royal/10" />

          {/* Real HTML content layered over image — NOT embedded in image */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 sm:px-14 lg:px-20 max-w-xl">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-gold">
                Limited Edition ✦ Sacred Mahotsav Collection
              </p>

              <h2 className="mb-5 font-serif text-4xl leading-[1.1] text-white sm:text-5xl lg:text-[56px]">
                Janmashtami
                <br />
                <span className="text-gold">Special</span>
              </h2>

              <p className="mb-8 text-sm leading-relaxed text-white/80 sm:text-base">
                Celebrate the divine with our exclusive
                <br className="hidden sm:block" /> festive collection for Laddu Gopal.
              </p>

              {/* Real HTML CTA — not a fake image button */}
              <Link
                href="/collections/janmashtami-special"
                className="inline-flex h-12 items-center gap-3 bg-gold px-8 text-[11px] font-semibold uppercase tracking-widest text-royal transition-all duration-300 hover:bg-gold-light hover:gap-4"
              >
                VIEW COLLECTION
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
