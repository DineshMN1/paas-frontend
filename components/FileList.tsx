"use client";
import { useFs, FileNode } from "@/lib/store";
import { useMemo, useState } from "react";
import { FolderPlus, Folder, File, MoreVertical, ArrowLeft, Share2, Pencil, Trash2, Plus, Upload } from "lucide-react";
import ShareDialog from "./ShareDialog";

export default function FileList() {
  const { root, path, setPath, create, rename, remove, uploadMany } = useFs();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<string | null>(null);

  const parent = useMemo(() => {
    let cur: FileNode = root;
    for (const seg of path) cur = (cur.children || []).find(c => c.type==="folder" && c.name===seg)!;
    return cur;
  }, [root, path]);

  const items = (parent.children || []).filter(i => !i.trashed);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }));
    if (files.length) uploadMany(files);
  };

  return (
    <div className="flex-1 p-3" onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
      {/* Path controls */}
      <div className="mb-3 flex items-center gap-2">
        <button className="btn-outline" disabled={path.length===0}
          onClick={()=> setPath(path.slice(0,-1))}><ArrowLeft size={16}/>Back</button>
        <div className="text-sm truncate">/ {["", ...path].join(" / ")}</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-outline" onClick={()=>create("New folder", "folder")}><FolderPlus size={16}/>New folder</button>
          <label className="btn-outline cursor-pointer">
            <Upload size={16}/> Upload
            <input type="file" multiple className="hidden" onChange={(e)=>{
              const files = Array.from(e.target.files||[]).map(f=>({name:f.name,size:f.size}));
              if (files.length) uploadMany(files);
              e.currentTarget.value="";
            }}/>
          </label>
          <button className="btn" onClick={()=>create("Untitled.txt", "file")}><Plus size={16}/>New file</button>
        </div>
      </div>

      {/* Dropzone hint */}
      <div className="mb-3 rounded-md border border-dashed border-brand-300 bg-brand-50/40 p-3 text-xs text-zinc-600 dark:border-brand-900 dark:bg-zinc-900">
        Drag & drop files or folders anywhere to upload (front-end mock).
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {items.map((it)=>(
          <div key={it.id} className="card relative">
            <div className="flex items-center gap-2">
              {it.type==="folder" ? <Folder/> : <File/>}
              <button
                className="text-left font-medium hover:underline"
                onClick={()=>{
                  if (it.type==="folder") setPath([...path, it.name]);
                }}>
                {it.name}
              </button>
              <button className="ml-auto btn-outline px-2 py-1" onClick={()=> setMenuFor(menuFor===it.id? null : it.id)}>
                <MoreVertical size={16}/>
              </button>
            </div>

            {menuFor===it.id && (
              <div className="absolute right-2 top-10 z-10 w-40 rounded-md border border-zinc-200 bg-white p-1 text-sm shadow dark:border-zinc-800 dark:bg-zinc-900">
                <button className="w-full rounded px-2 py-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={()=>{ const n = prompt("Rename to", it.name); if(n) rename(it.id, n); setMenuFor(null); }}>
                  <Pencil className="mr-1 inline" size={14}/> Rename
                </button>
                <button className="w-full rounded px-2 py-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={()=>{ setShareFor(it.id); setMenuFor(null); }}>
                  <Share2 className="mr-1 inline" size={14}/> Share…
                </button>
                <button className="w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={()=>{ remove(it.id); setMenuFor(null); }}>
                  <Trash2 className="mr-1 inline" size={14}/> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {shareFor && <ShareDialog id={shareFor} onClose={()=>setShareFor(null)}/>}
    </div>
  );
}
