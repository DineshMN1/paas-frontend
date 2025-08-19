// "use client";
// import React, { useEffect, useId, useMemo, useRef, useState } from "react";
// import { useFs, type FileNode } from "@/lib/store";
// import {
//   FolderPlus,
//   Folder,
//   File as FileIcon,
//   MoreVertical,
//   ArrowLeft,
//   Share2,
//   Pencil,
//   Trash2,
//   Plus,
//   Upload,
//   List as ListIcon,
//   Grid3X3,
//   ChevronRight,
//   SortAsc,
// } from "lucide-react";
// import ShareDialog from "./ShareDialog";

// /**
//  * FileList (enhanced)
//  * - Breadcrumbs (clickable)
//  * - List / Grid view toggle
//  * - Sorting (Name / Type / Size)
//  * - Keyboard selection (Shift / Ctrl/Cmd)
//  * - Inline rename
//  * - Context menu + right‑click
//  * - Accessible buttons & ARIA labels
//  * - Better drag‑and‑drop with visual highlight
//  *
//  * This remains a front‑end mock and continues to use the useFs() API you already have.
//  */
// export default function FileList() {
//   const { root, path, setPath, create, rename, remove, uploadMany } = useFs();

//   // UI state
//   const [menuFor, setMenuFor] = useState<string | null>(null);
//   const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
//   const [shareFor, setShareFor] = useState<string | null>(null);
//   const [renamingId, setRenamingId] = useState<string | null>(null);
//   const [view, setView] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState<"name" | "type" | "size">("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [dragOver, setDragOver] = useState(false);
//   const [selected, setSelected] = useState<string[]>([]);
//   const listRef = useRef<HTMLDivElement>(null);
//   const idPrefix = useId();

//   // Resolve current folder
//   const parent = useMemo(() => {
//     let cur: FileNode = root;
//     for (const seg of path) {
//       cur = (cur.children || []).find((c) => c.type === "folder" && c.name === seg)!;
//       if (!cur) break;
//     }
//     return cur || root;
//   }, [root, path]);

//   // Items (hide trashed) + sorting
//   const items = useMemo(() => {
//     const base = (parent.children || []).filter((i) => !i.trashed);
//     const keyed = [...base];
//     keyed.sort((a, b) => {
//       const dir = sortAsc ? 1 : -1;
//       const av = a[sortBy as keyof FileNode];
//       const bv = b[sortBy as keyof FileNode];
//       if (sortBy === "type") {
//         // folders before files when ascending by type
//         const ta = a.type === "folder" ? 0 : 1;
//         const tb = b.type === "folder" ? 0 : 1;
//         if (ta !== tb) return (ta - tb) * dir;
//         // then by name for stability
//         return a.name.localeCompare(b.name) * dir;
//       }
//       if (sortBy === "size") {
//         const sa = typeof (a as any).size === "number" ? (a as any).size : -1;
//         const sb = typeof (b as any).size === "number" ? (b as any).size : -1;
//         if (sa !== sb) return (sa - sb) * dir;
//         return a.name.localeCompare(b.name) * dir;
//       }
//       // name
//       return a.name.localeCompare(b.name) * dir;
//     });
//     return keyed;
//   }, [parent.children, sortBy, sortAsc]);

//   // Close menus on outside click / escape
//   useEffect(() => {
//     const onDocClick = (e: MouseEvent) => {
//       if (!listRef.current) return;
//       if (e.target && listRef.current.contains(e.target as Node)) return; // clicks inside list are handled separately
//       setMenuFor(null);
//       setMenuPos(null);
//     };
//     const onEsc = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setMenuFor(null);
//         setMenuPos(null);
//         setRenamingId(null);
//       }
//     };
//     document.addEventListener("click", onDocClick);
//     document.addEventListener("keydown", onEsc);
//     return () => {
//       document.removeEventListener("click", onDocClick);
//       document.removeEventListener("keydown", onEsc);
//     };
//   }, []);

//   // Selection helpers
//   const toggleSelect = (id: string, multi = false) => {
//     setSelected((prev) => {
//       if (!multi) return prev.includes(id) ? [] : [id];
//       return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
//     });
//   };

//   const selectRange = (fromId: string, toId: string) => {
//     const ids = items.map((i) => i.id);
//     const a = ids.indexOf(fromId);
//     const b = ids.indexOf(toId);
//     if (a < 0 || b < 0) return;
//     const [start, end] = a < b ? [a, b] : [b, a];
//     setSelected(ids.slice(start, end + 1));
//   };

