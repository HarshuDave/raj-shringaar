"use client";

import { useState, useTransition } from "react";
import { updateStockAction } from "@/app/actions/admin-products";

export default function InventoryStockInput({
  variantId,
  initialStock,
}: {
  variantId: string;
  initialStock: number;
}) {
  const [stock, setStock] = useState(initialStock);
  const [isPending, startTransition] = useTransition();
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = () => {
    setErrorMessage(null);
    if (stock < 0 || !Number.isInteger(stock)) {
      setErrorMessage("Must be ≥ 0");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    startTransition(async () => {
      const res = await updateStockAction(variantId, stock);
      if (res.success) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
      } else {
        setErrorMessage(res.error || "Failed");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        className="w-20 h-8 px-2 border border-gold/30 text-xs text-royal font-semibold outline-none focus:border-gold"
      />
      <button
        type="button"
        disabled={isPending || stock === initialStock}
        onClick={handleUpdate}
        className="h-8 px-2.5 bg-royal text-gold text-[10px] font-bold uppercase tracking-wider hover:bg-royal-light disabled:opacity-30"
      >
        {isPending ? "..." : "Save"}
      </button>
      {savedNotice && <span className="text-xs text-emerald-600 font-bold">✓</span>}
      {errorMessage && (
        <span className="text-[10px] text-red-600 font-semibold" title={errorMessage}>
          ✕ {errorMessage}
        </span>
      )}
    </div>
  );
}
