"use client";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import FileList from "@/components/FileList";

export default function Dashboard() {
  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <FileList />
      </div>
    </div>
  );
}
