"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAdminAction(formData);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Authentication failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-royal flex items-center justify-center p-4">
      {/* Glow background */}
      <div className="absolute h-96 w-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-gold/40 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative h-20 w-20 mb-3">
            <Image
              src="/logo.png"
              alt="Raj Shringaar"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold">
            Raj Shringaar
          </span>
          <h1 className="font-serif text-2xl text-royal mt-1">
            Admin Portal
          </h1>
          <p className="text-xs text-royal/60 mt-1">
            Divine Sewa &amp; Store Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-800 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-royal mb-2">
              Admin Master Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter master password"
              className="w-full h-12 px-4 border border-gold/40 text-xs bg-ivory text-royal outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-royal text-gold text-xs font-bold uppercase tracking-widest hover:bg-royal-light transition-all disabled:opacity-50 shadow-sm"
          >
            {isPending ? "Verifying..." : "Access Admin Console →"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gold/15 text-center text-[10px] text-royal/40">
          ॥ श्री कृष्णाय नमः ॥ • Authorized Access Only
        </div>
      </div>
    </div>
  );
}
