import Link from "next/link";

export const metadata = {
  title: "Laddu Gopal Size Guide | Raj Shringaar",
  description:
    "Find the perfect Poshak, Mukut, and Shringar size for your Bal Gopal with our comprehensive sizing chart.",
};

const sizeChart = [
  {
    size: "Size 0",
    heightInch: "0 – 1.5 inches",
    heightCm: "0 – 3.8 cm",
    poshakGhera: "3 – 4 inches",
    recommendedFor: "Newborn / Chhote Gopal",
  },
  {
    size: "Size 1",
    heightInch: "1.5 – 2.5 inches",
    heightCm: "3.8 – 6.4 cm",
    poshakGhera: "4 – 5 inches",
    recommendedFor: "Bal Gopal",
  },
  {
    size: "Size 2",
    heightInch: "2.5 – 3.5 inches",
    heightCm: "6.4 – 8.9 cm",
    poshakGhera: "5 – 6 inches",
    recommendedFor: "Bal Gopal",
  },
  {
    size: "Size 3",
    heightInch: "3.5 – 4.5 inches",
    heightCm: "8.9 – 11.4 cm",
    poshakGhera: "6 – 7.5 inches",
    recommendedFor: "Medium Gopal (Most Common)",
  },
  {
    size: "Size 4",
    heightInch: "4.5 – 5.5 inches",
    heightCm: "11.4 – 14.0 cm",
    poshakGhera: "7.5 – 9 inches",
    recommendedFor: "Medium Gopal (Most Common)",
  },
  {
    size: "Size 5",
    heightInch: "5.5 – 6.5 inches",
    heightCm: "14.0 – 16.5 cm",
    poshakGhera: "9 – 10.5 inches",
    recommendedFor: "Bada Laddu Gopal",
  },
  {
    size: "Size 6",
    heightInch: "6.5 – 7.5 inches",
    heightCm: "16.5 – 19.1 cm",
    poshakGhera: "10.5 – 12 inches",
    recommendedFor: "Temple & Large Vigraha",
  },
];

export default function SizeGuidePage() {
  return (
    <div className="bg-ivory py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Size Guide</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-2">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal mb-4">
            Laddu Gopal Sizing Guide
          </h1>
          <p className="text-xs sm:text-sm text-royal/70 max-w-xl mx-auto leading-relaxed">
            Ensuring your Thakurji receives a comfortable and divine fit is our
            foremost priority. Follow this guide to pick the exact size for Poshak,
            Mukut, and Shringar.
          </p>
        </div>

        {/* How to Measure Card */}
        <div className="bg-cream border border-gold/30 p-6 sm:p-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gold text-lg">✦</span>
            <h2 className="font-serif text-xl sm:text-2xl text-royal">
              How to Measure Bal Gopal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-royal/80 leading-relaxed">
            <div className="bg-white p-5 border border-gold/20">
              <span className="text-gold font-bold text-sm block mb-2">Step 1</span>
              <p className="font-semibold text-royal mb-1">Measure Vigraha Height</p>
              <p>
                Place a ruler straight from the Lotus feet (Charan Kamal) to the
                top of Thakurji&apos;s head (without mukut). Note the height in inches.
              </p>
            </div>

            <div className="bg-white p-5 border border-gold/20">
              <span className="text-gold font-bold text-sm block mb-2">Step 2</span>
              <p className="font-semibold text-royal mb-1">Check Existing Poshak</p>
              <p>
                Alternatively, take any current well-fitting poshak, lay it flat,
                and measure its diameter (Ghera edge to edge) with a measuring tape.
              </p>
            </div>

            <div className="bg-white p-5 border border-gold/20">
              <span className="text-gold font-bold text-sm block mb-2">Step 3</span>
              <p className="font-semibold text-royal mb-1">Match in Chart</p>
              <p>
                Find your Gopal&apos;s height range in the table below. If you are
                between two sizes, we recommend selecting the slightly larger size
                for graceful draping.
              </p>
            </div>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="bg-white border border-gold/30 overflow-hidden shadow-sm mb-12">
          <div className="bg-royal px-6 py-4 flex items-center justify-between text-white">
            <h3 className="font-serif text-lg text-gold">Official Sizing Chart</h3>
            <span className="text-xs text-white/60">Standard Indian Vigraha Scale</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-gold/20 text-royal font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Size Number</th>
                  <th className="py-3.5 px-4 sm:px-6">Idol Height (Inches)</th>
                  <th className="py-3.5 px-4 sm:px-6">Idol Height (CM)</th>
                  <th className="py-3.5 px-4 sm:px-6">Approx. Poshak Ghera</th>
                  <th className="py-3.5 px-4 sm:px-6">Recommended For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15 text-royal/80">
                {sizeChart.map((row) => (
                  <tr key={row.size} className="hover:bg-ivory transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-royal">
                      {row.size}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">{row.heightInch}</td>
                    <td className="py-3.5 px-4 sm:px-6">{row.heightCm}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-royal">
                      {row.poshakGhera}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-royal/70">
                      {row.recommendedFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Need Help Banner */}
        <div className="bg-royal text-white p-8 sm:p-10 text-center border-t-2 border-gold flex flex-col items-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2 font-semibold">
            Need Guidance?
          </p>
          <h3 className="font-serif text-2xl mb-3">Still Unsure About Sizing?</h3>
          <p className="text-xs text-white/80 max-w-lg mb-6 leading-relaxed">
            Send us a photo of your Thakurji with a standard ruler next to Him,
            and our devotional sewa team will guide you to the perfect size.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center bg-gold px-8 text-xs font-bold uppercase tracking-widest text-royal hover:bg-gold-light transition-colors"
          >
            Contact Sewa Team
          </Link>
        </div>
      </div>
    </div>
  );
}
