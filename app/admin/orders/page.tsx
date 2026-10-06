import { getOrders } from "@/lib/data/repository";
import OrderRow from "@/components/admin/OrderRow";

export const metadata = {
  title: "Manage Orders | Raj Shringaar Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Customer Fulfillment
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Orders ({orders.length})
          </h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gold/20 p-12 text-center text-xs text-royal/60">
          No orders placed yet. Orders from customers will appear here in real-time.
        </div>
      ) : (
        <div className="bg-white border border-gold/20 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-cream border-b border-gold/20 text-royal font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer &amp; Address</th>
                  <th className="py-3.5 px-4">Items Snapshot</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
