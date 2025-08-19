"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  Clock,
  Star,
  Trash2,
  Users,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "All files", icon: Folder },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Deleted files", icon: Trash2 },
  { href: "/admin", label: "Admin", icon: Users },
];

/**
 * Collapsible Sidebar with mobile drawer
 * - Desktop ≥ md: collapsible rail (72px) or full width (var(--sidebar-w))
 * - Mobile < md: slides in as a drawer; opened by Topbar via custom event
 * - Collapse state persisted in sessionStorage
 */
export default function Sidebar() {
  const pathname = usePathname();

  // Desktop collapse (persisted); Mobile drawer (ephemeral)
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Hydrate collapse from sessionStorage
  useEffect(() => {
    const v = sessionStorage.getItem("zynq.sidebar.collapsed");
    if (v) setCollapsed(v === "1");
  }, []);
  useEffect(() => {
    sessionStorage.setItem("zynq.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Close drawer on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Listen for Topbar events
  useEffect(() => {
    const openHandler = () => setMobileOpen(true);
    const toggleCollapse = () => setCollapsed((v) => !v);
    window.addEventListener("zynq:sidebar:open", openHandler as any);
    window.addEventListener("zynq:sidebar:toggle", toggleCollapse as any);
    return () => {
      window.removeEventListener("zynq:sidebar:open", openHandler as any);
      window.removeEventListener("zynq:sidebar:toggle", toggleCollapse as any);
    };
  }, []);

  const DesktopSidebar = (
    <aside
      className={`hidden md:flex h-screen shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-[var(--sidebar-w)]"
      }`}
      aria-label="Sidebar"
    >
      {/* Collapse control */}
      <div className={`flex items-center justify-between px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && <div className="font-semibold tracking-tight">ZynqCloud</div>}
        <button
          className="btn-outline px-2 py-1"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                active ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""
              } ${collapsed ? "justify-center" : ""}`}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions (optional) */}
      <div className={`mt-auto p-2 ${collapsed ? "text-center" : ""}`}>
        <div className={`text-xs text-zinc-500 dark:text-zinc-400 ${collapsed ? "hidden" : "block"}`}>
          v0.1 • dev
        </div>
      </div>
    </aside>
  );

  const MobileDrawer = (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer (opened by Topbar button) */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[min(80vw,320px)] translate-x-[-100%] border-r border-zinc-200 bg-white p-3 shadow-lg transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal
        aria-label="Mobile sidebar"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold tracking-tight">ZynqCloud</div>
          <button
            className="btn-outline px-2 py-1"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  active ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileDrawer}
    </>
  );
}
