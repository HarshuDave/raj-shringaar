import Link from "next/link";

export const metadata = {
  title: "Return & Exchange Policy | Raj Shringaar",
  description:
    "Information regarding returns and size exchanges for Bal Gopal shringar products.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[850px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Return &amp; Exchange</span>
        </nav>

        <div className="border-b border-gold/20 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Return &amp; Size Exchange Policy
          </h1>
        </div>

        <div className="bg-white border border-gold/20 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-royal/80 leading-relaxed shadow-xs">
          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              1. Our Devotional Commitment
            </h2>
            <p>
              We understand how important it is for Thakurji to be adorned in perfectly
              fitting Poshak and Mukut. If you ordered the wrong size for your Bal Gopal,
              we gladly offer hassle-free size exchanges within <strong>7 days</strong> of delivery.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              2. Eligibility for Exchange
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-royal/70 mt-2">
              <li>The item must be unused, unwashed, and in its pristine sacred condition.</li>
              <li>Original tags, boxes, and velvet storage pouches must be intact.</li>
              <li>Intimate deity cosmetics (Kasturi, Chandan, Itra/Perfumes) are non-returnable once unsealed for sacred purity reasons.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              3. Damaged or Defective Items
            </h2>
            <p>
              In the rare event that an item is damaged during transit, please share a photo/video
              with our sewa team within 48 hours of receipt at <a href="mailto:sewa@rajshringaar.com" className="text-gold font-semibold underline">sewa@rajshringaar.com</a>.
              We will promptly dispatch an unblemished replacement at no additional cost.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              4. How to Request an Exchange
            </h2>
            <p>
              Simply WhatsApp our team at <strong>+91 63672 17197</strong> with your Order Number (e.g. RS-123456)
              and the desired replacement size. We will guide you through the process step-by-step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
