import Image from "next/image";
import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/data/repository";
import InventoryStockInput from "@/components/admin/InventoryStockInput";

export const metadata = {
  title: "Inventory Management | Raj Shringaar Admin",
};

export default async function AdminInventoryPage() {
  const products = await getAllProductsAdmin();

  // Flatten products into variant list
  const variantRows = products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
    }))
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Stock Control
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Variant Inventory ({variantRows.length} variants)
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="h-10 px-5 bg-gold text-royal text-xs font-bold uppercase tracking-wider hover:bg-gold-light inline-flex items-center justify-center transition-colors shadow-sm"
        >
          + Add New Product
        </Link>
      </div>

      <div className="bg-white border border-gold/20 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream border-b border-gold/20 text-royal font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock Health</th>
                <th className="py-3 px-4">Live Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/15 text-royal/80">
              {variantRows.map(({ product, variant }) => {
                const isLow = variant.stock <= 5;
                const isOut = variant.stock === 0;

                return (
                  <tr
                    key={variant.id}
                    className="hover:bg-ivory/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-royal">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden bg-royal/10 border border-gold/20">
                          <Image
                            src={
                              product.images[0] ||
                              "/products/premium-poshak.png"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <span className="truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{product.categoryName}</td>

                    <td className="py-3.5 px-4 font-bold">
                      {variant.size ? `Size ${variant.size}` : "Standard"}
                    </td>

                    <td className="py-3.5 px-4 text-royal/70">
                      {variant.colour || "—"}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-royal">
                      ₹{variant.price.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-red-100 text-red-800">
                          Out of Stock (0)
                        </span>
                      ) : isLow ? (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-100 text-amber-900">
                          Low Stock ({variant.stock})
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Healthy ({variant.stock})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <InventoryStockInput
                        variantId={variant.id}
                        initialStock={variant.stock}
                      />
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