//   const lastSelected = selected[selected.length - 1];

//   // DnD
//   const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragOver(false);
//     const files = Array.from(e.dataTransfer.files).map((f) => ({ name: f.name, size: f.size }));
//     if (files.length) uploadMany(files);
//   };

//   const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
//     if (e.currentTarget === e.target) setDragOver(false);
//   };

//   // Paste to upload (images / files)
//   useEffect(() => {
//     const onPaste = (e: ClipboardEvent) => {
//       const files = Array.from(e.clipboardData?.files || []).map((f) => ({ name: f.name, size: f.size }));
//       if (files.length) uploadMany(files);
//     };
//     window.addEventListener("paste", onPaste);
//     return () => window.removeEventListener("paste", onPaste);
//   }, [uploadMany]);

//   // Actions
//   const doRename = (id: string, nextName: string) => {
//     if (!nextName || !nextName.trim()) return setRenamingId(null);
//     rename(id, nextName.trim());
//     setRenamingId(null);
//   };

//   const openContextMenu = (
//     e: React.MouseEvent,
//     fileId: string,
//   ) => {
//     e.preventDefault();
//     setMenuFor(fileId);
//     setMenuPos({ x: e.clientX, y: e.clientY });
//   };

//   const openItem = (it: FileNode) => {
//     if (it.type === "folder") setPath([...path, it.name]);
//   };

//   // UI bits
//   const Sorter = (
//     <div className="flex items-center gap-1">
//       <label className="sr-only" htmlFor={`${idPrefix}-sort`}>Sort by</label>
//       <div className="relative">
//         <select
//           id={`${idPrefix}-sort`}
//           className="input pr-8"
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value as any)}
//           aria-label="Sort files by"
//         >
//           <option value="name">Name</option>
//           <option value="type">Type</option>
//           <option value="size">Size</option>
//         </select>
//         <SortAsc className="pointer-events-none absolute right-2 top-2.5" size={16} />
//       </div>
//       <button
//         className="btn-outline"
//         aria-label={sortAsc ? "Ascending" : "Descending"}
//         title={sortAsc ? "Ascending" : "Descending"}
//         onClick={() => setSortAsc((s) => !s)}
//       >
//         {sortAsc ? "ASC" : "DESC"}
//       </button>
//     </div>
//   );

//   const ViewToggle = (
//     <div className="inline-flex rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
//       <button
//         className={`px-3 py-2 text-sm ${view === "grid" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
//         onClick={() => setView("grid")}
//         aria-pressed={view === "grid"}
//         aria-label="Grid view"
//       >
//         <Grid3X3 size={16} />
//       </button>
//       <button
//         className={`px-3 py-2 text-sm ${view === "list" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
//         onClick={() => setView("list")}
//         aria-pressed={view === "list"}
//         aria-label="List view"
//       >
//         <ListIcon size={16} />
//       </button>
//     </div>
//   );

//   return (
//     <div
//       className="flex-1 p-3"
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//       onDragLeave={onDragLeave}
//     >
//       {/* Path controls */}
//       <div className="mb-3 flex items-center gap-2">
//         <button
//           className="btn-outline"
//           disabled={path.length === 0}
//           onClick={() => setPath(path.slice(0, -1))}
//         >
//           <ArrowLeft size={16} />Back
//         </button>

//         {/* Breadcrumbs */}
//         <nav aria-label="Breadcrumb" className="text-sm truncate flex items-center gap-1">
//           <ol className="flex items-center gap-1">
//             <li>
//               <button
//                 className="link"
//                 onClick={() => setPath([])}
//                 aria-current={path.length === 0 ? "page" : undefined}
//               >
//                 Home
//               </button>
//             </li>
//             {path.map((seg, i) => (
//               <li key={i} className="flex items-center gap-1">
//                 <ChevronRight size={14} className="opacity-60" />
//                 <button
//                   className="link truncate max-w-[10rem]"
//                   onClick={() => setPath(path.slice(0, i + 1))}
//                   aria-current={i === path.length - 1 ? "page" : undefined}
//                   title={seg}
//                 >
//                   {seg}
//                 </button>
//               </li>
//             ))}
//           </ol>
//         </nav>

