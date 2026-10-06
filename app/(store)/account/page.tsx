import Link from "next/link";

export const metadata = {
  title: "Devotional Account & Orders | Raj Shringaar",
  description:
    "Look up past sacred orders and manage your devotional delivery details.",
};

export default function AccountPage() {
  return (
    <div className="bg-ivory py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[650px] bg-white border border-gold/30 p-8 sm:p-12 text-center shadow-xs space-y-6">
        <span className="text-4xl text-gold block">🪷</span>

        <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-semibold">
          ॥ श्री कृष्णाय नमः ॥
        </p>

        <h1 className="font-serif text-3xl text-royal">
          Devotee Account Sewa
        </h1>

        <p className="text-xs sm:text-sm text-royal/70 leading-relaxed max-w-md mx-auto">
          At Raj Shringaar, we keep ordering simple and sacred without requiring
          passwords. You can view, track, or check receipt details for any past
          orders using your phone number or Order Reference.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/track-order"
            className="h-11 px-8 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light inline-flex items-center justify-center transition-colors shadow-sm"
          >
            Track My Order →
          </Link>
          <Link
            href="/shop"
            className="h-11 px-8 border border-gold/40 text-royal text-xs font-semibold uppercase tracking-wider hover:bg-cream inline-flex items-center justify-center transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
