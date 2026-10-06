import Link from "next/link";
import Image from "next/image";
import { logoutAdminAction } from "@/app/actions/admin-auth";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "❖" },
  { label: "Products", href: "/admin/products", icon: "📦" },
  { label: "Categories", href: "/admin/categories", icon: "🏷️" },
  { label: "Collections", href: "/admin/collections", icon: "✨" },
  { label: "Orders", href: "/admin/orders", icon: "📜" },
  { label: "Inventory", href: "/admin/inventory", icon: "📊" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-ivory text-royal">
      {/* Royal Navy Sidebar */}
      <aside className="w-64 bg-royal border-r border-gold/20 flex flex-col shrink-0 text-white hidden md:flex">
        {/* Brand header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/logo.png"
              alt="Raj Shringaar"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-serif text-base text-gold font-bold block">
              Raj Shringaar
            </span>
            <span className="text-[10px] tracking-widest uppercase text-white/50">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-gold hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-gold"
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 border border-gold/30 text-gold text-xs uppercase tracking-wider font-semibold hover:bg-gold hover:text-royal transition-colors"
          >
            <span>Live Store</span>
            <span>↗</span>
          </Link>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full py-2 text-xs text-white/50 hover:text-red-400 transition-colors"
            >
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-16 bg-white border-b border-gold/20 px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center gap-2">
              <span className="font-serif text-sm font-bold text-royal">
                Raj Shringaar Admin
              </span>
            </div>
            <span className="text-[11px] text-royal/60 hidden sm:inline">
              ॥ श्री कृष्णाय नमः ॥ • Store Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-royal/70 hover:text-gold font-medium flex items-center gap-1"
            >
              <span>View Storefront</span>
              <span className="text-xs">↗</span>
            </Link>
            <div className="h-4 w-px bg-gold/20" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-royal">Owner</span>
            </div>
          </div>
        </header>

        {/* Mobile Nav bar (visible on mobile screens) */}
        <div className="md:hidden flex overflow-x-auto bg-royal border-b border-gold/20 px-2 py-2 gap-1 text-[11px] text-white">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2.5 py-1.5 whitespace-nowrap text-white/80 hover:text-gold font-semibold uppercase tracking-wider"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
