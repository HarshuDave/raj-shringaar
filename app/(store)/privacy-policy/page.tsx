import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Raj Shringaar",
  description: "Privacy and personal data protection policy of Raj Shringaar.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[850px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Privacy Policy</span>
        </nav>

        <div className="border-b border-gold/20 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Privacy Policy
          </h1>
        </div>

        <div className="bg-white border border-gold/20 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-royal/80 leading-relaxed shadow-xs">
          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p>
              When you place an order on Raj Shringaar, we collect your name, email address,
              phone number, and shipping destination strictly to fulfill your devotional order
              and provide courier updates.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              2. Data Protection &amp; Respect
            </h2>
            <p>
              We honor your privacy and never sell, trade, or share your contact details with
              third-party advertisers. Your information is shared only with our trusted courier
              partners (e.g. Blue Dart) for delivery execution.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              3. Secure Online Transactions
            </h2>
            <p>
              All online payments are processed through RBI-approved, PCI-DSS compliant payment
              gateways. Raj Shringaar never stores your bank account, credit card,
              or UPI credentials on its servers.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-royal font-semibold mb-2">
              4. Contact Us
            </h2>
            <p>
              If you have any questions regarding your personal information, please write to us at{" "}
              <a href="mailto:privacy@rajshringaar.com" className="text-gold font-semibold underline">
                privacy@rajshringaar.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
