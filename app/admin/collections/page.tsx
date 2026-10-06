import { getAllCollections, getCollectionProductCounts } from "@/lib/data/repository";
import CollectionsManager from "@/components/admin/CollectionsManager";

export const metadata = {
  title: "Manage Collections | Raj Shringaar Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const [collections, productCounts] = await Promise.all([
    getAllCollections(),
    getCollectionProductCounts(),
  ]);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Curated Themes
          </span>
          <h1 className="font-serif text-3xl text-royal mt-0.5">
            Manage Collections
          </h1>
        </div>
      </div>

      <div className="bg-white border border-gold/20 p-4 text-xs text-royal/70 leading-relaxed shadow-xs">
        <strong>Categories vs Collections:</strong> Categories define <em>what the item is</em> (e.g. Poshak, Mukut).
        Collections explain <em>why items are gathered together</em> for occasions and themes (e.g. Janmashtami Special, Best Sellers, Festive Collection).
      </div>

      <CollectionsManager
        initialCollections={collections}
        productCounts={productCounts}
      />
    </div>
  );
}
