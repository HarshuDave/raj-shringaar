import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Raj Shringaar",
  description: "Terms and conditions of purchase for Raj Shringaar devotional store.",
};

export default function TermsPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[850px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Terms &amp; Conditions</span>
        </nav>

        <div className="border-b border-gold/20 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Terms &amp; Conditions
          </h1>
        </div>

        <div className="bg-white border border-gold/20 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-royal/80 leading-relaxed shadow-xs">
          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              1. Platform Nature
            </h2>
            <p>
              Raj Shringaar is an exclusive devotional platform dedicated to Laddu Gopal / Bal Gopal
              shringar, poshak, mukut, and accessories. By visiting or placing an order on this website,
              you agree to these terms and our devotional policies.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              2. Product Accuracy &amp; Handcraft Nuances
            </h2>
            <p>
              Many of our poshak and mukut are handcrafted by traditional artisans. Subtle variations
              in zari stitch work, stone shade, or peacock feather orientation are natural marks of
              handcrafted devotion and not defects.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              3. Pricing &amp; Orders
            </h2>
            <p>
              All prices are listed in Indian Rupees (₹) inclusive of GST. We reserve the right to
              cancel orders in the event of unforeseen inventory shortages or courier unserviceability,
              with full immediate refund.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              4. Governing Law
            </h2>
            <p>
              Any disputes arising from transactions on this platform are subject to the exclusive
              jurisdiction of courts in Nathdwara, Rajasthan, India.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
