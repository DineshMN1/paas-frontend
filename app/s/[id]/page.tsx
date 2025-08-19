"use client";
import { useParams } from "next/navigation";
import { useFs } from "@/lib/store";

export default function SharedView() {
  const { id } = useParams<{id:string}>();
  const node = useFs(s => {
    const walk = (n:any): any => (n.id===id ? n : (n.children||[]).map(walk).find(Boolean));
    return walk(s.root);
  });
  if (!node || !node.shared) return <div className="p-6">Invalid/expired share link.</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl card">
        <h1 className="text-xl font-semibold mb-1">{node.name}</h1>
        <div className="text-sm text-zinc-500 mb-3">Permission: {node.shared.perm}</div>
        <div className="text-sm">This is a read-through of your shared item. Connect the backend to stream file contents.</div>
      </div>
    </div>
  );
}
