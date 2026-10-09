import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getOrderById } from "@/lib/data/repository";
import { verifyOrderAccessToken } from "@/lib/auth/order-token";
import OrderReceiptVerificationGate from "@/components/store/OrderReceiptVerificationGate";

interface PageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Order Confirmed | Raj Shringaar",
  description: "Your devotional order has been confirmed with divine elegance.",
};

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const { orderId } = await params;
  const { token } = await searchParams;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Verify access authorization via cryptographic token or session cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(`rs_order_token_${order.id}`)?.value;
  const candidateToken = token || cookieToken;

  const isAuthorized = verifyOrderAccessToken(order.id, order.createdAt, candidateToken);

  // If unauthorized, render verification gate to protect customer PII
  if (!isAuthorized) {
    return (
      <div className="bg-ivory py-16 px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-[800px]">
          <OrderReceiptVerificationGate
            orderId={order.id}
            orderNumber={order.orderNumber}
            orderStatus={order.orderStatus}
            orderDate={new Date(order.createdAt).toLocaleDateString("en-IN")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory py-16 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[800px]">
        {/* Success Card */}
        <div className="bg-white border border-gold/30 p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream border border-gold/40 text-gold text-2xl mb-4">
            🪷
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold mb-1">
            ॥ श्री कृष्णाय नमः ॥
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl text-royal mb-2">
            Order Confirmed!
          </h1>

          <p className="text-xs sm:text-sm text-royal/70 max-w-md mx-auto leading-relaxed mb-6">
            Radhe Radhe! Thank you for ordering from Raj Shringaar. Your sewa
            order has been received and is being prepared with utmost devotion.
          </p>

          <div className="bg-cream/60 border border-gold/20 inline-block px-6 py-3 mb-8">
            <span className="text-[10px] text-royal/60 uppercase tracking-widest block">
              Order Reference Number
            </span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-royal tracking-wide">
              {order.orderNumber}
            </span>
          </div>

          {/* Order Details Grid */}
          <div className="text-left border-t border-gold/20 pt-8 space-y-6">
            {/* Status overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-cream p-4 border border-gold/20 text-xs">
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">
                  Order Status
                </span>
                <span className="font-bold text-royal">{order.orderStatus}</span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">
                  Payment
                </span>
                <span className="font-bold text-green-700">
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">
                  Order Date
                </span>
                <span className="font-bold text-royal">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-royal/60 block text-[10px] uppercase">
                  Total Amount
                </span>
                <span className="font-bold text-royal">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="border border-gold/20 p-5">
              <h3 className="font-serif text-sm font-semibold text-royal mb-2">
                Shipping Destination
              </h3>
              <p className="text-xs text-royal font-medium">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-xs text-royal/70 leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-xs text-royal/70 mt-1">
                Phone: +91 {order.shippingAddress.phone} | Email:{" "}
                {order.shippingAddress.email}
              </p>
            </div>

            {/* Itemized list */}
            <div>
              <h3 className="font-serif text-sm font-semibold text-royal mb-3">
                Items in This Order
              </h3>
              <div className="divide-y divide-gold/15 border border-gold/20">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between text-xs"
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
                        <p className="font-serif text-royal font-medium text-sm">
                          {item.productName}
                        </p>
                        <div className="flex gap-2 text-[10px] text-royal/60 mt-0.5">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.colour && <span>Color: {item.colour}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-semibold text-royal text-sm">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto h-11 px-8 inline-flex items-center justify-center bg-royal text-xs font-bold uppercase tracking-widest text-gold hover:bg-royal-light transition-colors shadow-sm"
            >
              Continue Shopping →
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto h-11 px-8 inline-flex items-center justify-center border border-gold/40 text-xs font-semibold uppercase tracking-wider text-royal hover:bg-cream transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
