"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyOrderReceiptAccessAction } from "@/app/actions/order";

export default function OrderReceiptVerificationGate({
  orderId,
  orderNumber,
  orderStatus,
  orderDate,
}: {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  orderDate: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter the 10-digit mobile number associated with this order.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOrderReceiptAccessAction(orderId, cleanPhone);
      if (res.success && res.accessToken) {
        router.push(`/order-confirmation/${orderId}?token=${res.accessToken}`);
        router.refresh();
      } else {
        setError(res.error || "Unable to verify order ownership.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gold/30 p-8 sm:p-12 shadow-sm text-center max-w-lg mx-auto space-y-6">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream border border-gold/40 text-gold text-2xl">
        🔒
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold">
        ॥ श्री कृष्णाय नमः ॥
      </p>

      <h1 className="font-serif text-2xl sm:text-3xl text-royal">
        Devotee Privacy Verification
      </h1>

      <p className="text-xs sm:text-sm text-royal/70 leading-relaxed">
        To protect customer privacy and confidential delivery details, full printable receipts require order verification.
      </p>

      {/* Basic Sanitized Summary */}
      {(() => {
        const maskedOrderNumber = orderNumber.length > 5 ? `${orderNumber.slice(0, 3)}••••${orderNumber.slice(-2)}` : orderNumber;
        return (
          <div className="bg-cream/60 border border-gold/20 p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-royal/60">Order Reference:</span>
              <span className="font-bold text-royal">{maskedOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-royal/60">Order Date:</span>
              <span className="font-bold text-royal">{orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-royal/60">Status:</span>
              <span className="font-bold text-royal uppercase">{orderStatus}</span>
            </div>
          </div>
        );
      })()}

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="space-y-4 pt-2">
        <div className="text-left">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-royal/80 mb-1.5">
            Registered 10-Digit Mobile Number
          </label>
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 9876543210"
            className="w-full h-12 px-4 border border-gold/30 text-xs bg-ivory text-royal placeholder:text-royal/40 outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-royal text-gold text-xs font-bold uppercase tracking-wider hover:bg-royal-light transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Unlock Full Receipt →"}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs text-left">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-gold/20 flex justify-center gap-4 text-xs">
        <Link href="/track-order" className="text-royal/70 hover:text-gold transition-colors">
          ← Back to Track Order
        </Link>
        <span className="text-gold/40">•</span>
        <Link href="/shop" className="text-royal/70 hover:text-gold transition-colors">
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}
