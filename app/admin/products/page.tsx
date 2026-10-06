import Link from "next/link";
import Image from "next/image";
import { getAllProductsAdmin } from "@/lib/data/repository";
import { deleteProductAction } from "@/app/actions/admin-products";

export const metadata = {
  title: "Manage Products | Raj Shringaar Admin",
};

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Products ({products.length})
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="h-10 px-5 bg-gold text-royal text-xs font-bold uppercase tracking-wider hover:bg-gold-light inline-flex items-center justify-center transition-colors shadow-sm"
        >
          + Add New Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gold/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-gold/20 text-royal font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Variants</th>
                <th className="py-3.5 px-4">Price Range</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-royal/80">
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                );
                const minPrice = Math.min(
                  ...product.variants.map((v) => v.price)
                );
                const maxPrice = Math.max(
                  ...product.variants.map((v) => v.price)
                );

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-ivory/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-royal/10 border border-gold/20">
                          <Image
                            src={
                              product.images[0] ||
                              "/products/premium-poshak.png"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-medium text-royal text-sm">
                            {product.name}
                          </p>
                          <span className="text-[10px] text-royal/50 block">
                            /{product.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <span className="px-2 py-0.5 bg-cream border border-gold/20 text-royal text-[11px]">
                        {product.categoryName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {product.variants.length} variant
                      {product.variants.length > 1 ? "s" : ""}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-royal">
                      {minPrice === maxPrice
                        ? `₹${minPrice}`
                        : `₹${minPrice} – ₹${maxPrice}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          totalStock <= 5
                            ? "text-amber-700 font-bold"
                            : "text-emerald-800"
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="px-2.5 py-1 text-[11px] text-royal font-semibold hover:text-gold border border-gold/30 hover:border-gold transition-colors bg-cream"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-[11px] text-royal/70 hover:text-gold border border-gold/20 hover:border-gold transition-colors"
                        >
                          View ↗
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteProductAction(product.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
