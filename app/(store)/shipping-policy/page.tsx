import Link from "next/link";
import { shippingConfig } from "@/lib/config/shipping";

export const metadata = {
  title: "Shipping Policy | Raj Shringaar",
  description:
    "Learn about our sanctified packaging, dispatch timelines, and delivery across India.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[850px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Shipping Policy</span>
        </nav>

        <div className="border-b border-gold/20 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Shipping &amp; Delivery Policy
          </h1>
        </div>

        <div className="bg-white border border-gold/20 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-royal/80 leading-relaxed shadow-xs">
          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              1. Sacred &amp; Reverent Packaging
            </h2>
            <p>
              At Raj Shringaar, every piece of Poshak, Mukut, and Shringar is treated
              as a divine offering for Thakurji. Items are carefully encased in soft
              velvet or protective wrap inside rigid packaging boxes to prevent any
              creasing, bent peacock plumes, or crushed embroidery during transit.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              2. Order Processing &amp; Dispatch
            </h2>
            <p>
              Orders are typically packed and dispatched within <strong>24 to 48 hours</strong> of
              order confirmation (excluding Sundays and sacred festivals). Once dispatched,
              you will receive an update with your courier consignment details.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              3. Delivery Timelines Across India
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-royal/70 mt-2">
              <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Jaipur):</strong> 2 to 4 business days.</li>
              <li><strong>Rest of India (Tier 2 &amp; Tier 3 Cities):</strong> 4 to 6 business days.</li>
              <li><strong>Remote / Northeast Regions:</strong> 6 to 8 business days.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              4. Shipping Rates
            </h2>
            <p>
              We provide <strong>FREE Standard Delivery</strong> across all Indian pin codes for all
              orders of ₹{shippingConfig.freeShippingThreshold} or above. For orders below ₹{shippingConfig.freeShippingThreshold}, a nominal standard fee of ₹{shippingConfig.standardShippingFee} applies
              to ensure secure packaging.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              5. Delivery Inquiries
            </h2>
            <p>
              For urgent delivery requests ahead of Janmashtami, Radhashtami, or Diwali, please contact our
              sewa desk at <a href="mailto:sewa@rajshringaar.com" className="text-gold font-semibold underline">sewa@rajshringaar.com</a> or WhatsApp us at +91 63672 17197.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
