"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Clock, Star, Trash2, Users } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "All files", icon: Folder },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Deleted files", icon: Trash2 },
  { href: "/admin", label: "Admin", icon: Users }
];

export default function Sidebar() {
  const p = usePathname();
  return (
    <aside className="hidden md:block w-[var(--sidebar-w)] border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = p?.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${active ? "bg-zinc-100 dark:bg-zinc-800 font-medium" : ""}`}>
              <Icon size={16}/> {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
