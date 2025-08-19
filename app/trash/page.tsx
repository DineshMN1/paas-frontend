"use client";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useFs } from "@/lib/store";
import { RotateCw, Trash2 } from "lucide-react";

export default function Trash() {
  const { root, restore, purge } = useFs();
  const collect = (n:any, acc:any[]=[]) => {
    if (n.trashed) acc.push(n);
    (n.children||[]).forEach((c:any)=>collect(c, acc));
    return acc;
  };
  const items = collect(root);

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="p-3">
          <h2 className="mb-3 text-xl font-semibold">Deleted files</h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {items.map(i=>(
              <div key={i.id} className="card flex items-center justify-between">
                <div className="font-medium">{i.name}</div>
                <div className="flex gap-2">
                  <button className="btn-outline" onClick={()=>restore(i.id)}><RotateCw size={16}/>Restore</button>
                  <button className="btn-outline text-red-600" onClick={()=>purge(i.id)}><Trash2 size={16}/>Delete</button>
                </div>
              </div>
            ))}
            {items.length===0 && <div className="text-sm text-zinc-500">Trash is empty.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
