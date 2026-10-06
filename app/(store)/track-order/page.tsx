"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "@/lib/types";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError("No order found matching the provided reference or phone number.");
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
            Enter your 6-digit Order Reference Number (e.g. RS-123456) or 10-digit mobile number.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white border border-gold/20 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. RS-123456 or 6367217197"
              className="flex-1 h-12 px-4 border border-gold/30 text-xs bg-ivory text-royal placeholder:text-royal/40 outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-8 bg-royal text-gold text-xs font-bold uppercase tracking-wider hover:bg-royal-light transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? "Searching..." : "Track Order →"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white border border-gold/30 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
              <div>
                <span className="text-[10px] text-royal/60 uppercase tracking-widest block">
                  Order Number
                </span>
                <span className="font-serif text-2xl font-bold text-royal">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-royal/70">Current Status:</span>
                <span className="px-3 py-1 bg-royal text-gold font-bold text-xs uppercase tracking-wider">
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-cream p-4 border border-gold/20 text-xs">
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Recipient</span>
                <span className="font-bold text-royal">{order.customerName}</span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Destination</span>
                <span className="font-bold text-royal">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Order Date</span>
                <span className="font-bold text-royal">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">Amount</span>
                <span className="font-bold text-royal">₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-serif text-sm font-semibold text-royal mb-3">
                Items in this Consignment
              </h3>
              <div className="divide-y divide-gold/15 border border-gold/20 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-serif font-medium text-royal text-sm">{item.productName}</p>
                      <p className="text-[10px] text-royal/60 mt-0.5">
                        {item.size ? `Size ${item.size} • ` : ""}Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-royal">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href={`/order-confirmation/${order.id}`}
                className="text-xs text-gold font-semibold hover:underline"
              >
                View Full Printable Receipt →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
