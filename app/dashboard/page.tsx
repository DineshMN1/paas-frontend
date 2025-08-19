"use client";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import FileList from "@/components/FileList";

export default function Dashboard() {
  return (
    // On md+ use a 2-col grid with auto width for the sidebar.
    // On mobile it's a single column; Sidebar renders as a fixed drawer.
    <div className="min-h-screen md:grid md:grid-cols-[auto_1fr]">
      <Sidebar />

      {/* Main content */}
      <div className="flex min-h-screen flex-col flex-1">
        <Topbar />
        <FileList />
      </div>
    </div>
  );
}
