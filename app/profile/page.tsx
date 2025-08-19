"use client";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/store";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="p-4">
          <div className="card max-w-xl space-y-2">
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="text-sm">Name: {user?.name}</div>
            <div className="text-sm">Email: {user?.email}</div>
            <div className="text-sm">Role: {user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
