import { getAllCategories, getCategoryProductCounts } from "@/lib/data/repository";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const metadata = {
  title: "Manage Categories | Raj Shringaar Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, productCounts] = await Promise.all([
    getAllCategories(),
    getCategoryProductCounts(),
  ]);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Taxonomy Management
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Manage Categories
          </h1>
        </div>
      </div>

      <div className="bg-white border border-gold/20 p-4 text-xs text-royal/70 leading-relaxed shadow-xs">
        <strong>Devotional Terminology Reminder:</strong> Use sacred, devotional
        terms for Bal Gopal shringar (e.g. <em>Poshak, Mukut, Mala, Shringaar, Jhula, Bansuri, Combos, Patka</em>).
        Western terms like &quot;Jewellery&quot; or &quot;Accessories&quot; are avoided.
      </div>

      <CategoriesManager
        initialCategories={categories}
        productCounts={productCounts}
      />
    </div>
  );
}
