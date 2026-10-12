"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  sendCustomerOtpAction,
  verifyCustomerOtpAndLoginAction,
  logoutCustomerAction,
} from "@/app/actions/customer-auth";
import type { AuthenticatedCustomer } from "@/lib/auth/customer-session";
import type { Order } from "@/lib/types";

interface CustomerAccountClientProps {
  customer: AuthenticatedCustomer | null;
  orders: Order[];
}

export default function CustomerAccountClient({
  customer,
  orders,
}: CustomerAccountClientProps) {
  const router = useRouter();

  // OTP Login State
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Logout State
  const [loggingOut, setLoggingOut] = useState(false);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendCustomerOtpAction(phoneInput);
      if (!res.success) {
        setError(res.error || "Unable to send OTP. Please try again.");
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setCooldown(res.cooldownSeconds);
        }
      } else {
        setNormalizedPhone(res.normalizedPhone || digits.slice(-10));
        setStep("otp");
        setOtpInput("");
        setCooldown(res.cooldownSeconds || 60);
        setInfoMessage(
          `A 6-digit verification code has been sent to +91 ${res.normalizedPhone || digits.slice(-10)}.`
        );
      }
    } catch {
      setError("Unable to process your request right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await sendCustomerOtpAction(normalizedPhone || phoneInput);
      if (!res.success) {
        setError(res.error || "Unable to resend OTP. Please wait and try again.");
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setCooldown(res.cooldownSeconds);
        }
      } else {
        setCooldown(res.cooldownSeconds || 60);
        setOtpInput("");
        setInfoMessage("A new 6-digit verification code has been sent to your mobile.");
      }
    } catch {
      setError("Unable to resend OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = otpInput.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to your mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyCustomerOtpAndLoginAction(
        normalizedPhone || phoneInput,
        cleanOtp
      );
      if (!res.success) {
        setError(res.error || "Invalid or expired OTP. Please try again.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomerAction();
      setStep("phone");
      setPhoneInput("");
      setOtpInput("");
      setError(null);
      setInfoMessage(null);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  // ============================================================================
  // VIEW 1: UNAUTHENTICATED — MOBILE OTP SIGN IN
  // ============================================================================
  if (!customer) {
    return (
      <div className="mx-auto max-w-[540px]">
        <div className="bg-white border border-gold/30 p-6 sm:p-10 shadow-xs">
          <div className="text-center mb-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream border border-gold/40 text-gold text-xl mb-3">
              🪷
            </span>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold font-semibold mb-1">
              ॥ श्री कृष्णाय नमः ॥
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-royal">
              Devotee Account Sign In
            </h1>
            <p className="text-xs sm:text-sm text-royal/70 mt-2 leading-relaxed">
              Sign in securely with your mobile number via one-time passcode
              (OTP) to view your complete order history and sacred receipts.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 border border-red-300 bg-red-50/80 px-4 py-3 text-xs text-red-800 leading-relaxed"
            >
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 border border-gold/40 bg-cream/70 px-4 py-3 text-xs text-royal leading-relaxed">
              {infoMessage}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="customer-mobile-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-royal mb-2"
                >
                  Mobile Number (India)
                </label>
                <div className="flex items-stretch border border-gold/40 bg-ivory/40 focus-within:border-royal">
                  <span className="inline-flex items-center px-3.5 bg-cream border-r border-gold/30 text-xs font-semibold text-royal select-none">
                    +91
                  </span>
                  <input
                    id="customer-mobile-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phoneInput}
                    onChange={(e) =>
                      setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="w-full px-3.5 py-3 text-sm text-royal bg-transparent focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-royal/60 mt-1.5">
                  We will send a 6-digit verification code via SMS. No password required.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneInput.replace(/\D/g, "").length !== 10}
                className="w-full h-11 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {loading ? "Sending Verification Code..." : "Send OTP →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-between bg-cream/60 border border-gold/25 px-3.5 py-2.5 text-xs">
                <div>
                  <span className="text-royal/60">Mobile: </span>
                  <span className="font-semibold text-royal">
                    +91 {normalizedPhone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtpInput("");
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] font-semibold text-gold hover:text-royal underline cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              <div>
                <label
                  htmlFor="customer-otp-input"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-royal mb-2"
                >
                  Enter 6-Digit OTP
                </label>
                <input
                  id="customer-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) =>
                    setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-lg text-royal border border-gold/40 bg-ivory/40 focus:border-royal focus:outline-none"
                  required
                />
                <p className="text-[11px] text-royal/60 mt-1.5">
                  Code expires in 5 minutes. Do not share this OTP with anyone.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpInput.replace(/\D/g, "").length !== 6}
                className="w-full h-11 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {loading ? "Verifying & Signing In..." : "Verify OTP & Sign In →"}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-gold/20">
                <span className="text-royal/60">Didn&apos;t receive the code?</span>
                {cooldown > 0 ? (
                  <span className="text-royal/60 font-medium">
                    Resend available in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-semibold text-royal hover:text-gold uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gold/20 text-center space-y-3">
            <p className="text-xs text-royal/70">
              Checking a single guest order with your Order Reference?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/track-order"
                className="h-10 px-5 border border-gold/40 text-royal text-[11px] font-semibold uppercase tracking-wider hover:bg-cream inline-flex items-center justify-center transition-colors"
              >
                Track Order by Reference
              </Link>
              <Link
                href="/shop"
                className="h-10 px-5 border border-gold/25 text-royal/80 text-[11px] font-semibold uppercase tracking-wider hover:bg-cream inline-flex items-center justify-center transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED — CUSTOMER ACCOUNT & ORDER HISTORY
  // ============================================================================
  const statusBadgeColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-800 border-green-300";
      case "Shipped":
        return "bg-blue-50 text-blue-800 border-blue-300";
      case "Packed":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Cancelled":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-cream text-royal border-gold/40";
    }
  };

  return (
    <div className="mx-auto max-w-[920px] space-y-8">
      {/* Account Header Card */}
      <div className="bg-white border border-gold/30 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
              ॥ श्री कृष्णाय नमः ॥
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-green-50 text-green-800 border border-green-300">
              ✓ Verified Mobile
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-royal">
            {customer.name ? `Radhe Radhe, ${customer.name}` : "Devotee Account"}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-royal/75">
            <span>
              Registered Mobile:{" "}
              <strong className="text-royal">+91 {customer.verifiedPhone}</strong>
            </span>
            {customer.email && (
              <span>
                Email: <strong className="text-royal">{customer.email}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <Link
            href="/shop"
            className="h-10 px-4 border border-gold/40 text-royal text-[11px] font-semibold uppercase tracking-wider hover:bg-cream inline-flex items-center justify-center transition-colors"
          >
            Shop Shringaar
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-10 px-4 bg-royal text-gold text-[11px] font-bold uppercase tracking-widest hover:bg-royal-light disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Order History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gold/25 pb-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-royal">
              Your Sacred Order History
            </h2>
            <p className="text-xs text-royal/65">
              Showing verified orders associated with +91 {customer.verifiedPhone}
            </p>
          </div>
          <span className="text-xs font-semibold text-royal bg-cream border border-gold/30 px-3 py-1">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gold/30 p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <span className="text-3xl text-gold block">🪷</span>
            <h3 className="font-serif text-xl text-royal">
              No Orders Found Yet
            </h3>
            <p className="text-xs sm:text-sm text-royal/70 max-w-md mx-auto leading-relaxed">
              We could not find any completed orders linked to{" "}
              <strong>+91 {customer.verifiedPhone}</strong> yet. Explore our
              handcrafted Poshaks, Mukuts, and Shringaar collections to place your
              first sewa order.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="h-11 px-8 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light inline-flex items-center justify-center transition-colors"
              >
                Explore Collection →
              </Link>
              <Link
                href="/track-order"
                className="h-11 px-6 border border-gold/40 text-royal text-xs font-semibold uppercase tracking-wider hover:bg-cream inline-flex items-center justify-center transition-colors"
              >
                Track by Order Reference
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gold/30 shadow-xs overflow-hidden"
              >
                {/* Order Summary Top Bar */}
                <div className="bg-cream/60 border-b border-gold/20 px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-royal/60 block">
                        Order Reference
                      </span>
                      <span className="font-serif text-base font-bold text-royal">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-royal/60 block">
                        Placed On
                      </span>
                      <span className="font-medium text-royal">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-royal/60 block">
                        Total Amount
                      </span>
                      <span className="font-bold text-royal">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-royal/60 block">
                        Payment
                      </span>
                      <span className="font-semibold text-green-800">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${statusBadgeColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items & Actions */}
                <div className="p-5 space-y-4">
                  <div className="divide-y divide-gold/15">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-royal/10 border border-gold/20">
                            <Image
                              src={item.image || "/products/premium-poshak.png"}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-serif text-sm font-medium text-royal">
                              {item.productName}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px] text-royal/60 mt-0.5">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.colour && <span>Colour: {item.colour}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-royal text-sm shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Destination & Receipt Link */}
                  <div className="pt-4 border-t border-gold/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="text-royal/70">
                      <span className="font-semibold text-royal">Deliver to: </span>
                      {order.shippingAddress.fullName},{" "}
                      {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                      {order.shippingAddress.pincode}
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <Link
                        href={`/order-confirmation/${order.id}`}
                        className="h-9 px-4 bg-royal text-gold text-[11px] font-bold uppercase tracking-widest hover:bg-royal-light inline-flex items-center justify-center transition-colors"
                      >
                        View Full Receipt →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