//         <div className="ml-auto flex items-center gap-2">
//           {Sorter}
//           {ViewToggle}
//           <button className="btn-outline" onClick={() => create("New folder", "folder")}>
//             <FolderPlus size={16} />New folder
//           </button>
//           <label className="btn-outline cursor-pointer" aria-label="Upload files">
//             <Upload size={16} /> Upload
//             <input
//               type="file"
//               multiple
//               className="hidden"
//               onChange={(e) => {
//                 const files = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
//                 if (files.length) uploadMany(files);
//                 (e.currentTarget as HTMLInputElement).value = "";
//               }}
//             />
//           </label>
//           <button className="btn" onClick={() => create("Untitled.txt", "file")}>
//             <Plus size={16} />New file
//           </button>
//         </div>
//       </div>

//       {/* Dropzone hint */}
//       <div
//         className={
//           "mb-3 rounded-md border border-dashed p-3 text-xs text-zinc-600 " +
//           (dragOver
//             ? "border-brand-500 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-900/20"
//             : "border-brand-300 bg-brand-50/40 dark:border-brand-900 dark:bg-zinc-900")
//         }
//         role="status"
//         aria-live="polite"
//       >
//         Drag & drop files or paste to upload (front‑end mock).
//       </div>

//       {/* Empty state */}
//       {items.length === 0 && (
//         <div className="card flex flex-col items-center justify-center py-12 text-center">
//           <Folder className="mb-2 opacity-70" />
//           <div className="font-medium">This folder is empty</div>
//           <div className="text-sm opacity-70">Create a folder, upload files, or drop them here.</div>
//           <div className="mt-3 flex gap-2">
//             <button className="btn" onClick={() => create("New folder", "folder")}>
//               <FolderPlus size={16} /> New folder
//             </button>
//             <label className="btn-outline cursor-pointer">
//               <Upload size={16} /> Upload
//               <input type="file" multiple className="hidden" onChange={(e) => {
//                 const files = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
//                 if (files.length) uploadMany(files);
//                 (e.currentTarget as HTMLInputElement).value = "";
//               }} />
//             </label>
//           </div>
//         </div>
//       )}

//       {/* Files */}
//       <div ref={listRef}>
//         {view === "grid" ? (
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
//             {items.map((it) => (
//               <ItemCard
//                 key={it.id}
//                 it={it}
//                 selected={selected.includes(it.id)}
//                 onOpen={() => openItem(it)}
//                 onRename={() => setRenamingId(it.id)}
//                 onShare={() => setShareFor(it.id)}
//                 onDelete={() => remove(it.id)}
//                 onClick={(e) => {
//                   if (e.shiftKey && lastSelected) selectRange(lastSelected, it.id);
//                   else if (e.metaKey || e.ctrlKey) toggleSelect(it.id, true);
//                   else toggleSelect(it.id, false);
//                 }}
//                 onContextMenu={(e) => openContextMenu(e, it.id)}
//                 renaming={renamingId === it.id}
//                 doRename={(name) => doRename(it.id, name)}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
//             <div className="grid grid-cols-[32px,1fr,100px,40px] items-center bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 text-xs font-medium uppercase tracking-wide">
//               <div />
//               <div>Name</div>
//               <div className="text-right">Size</div>
//               <div />
//             </div>
//             <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
//               {items.map((it) => (
//                 <ListRow
//                   key={it.id}
//                   it={it}
//                   selected={selected.includes(it.id)}
//                   onOpen={() => openItem(it)}
//                   onRename={() => setRenamingId(it.id)}
//                   onShare={() => setShareFor(it.id)}
//                   onDelete={() => remove(it.id)}
//                   onClick={(e) => {
//                     if (e.shiftKey && lastSelected) selectRange(lastSelected, it.id);
//                     else if (e.metaKey || e.ctrlKey) toggleSelect(it.id, true);
//                     else toggleSelect(it.id, false);
//                   }}
//                   onContextMenu={(e) => openContextMenu(e, it.id)}
//                   renaming={renamingId === it.id}
//                   doRename={(name) => doRename(it.id, name)}
//                 />
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* Context menu */}
//       {menuFor && menuPos && (
//         <ContextMenu
//           x={menuPos.x}
//           y={menuPos.y}
//           onClose={() => {
//             setMenuFor(null);
//             setMenuPos(null);
//           }}
//         >
//           <MenuButton onClick={() => { setRenamingId(menuFor); setMenuFor(null); }}>
//             <Pencil size={14} className="mr-2" /> Rename
//           </MenuButton>
//           <MenuButton onClick={() => { setShareFor(menuFor); setMenuFor(null); }}>
//             <Share2 size={14} className="mr-2" /> Share…
//           </MenuButton>
//           <MenuButton destructive onClick={() => { remove(menuFor); setMenuFor(null); }}>
//             <Trash2 size={14} className="mr-2" /> Delete
//           </MenuButton>
//         </ContextMenu>
//       )}

