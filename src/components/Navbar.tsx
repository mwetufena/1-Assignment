// ============================================================================
// Navigation Sidebar Component
// ============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    section: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "📊" },
      { href: "/users", label: "Users", icon: "👥" },
    ],
  },
  {
    section: "Host Portal",
    items: [
      { href: "/host/dashboard", label: "My Properties", icon: "🏠" },
      { href: "/host/add-property", label: "Add Property", icon: "➕" },
    ],
  },
  {
    section: "Guest Portal",
    items: [
      { href: "/guest/browse", label: "Browse Properties", icon: "🔍" },
      { href: "/guest/cart", label: "Booking Cart", icon: "🛒" },
      { href: "/guest/bookings", label: "My Bookings", icon: "📋" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <span className="text-2xl">🏖️</span>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Rental</h1>
          <p className="text-xs text-slate-500 leading-tight">Accommodation System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {navItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-6 py-4">
        <p className="text-xs text-slate-400">gRPC + Ballerina</p>
        <p className="text-xs text-slate-400">Distributed System</p>
      </div>
    </aside>
  );
}
