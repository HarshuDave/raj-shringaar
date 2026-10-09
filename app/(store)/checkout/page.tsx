"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { placeOrderAction } from "@/app/actions/order";
import { calculateShippingFee } from "@/lib/config/shipping";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { items, clearCart, getTotalPrice } = useCartStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-ivory min-h-[60vh] flex items-center justify-center">
        <span className="text-sm text-royal/60">Loading checkout...</span>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your bag is empty. Please add items before checking out.");
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter a valid full name (at least 2 characters).");
      return;
    }

    const trimmedEmail = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address for order notifications.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const trimmedAddress = form.addressLine1.trim();
    if (!trimmedAddress || trimmedAddress.length < 5) {
      setErrorMessage("Please enter a detailed delivery address (at least 5 characters).");
      return;
    }

    const trimmedCity = form.city.trim();
    if (!trimmedCity) {
      setErrorMessage("Please enter your delivery city.");
      return;
    }

    const trimmedState = form.state.trim();
    if (!trimmedState) {
      setErrorMessage("Please enter your delivery state.");
      return;
    }

    const cleanPincode = form.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit postal PIN code.");
      return;
    }

    startTransition(async () => {
      const orderItems = items.map((item) => ({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.name,
        size: item.size,
        colour: item.colour,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      const res = await placeOrderAction({
        customerName: trimmedName,
        customerEmail: trimmedEmail,
        customerPhone: cleanPhone,
        shippingAddress: {
          fullName: trimmedName,
          phone: cleanPhone,
          email: trimmedEmail,
          addressLine1: trimmedAddress,
          addressLine2: form.addressLine2.trim(),
          city: trimmedCity,
          state: trimmedState,
          pincode: cleanPincode,
        },
        items: orderItems,
        totalAmount,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Unable to complete order.");
      } else {
        clearCart();
        const tokenQuery = res.accessToken ? `?token=${res.accessToken}` : "";
        router.push(`/order-confirmation/${res.orderId}${tokenQuery}`);
      }
    });
  };

  return (
    <div className="bg-ivory py-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-royal/60">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-gold transition-colors">
            Bag
          </Link>
          <span>/</span>
          <span className="text-royal font-medium">Checkout</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl text-royal mb-8">
          Express Devotional Checkout
        </h1>

        {items.length === 0 ? (
          <div className="bg-white border border-gold/30 p-12 text-center max-w-lg mx-auto shadow-sm">
            <span className="text-4xl text-gold mb-3 block">🪷</span>
            <p className="font-serif text-xl text-royal mb-2">No items to checkout</p>
            <p className="text-xs text-royal/70 mb-6">
              Your cart is empty. Add products to proceed with checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center bg-royal px-6 text-xs uppercase tracking-wider text-gold font-semibold hover:bg-gold hover:text-royal transition-colors"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Customer and Shipping Details Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Section 1: Customer Contact */}
                <div className="bg-white border border-gold/20 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-gold/20 pb-2">
                    <span className="text-gold font-bold text-sm">1.</span>
                    <h2 className="font-serif text-lg text-royal">
                      Contact Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g. Radhika Sharma"
                        className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                        Email Address (for order updates) *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="radhika@example.com"
                        className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                        Mobile Phone Number *
                      </label>
                      <div className="flex">
                        <span className="h-11 px-3.5 flex items-center justify-center bg-cream border border-r-0 border-gold/30 text-xs font-semibold text-royal">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="6367217197"
                          className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                        />
                      </div>
                      <span className="text-[10px] text-royal/60 mt-1 block">
                        Required for courier delivery updates
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <div className="bg-white border border-gold/20 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-gold/20 pb-2">
                    <span className="text-gold font-bold text-sm">2.</span>
                    <h2 className="font-serif text-lg text-royal">
                      Delivery Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                        House / Flat / Temple / Building *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.addressLine1}
                        onChange={(e) =>
                          setForm({ ...form, addressLine1: e.target.value })
                        }
                        placeholder="e.g. 108, Near Shreenathji Temple, Naya Bazar"
                        className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                        Landmark / Area (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.addressLine2}
                        onChange={(e) =>
                          setForm({ ...form, addressLine2: e.target.value })
                        }
                        placeholder="Near Shreenathji Temple"
                        className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                          placeholder="Nathdwara"
                          className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.state}
                          onChange={(e) =>
                            setForm({ ...form, state: e.target.value })
                          }
                          placeholder="Rajasthan"
                          className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-1.5">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          value={form.pincode}
                          onChange={(e) =>
                            setForm({ ...form, pincode: e.target.value })
                          }
                          placeholder="313301"
                          className="w-full h-11 px-3.5 border border-gold/30 text-xs bg-white text-royal outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Payment Method Overview */}
                <div className="bg-cream border border-gold/30 p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-gold text-lg">✦</span>
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-royal">
                        Secure Prepaid Online Order
                      </h3>
                      <p className="text-[11px] text-royal/70 mt-0.5">
                        In accordance with our sacred order policy, all parcels are
                        insured and prepaid for seamless devotional handling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="bg-white border border-gold/20 p-6 shadow-sm h-fit">
                <h2 className="font-serif text-xl text-royal mb-4 border-b border-gold/20 pb-3">
                  Summary ({items.length} items)
                </h2>

                {/* Item miniatures */}
                <div className="max-h-[260px] overflow-y-auto space-y-3 border-b border-gold/20 pb-4 pr-1">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 text-xs">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-gold/20 bg-royal/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-royal font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-royal/60">
                          {item.size ? `Size ${item.size} • ` : ""}Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-royal">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-xs py-4 border-b border-gold/20">
                  <div className="flex justify-between text-royal/80">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-royal/80">
                    <span>Standard Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-green-700 font-bold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-baseline">
                  <span className="font-serif text-base text-royal font-bold">
                    Total
                  </span>
                  <span className="font-serif text-2xl font-bold text-royal">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xs">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex h-12 w-full items-center justify-center bg-royal text-xs font-bold uppercase tracking-widest text-gold hover:bg-royal-light disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isPending ? "Confirming Order..." : "Confirm & Place Order →"}
                </button>

                <p className="mt-3 text-[10px] text-center text-royal/60">
                  ॥ श्री कृष्णाय नमः ॥
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
