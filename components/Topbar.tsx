"use client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LogOut, Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // avoid theme-icon hydration flicker
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const openSidebar = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("zynq:sidebar:open"));
    }
  };

  return (
    <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 bg-white/80 px-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center gap-2">
        {/* Mobile: open drawer */}
        <button
          className="inline-flex md:hidden btn-outline px-2 py-1"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <Link
          href="/dashboard"
          className="font-semibold text-brand-700 dark:text-brand-300"
        >
          ZynqCloud
        </Link>
        <span className="text-xs text-zinc-500">Safe from us</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-outline" onClick={toggle} aria-label="Toggle theme">
          {mounted ? (theme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : null} 
        </button>

        {user ? (
          <>
            <Link href="/profile" className="btn-outline">
              {user.name}
            </Link>
            <button className="btn-outline" onClick={logout} aria-label="Logout">
              <LogOut size={16} />Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn-outline">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