//       {shareFor && <ShareDialog id={shareFor} onClose={() => setShareFor(null)} />}
//     </div>
//   );
// }

// // ────────────────────────────────────────────────────────────────────────────────
// // Components
// // ────────────────────────────────────────────────────────────────────────────────

// function ItemCard({
//   it,
//   selected,
//   onOpen,
//   onClick,
//   onContextMenu,
//   onRename,
//   onShare,
//   onDelete,
//   renaming,
//   doRename,
// }: {
//   it: FileNode;
//   selected: boolean;
//   onOpen: () => void;
//   onClick: (e: React.MouseEvent) => void;
//   onContextMenu: (e: React.MouseEvent) => void;
//   onRename: () => void;
//   onShare: () => void;
//   onDelete: () => void;
//   renaming: boolean;
//   doRename: (nextName: string) => void;
// }) {
//   return (
//     <div
//       className={`card relative cursor-default border transition ${
//         selected ? "ring-2 ring-brand-500 border-brand-300 dark:border-brand-800" : ""
//       }`}
//       onClick={onClick}
//       onDoubleClick={onOpen}
//       onContextMenu={onContextMenu}
//       role="button"
//       tabIndex={0}
//       aria-selected={selected}
//     >
//       <div className="flex items-center gap-2">
//         {it.type === "folder" ? <Folder /> : <FileIcon />}

//         {renaming ? (
//           <InlineRename defaultValue={it.name} onSubmit={doRename} />
//         ) : (
//           <button
//             className="text-left font-medium hover:underline"
//             onClick={(e) => {
//               e.stopPropagation();
//               if (it.type === "folder") onOpen();
//             }}
//           >
//             {it.name}
//           </button>
//         )}

//         <button
//           className="ml-auto btn-outline px-2 py-1"
//           aria-label={`More actions for ${it.name}`}
//           onClick={(e) => {
//             e.stopPropagation();
//             const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//             const x = rect.left + rect.width;
//             const y = rect.top + rect.height;
//             const ev = {
//               preventDefault() {},
//               clientX: x,
//               clientY: y,
//             } as unknown as React.MouseEvent;
//             onContextMenu(ev);
//           }}
//         >
//           <MoreVertical size={16} />
//         </button>
//       </div>
//     </div>
//   );
// }

// function ListRow(props: React.ComponentProps<typeof ItemCard>) {
//   const { it, selected, onOpen, onClick, onContextMenu, renaming, doRename } = props;
//   return (
//     <li
//       className={`grid grid-cols-[32px,1fr,100px,40px] items-center px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
//         selected ? "bg-brand-50/60 dark:bg-brand-900/20" : ""
//       }`}
//       onClick={onClick}
//       onDoubleClick={onOpen}
//       onContextMenu={onContextMenu}
//       role="row"
//       aria-selected={selected}
//     >
//       <div className="opacity-80">{it.type === "folder" ? <Folder size={18} /> : <FileIcon size={18} />}</div>
//       <div className="truncate">
//         {renaming ? (
//           <InlineRename defaultValue={it.name} onSubmit={doRename} />
//         ) : (
//           <span className="font-medium">{it.name}</span>
//         )}
//       </div>
//       <div className="text-right text-sm tabular-nums opacity-75">
//         {typeof (it as any).size === "number" ? formatBytes((it as any).size) : "—"}
//       </div>
//       {/* Kebab mirror to keep columns aligned */}
//       <div className="flex justify-end">
//         <MoreKebabMirror onContextMenu={onContextMenu} />
//       </div>
//     </li>
//   );
// }

// function MoreKebabMirror({ onContextMenu }: { onContextMenu: (e: React.MouseEvent) => void }) {
//   return (
//     <button
//       className="btn-outline px-2 py-1"
//       aria-label="More actions"
//       onClick={(e) => {
//         const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//         const x = rect.left + rect.width;
//         const y = rect.top + rect.height;
//         const ev = {
//           preventDefault() {},
//           clientX: x,
//           clientY: y,
//         } as unknown as React.MouseEvent;
//         onContextMenu(ev);
//       }}
//     >
//       <MoreVertical size={16} />
//     </button>
//   );
// }

