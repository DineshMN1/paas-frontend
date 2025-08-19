"use client";
import { useFs, SharePerm } from "@/lib/store";
import { useState } from "react";

export default function ShareDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const node = useFs(s => {
    const find = (n: any): any => n.id===id ? n : (n.children||[]).map(find).find(Boolean);
    return find(s.root);
  });
  const share = useFs(s => s.share);
  const unshare = useFs(s => s.unshare);
  const [perm, setPerm] = useState<SharePerm>(node?.shared?.perm || "view");
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share “{node.name}”</h3>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>
        {node.shared ? (
          <div className="mt-4 space-y-2">
            <div className="text-sm">Link: <a className="link" target="_blank" href={node.shared.link}>{node.shared.link}</a></div>
            <div className="text-sm">Permission: {node.shared.perm}</div>
            <button className="btn-outline" onClick={()=>{ unshare(node.id); onClose(); }}>Disable link</button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">Permission</label>
            <select className="input" value={perm} onChange={e=>setPerm(e.target.value as SharePerm)}>
              <option value="view">View</option>
              <option value="read">Read-only</option>
              <option value="edit">Edit</option>
            </select>
            <button className="btn" onClick={()=>{ share(node.id, perm); onClose(); }}>Create share link</button>
          </div>
        )}
      </div>
    </div>
  );
}
