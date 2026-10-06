import Link from "next/link";
import ContactForm from "@/components/store/ContactForm";

export const metadata = {
  title: "Contact Us | Raj Shringaar",
  description:
    "Get in touch with the Raj Shringaar devotional customer care team for size assistance and custom orders.",
};

export default function ContactPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[900px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Contact Us</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-2">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal mb-3">
            Devotional Customer Sewa
          </h1>
          <p className="text-xs sm:text-sm text-royal/70 max-w-md mx-auto leading-relaxed">
            Have questions regarding sizes, bulk festive orders, or custom
            shringar? Our sewa team is here to assist you with joy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="bg-royal text-white p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl text-gold border-b border-white/20 pb-3">
              Reach Out
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold block mb-1">
                  Email
                </span>
                <p className="text-white/80">sewa@rajshringaar.com</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold block mb-1">
                  Customer Assistance
                </span>
                <p className="text-white/80">+91 63672 17197</p>
                <span className="text-[10px] text-white/50 block">
                  Mon – Sat, 10 AM – 7 PM IST
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold block mb-1">
                  Divine Heritage Hub
                </span>
                <p className="text-white/80 leading-relaxed">
                  Shreenathji Temple, Naya Bazar,
                  <br />
                  Nathdwara,
                  <br />
                  Rajasthan – 313301
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[10px] text-white/40">
              Shringar jo Prem se ho.
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="md:col-span-2 bg-white border border-gold/30 p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl text-royal mb-4 border-b border-gold/20 pb-3">
              Send a Devotional Inquiry
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
