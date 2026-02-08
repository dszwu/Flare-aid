"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Don't protect login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSession(d.data);
        } else {
          router.push("/admin/login");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/login");
        setLoading(false);
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/events", label: "Events", icon: "🌍" },
    { href: "/admin/orgs", label: "Organizations", icon: "🏢" },
    { href: "/admin/payouts", label: "Payouts", icon: "💸" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-flare-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">FA</span>
            </div>
            <span className="font-bold text-lg">
              Flare<span className="text-flare-400">Aid</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-flare-500/20 text-flare-300"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2">{session.email}</div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">Admin</span>
          <div className="flex space-x-4 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-600">
                {item.icon}
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
