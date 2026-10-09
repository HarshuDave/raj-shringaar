"use client";

import { useState } from "react";
import Link from "next/link";

type PublicTracking = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  destinationCity: string;
  destinationState: string;
  maskedRecipientName: string;
  maskedPhone: string;
  itemCount: number;
  totalAmount: number;
  itemsSummary: Array<{
    productName: string;
    size?: string;
    colour?: string;
    quantity: number;
  }>;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<PublicTracking | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTracking(null);
    setOrderId(null);
    setAccessToken(null);

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanOrderNumber) {
      setError("Please enter your Order Reference Number (e.g. RS-123456).");
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter the 10-digit mobile number associated with the order.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(cleanOrderNumber)}&phone=${encodeURIComponent(cleanPhone)}`
      );
      const data = await res.json();

      if (res.ok && data.success && data.tracking) {
        setTracking(data.tracking);
        setOrderId(data.orderId || null);
        setAccessToken(data.accessToken || null);
      } else {
        setError(data.error || "No order found matching the provided reference and mobile number.");
      }
    } catch {
      setError("Unable to retrieve order details right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ivory py-14 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[800px] space-y-8">
        <nav className="flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Track Order</span>
        </nav>

        <div className="border-b border-gold/20 pb-4 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-royal">
            Track Your Devotional Order
          </h1>
          <p className="text-xs sm:text-sm text-royal/70 mt-1">
            To protect your privacy, enter both your 6-digit Order Reference Number and registered 10-digit mobile number.
          </p>
        </div>

        {/* Dual-Field Secure Lookup Form */}
        <div className="bg-white border border-gold/20 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-royal/80 mb-1.5">
                  Order Reference
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. RS-123456"
                  className="w-full h-12 px-4 border border-gold/30 text-xs bg-ivory text-royal placeholder:text-royal/40 outline-none focus:border-gold uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-royal/80 mb-1.5">
                  10-Digit Mobile Number
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-royal text-gold text-xs font-bold uppercase tracking-wider hover:bg-royal-light transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying & Tracking..." : "Track Sacred Order →"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Sanitized Tracking Result Card */}
        {tracking && (
          <div className="bg-white border border-gold/30 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
              <div>
                <span className="text-[10px] text-royal/60 uppercase tracking-widest block">
                  Order Reference
                </span>
                <span className="font-serif text-2xl font-bold text-royal">
                  {tracking.orderNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-royal/70">Current Status:</span>
                <span className="px-3 py-1 bg-royal text-gold font-bold text-xs uppercase tracking-wider">
                  {tracking.orderStatus}
                </span>
              </div>
            </div>

            {/* Quick Status Grid — Sanitized (No street address, no email, masked phone) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-cream p-4 border border-gold/20 text-xs">
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Recipient</span>
                <span className="font-bold text-royal">{tracking.maskedRecipientName}</span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Destination</span>
                <span className="font-bold text-royal">
                  {tracking.destinationCity}, {tracking.destinationState}
                </span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Order Date</span>
                <span className="font-bold text-royal">
                  {new Date(tracking.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Contact</span>
                <span className="font-bold text-royal">{tracking.maskedPhone}</span>
              </div>
            </div>

            {/* Consignment Items */}
            <div>
              <h3 className="font-serif text-sm font-semibold text-royal mb-3">
                Items in this Consignment ({tracking.itemCount} items)
              </h3>
              <div className="divide-y divide-gold/15 border border-gold/20 text-xs">
                {tracking.itemsSummary.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-serif font-medium text-royal text-sm">{item.productName}</p>
                      <p className="text-[10px] text-royal/60 mt-0.5">
                        {item.size ? `Size ${item.size} • ` : ""}
                        {item.colour ? `Colour: ${item.colour} • ` : ""}
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount & Receipt Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4 border-t border-gold/20">
              <div className="text-sm font-semibold text-royal">
                Total Order Amount: ₹{tracking.totalAmount.toLocaleString("en-IN")}
              </div>

              {orderId && accessToken && (
                <Link
                  href={`/order-confirmation/${orderId}?token=${accessToken}`}
                  className="text-xs text-gold font-bold hover:underline inline-flex items-center gap-1"
                >
                  View Full Printable Receipt →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