// function InlineRename({ defaultValue, onSubmit }: { defaultValue: string; onSubmit: (v: string) => void }) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   useEffect(() => inputRef.current?.select(), []);
//   return (
//     <form
//       className="flex-1"
//       onSubmit={(e) => {
//         e.preventDefault();
//         onSubmit(inputRef.current?.value || defaultValue);
//       }}
//     >
//       <input
//         ref={inputRef}
//         defaultValue={defaultValue}
//         className="input h-8 px-2 text-sm"
//         onBlur={(e) => onSubmit(e.currentTarget.value)}
//         aria-label="Rename"
//       />
//     </form>
//   );
// }

// function ContextMenu({ x, y, onClose, children }: { x: number; y: number; onClose: () => void; children: React.ReactNode }) {
//   // Keep the menu within viewport
//   const [pos, setPos] = useState({ x, y });
//   const ref = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;
//     const r = el.getBoundingClientRect();
//     const nx = Math.min(x, vw - r.width - 8);
//     const ny = Math.min(y, vh - r.height - 8);
//     setPos({ x: nx, y: ny });
//   }, [x, y]);
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose]);
//   return (
//     <div
//       ref={ref}
//       className="fixed z-50 w-44 rounded-md border border-zinc-200 bg-white p-1 text-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
//       style={{ left: pos.x, top: pos.y }}
//       role="menu"
//     >
//       {children}
//     </div>
//   );
// }

// function MenuButton({ children, onClick, destructive }: { children: React.ReactNode; onClick: () => void; destructive?: boolean }) {
//   return (
//     <button
//       className={`w-full rounded px-2 py-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
//         destructive ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : ""
//       }`}
//       role="menuitem"
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// }

// function formatBytes(n: number) {
//   if (n < 0) return "—";
//   const units = ["B", "KB", "MB", "GB", "TB"];
//   let i = 0;
//   let v = n;
//   while (v >= 1024 && i < units.length - 1) {
//     v /= 1024;
//     i++;
//   }
//   return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
// }





"use client";
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useFs, type FileNode } from "@/lib/store";
import {
  FolderPlus,
  Folder,
  File as FileIcon,
  MoreVertical,
  ArrowLeft,
  Share2,
  Pencil,
  Trash2,
  Plus,
  Upload,
  List as ListIcon,
  Grid3X3,
  ChevronRight,
  SortAsc,
} from "lucide-react";
import ShareDialog from "./ShareDialog";

/**
 * FileList (optimized)
 * - Breadcrumbs
 * - Grid/List toggle
 * - Sorting (Name/Type/Size)
 * - Multi-selection (Shift/Ctrl/Cmd)
 * - Inline rename
 * - Context menu + right-click (portal)
 * - Drag & drop + paste upload
 * Optimization:
 * - React.memo on rows/cards
 * - Stable handlers via useCallback
 * - useDeferredValue for large lists
 * - Selection stored as Set for O(1) lookups
 * - Cached ids for fast range selection
 * - ContextMenu in portal to avoid reflow/overflow issues
 */
