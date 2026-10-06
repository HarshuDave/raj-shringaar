import Link from "next/link";
import {
  getOrders,
  getAllProductsAdmin,
  getCategories,
} from "@/lib/data/repository";

export const metadata = {
  title: "Admin Dashboard | Raj Shringaar",
};

export default async function AdminDashboardPage() {
  const [orders, products, categories] = await Promise.all([
    getOrders(),
    getAllProductsAdmin(),
    getCategories(),
  ]);

  const totalSales = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockThreshold = 5;
  const lowStockCount = products.reduce((count, p) => {
    return (
      count +
      p.variants.filter((v) => v.stock <= lowStockThreshold && v.stock >= 0)
        .length
    );
  }, 0);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Overview
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="h-10 px-5 bg-gold text-royal text-xs font-bold uppercase tracking-wider hover:bg-gold-light inline-flex items-center justify-center transition-colors shadow-sm"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="h-10 px-5 bg-royal text-white text-xs font-semibold uppercase tracking-wider hover:bg-royal-light inline-flex items-center justify-center transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gold/20 p-5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-royal/60 font-semibold block">
            Total Revenue
          </span>
          <p className="font-serif text-2xl font-bold text-royal mt-2">
            ₹{totalSales.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            ✓ Verified prepaid orders
          </span>
        </div>

        <div className="bg-white border border-gold/20 p-5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-royal/60 font-semibold block">
            Total Orders
          </span>
          <p className="font-serif text-2xl font-bold text-royal mt-2">
            {orders.length}
          </p>
          <span className="text-[11px] text-royal/60 mt-1 block">
            All-time customer orders
          </span>
        </div>

        <div className="bg-white border border-gold/20 p-5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-royal/60 font-semibold block">
            Active Products
          </span>
          <p className="font-serif text-2xl font-bold text-royal mt-2">
            {products.filter((p) => p.isActive).length}
          </p>
          <span className="text-[11px] text-royal/60 mt-1 block">
            Across {categories.length} categories
          </span>
        </div>

        <div className="bg-white border border-gold/20 p-5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-royal/60 font-semibold block">
            Low Stock Alerts
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 mt-2">
            {lowStockCount}
          </p>
          <Link
            href="/admin/inventory"
            className="text-[11px] text-gold font-semibold hover:underline mt-1 block"
          >
            Manage inventory →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-gold/20 shadow-xs">
        <div className="p-5 border-b border-gold/20 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-royal font-semibold">
              Recent Orders
            </h2>
            <p className="text-xs text-royal/60">
              Latest sacred purchases from devotees
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-gold font-semibold hover:underline"
          >
            All Orders ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-royal/60">
            No orders placed yet. Orders will appear here once customers checkout.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-gold/20 text-royal font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15 text-royal/80">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-ivory/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-royal">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4">{order.items.length} items</td>
                    <td className="py-3 px-4 font-semibold text-royal">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-royal/10 text-royal">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-royal/60">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Category & Collection Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gold/20 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gold/20 pb-2">
            <h3 className="font-serif text-base text-royal">Categories</h3>
            <Link
              href="/admin/categories"
              className="text-xs text-gold font-semibold hover:underline"
            >
              Manage ({categories.length}) →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="px-2.5 py-1 bg-cream text-royal text-xs border border-gold/20"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gold/20 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gold/20 pb-2">
            <h3 className="font-serif text-base text-royal">Inventory Status</h3>
            <Link
              href="/admin/inventory"
              className="text-xs text-gold font-semibold hover:underline"
            >
              Stock Manager →
            </Link>
          </div>
          <p className="text-xs text-royal/70 leading-relaxed">
            All variants have individual stock tracking. Avoid overselling by
            monitoring sizes and restock batches directly from the inventory
            console.
          </p>
        </div>
      </div>
    </div>
  );
}
