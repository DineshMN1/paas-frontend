"use client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/store";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 bg-white/80 px-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="font-semibold text-brand-700 dark:text-brand-300">ZynqCloud</Link>
        <span className="text-xs text-zinc-500">MVP</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-outline" onClick={toggle}>{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>} Theme</button>
        {user ? (
          <>
            <Link href="/profile" className="btn-outline">{user.name}</Link>
            <button className="btn-outline" onClick={logout}><LogOut size={16}/>Logout</button>
          </>
        ) : (
          <Link href="/login" className="btn-outline">Login</Link>
        )}
      </div>
    </div>
  );
}