export default function FileList() {
  const { root, path, setPath, create, rename, remove, uploadMany } = useFs();

  // UI state
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [shareFor, setShareFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "type" | "size">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const idPrefix = useId();

  // Resolve current folder (memoized)
  const parent = useMemo(() => {
    let cur: FileNode = root;
    for (const seg of path) {
      const next = (cur.children || []).find(
        (c) => c.type === "folder" && c.name === seg
      );
      if (!next) break;
      cur = next;
    }
    return cur || root;
  }, [root, path]);

  // Items base (hide trashed) – defer to keep typing/hover snappy while sorting large arrays
  const baseItems = useMemo(
    () => (parent.children || []).filter((i) => !i.trashed),
    [parent.children]
  );
  const deferredBase = useDeferredValue(baseItems);

  // Sorted items (memoized)
  const items = useMemo(() => {
    const keyed = [...deferredBase];
    const dir = sortAsc ? 1 : -1;
    keyed.sort((a, b) => {
      if (sortBy === "type") {
        // folders before files
        const ta = a.type === "folder" ? 0 : 1;
        const tb = b.type === "folder" ? 0 : 1;
        if (ta !== tb) return (ta - tb) * dir;
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortBy === "size") {
        const sa = typeof (a as any).size === "number" ? (a as any).size : -1;
        const sb = typeof (b as any).size === "number" ? (b as any).size : -1;
        if (sa !== sb) return (sa - sb) * dir;
        return a.name.localeCompare(b.name) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
    return keyed;
  }, [deferredBase, sortBy, sortAsc]);

  // Cached IDs for fast range selection
  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const lastSelected = useMemo(() => {
    let last: string | undefined;
    selected.forEach((id) => (last = id));
    return last;
  }, [selected]);

  // Close menus on outside click / Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!listRef.current) return;
      if (e.target && listRef.current.contains(e.target as Node)) return;
      setMenuFor(null);
      setMenuPos(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuFor(null);
        setMenuPos(null);
        setRenamingId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Selection helpers (stable)
  const setOnly = useCallback((id: string) => {
    setSelected(new Set([id]));
  }, []);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const a = itemIds.indexOf(fromId);
      const b = itemIds.indexOf(toId);
      if (a < 0 || b < 0) return;
      const [start, end] = a < b ? [a, b] : [b, a];
      const next = new Set<string>();
      for (let i = start; i <= end; i++) next.add(itemIds[i]);
      setSelected(next);
    },
    [itemIds]
  );

  // DnD / Paste (stable)
  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      if (files.length) uploadMany(files);
    },
    [uploadMany]
  );

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    if (e.currentTarget === e.target) setDragOver(false);
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || []).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      if (files.length) uploadMany(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [uploadMany]);

  // Actions (stable)
  const doRename = useCallback(
    (id: string, nextName: string) => {
      if (!nextName || !nextName.trim()) return setRenamingId(null);
      rename(id, nextName.trim());
      setRenamingId(null);
    },
    [rename]
  );

  const openContextMenu = useCallback(
    (e: React.MouseEvent, fileId: string) => {
      e.preventDefault();
      setMenuFor(fileId);
      setMenuPos({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const openItem = useCallback(
    (it: FileNode) => {
      if (it.type === "folder") setPath([...path, it.name]);
    },
    [path, setPath]
  );

  // UI bits (stable)
  const Sorter = (
    <div className="flex items-center gap-1">
      <label className="sr-only" htmlFor={`${idPrefix}-sort`}>
        Sort by
      </label>
      <div className="relative">
        <select
          id={`${idPrefix}-sort`}
          className="input pr-8"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          aria-label="Sort files by"
        >
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="size">Size</option>
        </select>
        <SortAsc className="pointer-events-none absolute right-2 top-2.5" size={16} />
      </div>
      <button
        className="btn-outline"
        aria-label={sortAsc ? "Ascending" : "Descending"}
        title={sortAsc ? "Ascending" : "Descending"}
        onClick={() => setSortAsc((s) => !s)}
      >
        {sortAsc ? "ASC" : "DESC"}
      </button>
    </div>
  );

  const ViewToggle = (
    <div className="inline-flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
      <button
        className={`px-3 py-2 text-sm ${view === "grid" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
      >
        <Grid3X3 size={16} />
      </button>
      <button
        className={`px-3 py-2 text-sm ${view === "list" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
      >
        <ListIcon size={16} />
      </button>
    </div>
  );

  // Row/card click handler (stable)
  const onItemClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (e.shiftKey && lastSelected) {
        selectRange(lastSelected, id);
      } else if (e.metaKey || e.ctrlKey) {
        toggleOne(id);
      } else {
        setOnly(id);
      }
    },
    [lastSelected, selectRange, toggleOne, setOnly]
  );

  return (
    <div
      className="flex-1 p-3"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      ref={listRef}
    >
      {/* Path controls */}
      <div className="mb-3 flex items-center gap-2">
        <button
          className="btn-outline"
          disabled={path.length === 0}
          onClick={() => setPath(path.slice(0, -1))}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 truncate text-sm">
          <ol className="flex items-center gap-1">
            <li>
              <button
                className="link"
                onClick={() => setPath([])}
                aria-current={path.length === 0 ? "page" : undefined}
              >
                Home
              </button>
            </li>
            {path.map((seg, i) => (
              <li key={i} className="flex items-center gap-1">
                <ChevronRight size={14} className="opacity-60" />
                <button
                  className="link max-w-[10rem] truncate"
                  onClick={() => setPath(path.slice(0, i + 1))}
                  aria-current={i === path.length - 1 ? "page" : undefined}
                  title={seg}
                >
                  {seg}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {Sorter}
          {ViewToggle}
          <button className="btn-outline" onClick={() => create("New folder", "folder")}>
            <FolderPlus size={16} />
            New folder
          </button>
          <label className="btn-outline cursor-pointer" aria-label="Upload files">
            <Upload size={16} />
            Upload
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []).map((f) => ({
                  name: f.name,
                  size: f.size,
                }));
                if (files.length) uploadMany(files);
                (e.currentTarget as HTMLInputElement).value = "";
              }}
            />
          </label>
          <button className="btn" onClick={() => create("Untitled.txt", "file")}>
            <Plus size={16} />
            New file
          </button>
        </div>
      </div>

      {/* Dropzone hint */}
      <div
        className={
          "mb-3 rounded-md border border-dashed p-3 text-xs text-zinc-600 " +
          (dragOver
            ? "border-brand-500 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-900/20"
            : "border-brand-300 bg-brand-50/40 dark:border-brand-900 dark:bg-zinc-900")
        }
        role="status"
        aria-live="polite"
      >
        Drag & drop files or paste to upload (front‑end mock).
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Folder className="mb-2 opacity-70" />
          <div className="font-medium">This folder is empty</div>
          <div className="text-sm opacity-70">
            Create a folder, upload files, or drop them here.
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn" onClick={() => create("New folder", "folder")}>
              <FolderPlus size={16} /> New folder
            </button>
            <label className="btn-outline cursor-pointer">
              <Upload size={16} /> Upload
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map((f) => ({
                    name: f.name,
                    size: f.size,
                  }));
                  if (files.length) uploadMany(files);
                  (e.currentTarget as HTMLInputElement).value = "";
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Files */}
      {items.length > 0 && (
        <div>
          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {items.map((it) => (
                <ItemCard
                  key={it.id}
                  it={it}
                  selected={selected.has(it.id)}
                  onOpen={() => openItem(it)}
                  onRename={() => setRenamingId(it.id)}
                  onShare={() => setShareFor(it.id)}
                  onDelete={() => remove(it.id)}
                  onClick={(e) => onItemClick(e, it.id)}
                  onContextMenu={(e) => openContextMenu(e, it.id)}
                  renaming={renamingId === it.id}
                  doRename={(name) => doRename(it.id, name)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-[32px,1fr,100px,40px] items-center bg-zinc-50 px-3 py-2 text-xs font-medium uppercase tracking-wide dark:bg-zinc-900/40">
                <div />
                <div>Name</div>
                <div className="text-right">Size</div>
                <div />
              </div>
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((it) => (
                  <ListRow
                    key={it.id}
                    it={it}
                    selected={selected.has(it.id)}
                    onOpen={() => openItem(it)}
                    onRename={() => setRenamingId(it.id)}
                    onShare={() => setShareFor(it.id)}
                    onDelete={() => remove(it.id)}
                    onClick={(e) => onItemClick(e, it.id)}
                    onContextMenu={(e) => openContextMenu(e, it.id)}
                    renaming={renamingId === it.id}
                    doRename={(name) => doRename(it.id, name)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Context menu (portal) */}
      {menuFor && menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => {
            setMenuFor(null);
            setMenuPos(null);
          }}
        >
          <MenuButton onClick={() => { setRenamingId(menuFor); setMenuFor(null); }}>
            <Pencil size={14} className="mr-2" /> Rename
          </MenuButton>
          <MenuButton onClick={() => { setShareFor(menuFor); setMenuFor(null); }}>
            <Share2 size={14} className="mr-2" /> Share…
          </MenuButton>
          <MenuButton destructive onClick={() => { remove(menuFor); setMenuFor(null); }}>
            <Trash2 size={14} className="mr-2" /> Delete
          </MenuButton>
        </ContextMenu>
      )}

      {shareFor && <ShareDialog id={shareFor} onClose={() => setShareFor(null)} />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Subcomponents (memoized)
 * ──────────────────────────────────────────────────────────────────────────── */

type ItemCardProps = {
  it: FileNode;
  selected: boolean;
  onOpen: () => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
  renaming: boolean;
  doRename: (nextName: string) => void;
};

const ItemCard = memo(function ItemCard({
  it,
  selected,
  onOpen,
  onClick,
  onContextMenu,
  renaming,
  doRename,
}: ItemCardProps) {
  return (
    <div
      className={`card relative cursor-default border transition ${
        selected ? "ring-2 ring-brand-500 border-brand-300 dark:border-brand-800" : ""
      }`}
      onClick={onClick}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      style={{ willChange: "transform" }}
    >
      <div className="flex items-center gap-2">
        {it.type === "folder" ? <Folder /> : <FileIcon />}

        {renaming ? (
          <InlineRename defaultValue={it.name} onSubmit={doRename} />
        ) : (
          <button
            className="text-left font-medium hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              if (it.type === "folder") onOpen();
            }}
          >
            {it.name}
          </button>
        )}

        <button
          className="ml-auto btn-outline px-2 py-1"
          aria-label={`More actions for ${it.name}`}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            // synthesize a mouse event-like object for positioning
            const x = rect.left + rect.width;
            const y = rect.top + rect.height;
            const ev = {
              preventDefault() {},
              clientX: x,
              clientY: y,
            } as unknown as React.MouseEvent;
            onContextMenu(ev);
          }}
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}, areItemPropsEqual);

function areItemPropsEqual(prev: ItemCardProps, next: ItemCardProps) {
  return (
    prev.it.id === next.it.id &&
    prev.it.name === next.it.name &&
    prev.it.type === next.it.type &&
    prev.selected === next.selected &&
    prev.renaming === next.renaming
  );
}

const ListRow = memo(function ListRow(props: ItemCardProps) {
  const { it, selected, onOpen, onClick, onContextMenu, renaming, doRename } = props;
  return (
    <li
      className={`grid grid-cols-[32px,1fr,100px,40px] items-center px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${
        selected ? "bg-brand-50/60 dark:bg-brand-900/20" : ""
      }`}
      onClick={onClick}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      role="row"
      aria-selected={selected}
      style={{ willChange: "transform" }}
    >
      <div className="opacity-80">
        {it.type === "folder" ? <Folder size={18} /> : <FileIcon size={18} />}
      </div>
      <div className="truncate">
        {renaming ? (
          <InlineRename defaultValue={it.name} onSubmit={doRename} />
        ) : (
          <span className="font-medium">{it.name}</span>
        )}
      </div>
      <div className="text-right text-sm tabular-nums opacity-75">
        {typeof (it as any).size === "number" ? formatBytes((it as any).size) : "—"}
      </div>
      <div className="flex justify-end">
        <MoreKebabMirror onContextMenu={onContextMenu} />
      </div>
    </li>
  );
}, areItemPropsEqual);

function MoreKebabMirror({ onContextMenu }: { onContextMenu: (e: React.MouseEvent) => void }) {
  return (
    <button
      className="btn-outline px-2 py-1"
      aria-label="More actions"
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = rect.left + rect.width;
        const y = rect.top + rect.height;
        const ev = {
          preventDefault() {},
          clientX: x,
          clientY: y,
        } as unknown as React.MouseEvent;
        onContextMenu(ev);
      }}
    >
      <MoreVertical size={16} />
    </button>
  );
}

function InlineRename({
  defaultValue,
  onSubmit,
}: {
  defaultValue: string;
  onSubmit: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.select(), []);
  return (
    <form
      className="flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(inputRef.current?.value || defaultValue);
      }}
    >
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        className="input h-8 px-2 text-sm"
        onBlur={(e) => onSubmit(e.currentTarget.value)}
        aria-label="Rename"
      />
    </form>
  );
}

function ContextMenu({
  x,
  y,
  onClose,
  children,
}: {
  x: number;
  y: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ x, y });
  const ref = useRef<HTMLDivElement>(null);

  // Fit menu in viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const nx = Math.min(x, vw - r.width - 8);
    const ny = Math.min(y, vh - r.height - 8);
    setPos({ x: nx, y: ny });
  }, [x, y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const node = (
    <div
      ref={ref}
      className="fixed z-50 w-44 rounded-md border border-zinc-200 bg-white p-1 text-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
    >
      {children}
    </div>
  );

  return createPortal(node, document.body);
}

function MenuButton({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      className={`w-full rounded px-2 py-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        destructive ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : ""
      }`}
      role="menuitem"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatBytes(n: number) {
  if (n < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
