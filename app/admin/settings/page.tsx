import Link from "next/link";

export const metadata = {
  title: "Store Settings | Raj Shringaar Admin",
};

export default function AdminSettingsPage() {
  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gold/20 pb-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
          Configuration
        </span>
        <h1 className="font-serif text-3xl text-royal mt-0.5">
          Store &amp; Brand Settings
        </h1>
        <p className="text-xs text-royal/60 mt-1">
          Configure store policies, contact details, and announcement banners.
        </p>
      </div>

      {/* Brand Identity */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg text-royal border-b border-gold/20 pb-2">
          Brand Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Brand Name
            </label>
            <input
              type="text"
              readOnly
              value="Raj Shringaar"
              className="w-full h-11 px-3.5 border border-gold/20 bg-cream/40 text-royal outline-none font-serif text-sm font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Primary Tagline
            </label>
            <input
              type="text"
              readOnly
              value="Divine Elegance"
              className="w-full h-11 px-3.5 border border-gold/20 bg-cream/40 text-royal outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Emotional Brand Phrase
            </label>
            <input
              type="text"
              readOnly
              value="Shringar jo Prem se ho."
              className="w-full h-11 px-3.5 border border-gold/20 bg-cream/40 text-royal outline-none font-serif"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar & Shipping */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg text-royal border-b border-gold/20 pb-2">
          Announcement &amp; Delivery Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Top Announcement Text
            </label>
            <input
              type="text"
              defaultValue="Free Shipping on Orders above ₹999"
              className="w-full h-11 px-3.5 border border-gold/30 bg-white text-royal outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Free Delivery Threshold (₹)
            </label>
            <input
              type="number"
              defaultValue={999}
              className="w-full h-11 px-3.5 border border-gold/30 bg-white text-royal outline-none focus:border-gold font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Center Sacred Inscription
            </label>
            <input
              type="text"
              defaultValue="॥ श्री कृष्णाय नमः ॥"
              className="w-full h-11 px-3.5 border border-gold/30 bg-white text-royal outline-none focus:border-gold font-serif text-sm text-gold"
            />
          </div>
        </div>
      </div>

      {/* Customer Care Channels */}
      <div className="bg-white border border-gold/20 p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-lg text-royal border-b border-gold/20 pb-2">
          Customer Care Contacts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Sewa Support Email
            </label>
            <input
              type="email"
              defaultValue="sewa@rajshringaar.com"
              className="w-full h-11 px-3.5 border border-gold/30 bg-white text-royal outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-royal mb-1.5">
              Customer Helpline
            </label>
            <input
              type="tel"
              defaultValue="+91 63672 17197"
              className="w-full h-11 px-3.5 border border-gold/30 bg-white text-royal outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Integrations Overview */}
      <div className="bg-cream border border-gold/30 p-6 space-y-3">
        <h3 className="font-serif text-base text-royal font-semibold">
          Integrations Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-white border border-gold/20">
            <span className="font-bold text-royal block">Payment Gateway (Razorpay)</span>
            <span className="text-royal/60 text-[11px]">
              Ready for production keys in .env.local
            </span>
          </div>
          <div className="p-3 bg-white border border-gold/20">
            <span className="font-bold text-royal block">Shipping Courier (Blue Dart)</span>
            <span className="text-royal/60 text-[11px]">
              Ready for consignment API integration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
