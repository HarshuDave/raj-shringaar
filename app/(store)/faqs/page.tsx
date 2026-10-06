import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions | Raj Shringaar",
  description:
    "Common questions regarding Laddu Gopal sizing, poshak materials, packaging, and care.",
};

const faqs = [
  {
    q: "How do I choose the correct Poshak size for my Laddu Gopal?",
    a: "Measure your Thakurji from His lotus feet to the top of His head (without mukut). Size 0 is for 0-1.5\", Size 1 for 1.5-2.5\", Size 2 for 2.5-3.5\", Size 3 for 3.5-4.5\", Size 4 for 4.5-5.5\", Size 5 for 5.5-6.5\", and Size 6 for 6.5-7.5\". Check our dedicated Size Guide page for a complete illustrated table.",
  },
  {
    q: "Are the fabrics pure and suitable for sacred deity worship?",
    a: "Yes. All our poshak fabrics are carefully curated from pure raw silks, rich brocades, soft cotton velvets, and sanitized threads crafted specifically for holy deity sewa.",
  },
  {
    q: "Can I order custom sizes or bulk sets for temple festivals?",
    a: "Yes, we gladly cater to temple authorities and festive bulk requirements for Janmashtami, Annakut, and Holi. Please contact our customer sewa team at sewa@rajshringaar.com.",
  },
  {
    q: "How should I clean and maintain my Gopal's poshak and mukut?",
    a: "Heavy zari and moti poshak should never be washed in water. Gently wipe them with dry soft cotton and store them in the velvet pouch provided. Keep mukut and bansuri away from direct water and perfume sprays.",
  },
  {
    q: "How long will my order take to reach me?",
    a: "Orders dispatch within 24-48 hours. Most metro cities receive delivery in 2-4 business days, while other locations take 4-6 business days.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "To ensure sacred reverence, safe handling, and dedicated courier insurance, Raj Shringaar operates as a 100% prepaid devotional platform.",
  },
];

export default function FAQsPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[850px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">FAQs</span>
        </nav>

        <div className="border-b border-gold/20 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-royal/70 mt-1">
            Common answers regarding sizing, devotional fabrics, and sewa care.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gold/20 p-6 shadow-xs space-y-2"
            >
              <h3 className="font-serif text-base text-royal font-semibold flex items-start gap-2">
                <span className="text-gold font-bold">Q.</span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-royal/75 leading-relaxed pl-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-cream border border-gold/30 p-6 text-center space-y-3">
          <h3 className="font-serif text-lg text-royal font-semibold">
            Have a question not listed here?
          </h3>
          <p className="text-xs text-royal/70 max-w-md mx-auto">
            Our devotional customer care team is always delighted to assist Thakurji&apos;s devotees.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center bg-royal px-6 text-xs uppercase tracking-wider font-semibold text-gold hover:bg-royal-light transition-colors"
          >
            Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
}
