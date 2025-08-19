"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "owner" | "admin" | "member";
export type SharePerm = "view" | "read" | "edit";

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  trashed?: boolean;
  children?: FileNode[];
  shared?: { link: string; perm: SharePerm } | null;
};

type AuthState = {
  registered: boolean;
  user?: { id: string; name: string; email: string; role: Role };
  register: (name: string, email: string, password: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

type FsState = {
  root: FileNode;
  path: string[]; // e.g. ["Photos","2024"]
  setPath: (p: string[]) => void;
  create: (name: string, type: "file" | "folder") => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void; // soft delete -> Trash
  restore: (id: string) => void;
  purge: (id: string) => void;
  share: (id: string, perm: SharePerm) => void;
  unshare: (id: string) => void;
  uploadMany: (files: { name: string; size: number }[]) => void;
};

const findById = (node: FileNode, id: string): FileNode | null => {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const c of node.children) {
    const f = findById(c, id);
    if (f) return f;
  }
  return null;
};

const findAtPath = (root: FileNode, path: string[]): FileNode => {
  let cur = root;
  for (const seg of path) {
    cur = (cur.children || []).find(c => c.type === "folder" && c.name === seg)!;
  }
  return cur;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      registered: false,
      user: undefined,
      register: (name, email, _pw) => {
        localStorage.setItem("zq.registered", "1");
        set({ registered: true, user: { id: "u1", name, email, role: "owner" } });
      },
      login: (email, _pw) => {
        const ok = localStorage.getItem("zq.registered") === "1";
        if (ok) set({ user: { id: "u1", name: "Zynq User", email, role: "owner" } });
        return ok;
      },
      logout: () => set({ user: undefined })
    }),
    { name: "zq_auth" }
  )
);

export const useFs = create<FsState>()(
  persist(
    (set, get) => ({
      root: {
        id: "root",
        name: "root",
        type: "folder",
        children: [
          { id: "docs", name: "Documents", type: "folder", children: [] },
          { id: "photos", name: "Photos", type: "folder", children: [] },
          { id: "readme", name: "Readme.txt", type: "file", size: 1234 }
        ]
      },
      path: [],
      setPath: (p) => set({ path: p }),
      create: (name, type) =>
        set((s) => {
          const parent = findAtPath(s.root, s.path);
          parent.children = parent.children || [];
          parent.children.push({
            id: crypto.randomUUID(),
            name,
            type,
            size: type === "file" ? 0 : undefined,
            children: type === "folder" ? [] : undefined
          });
          return { root: { ...s.root } };
        }),
      rename: (id, name) =>
        set((s) => {
          const node = findById(s.root, id);
          if (node) node.name = name;
          return { root: { ...s.root } };
        }),
      remove: (id) =>
        set((s) => {
          const node = findById(s.root, id);
          if (node) node.trashed = true;
          return { root: { ...s.root } };
        }),
      restore: (id) =>
        set((s) => {
          const n = findById(s.root, id);
          if (n) n.trashed = false;
          return { root: { ...s.root } };
        }),
      purge: (id) =>
        set((s) => {
          const strip = (n: FileNode): FileNode => ({
            ...n,
            children: n.children?.filter(c => c.id !== id).map(strip)
          });
          return { root: strip(s.root) };
        }),
      share: (id, perm) =>
        set((s) => {
          const node = findById(s.root, id);
          if (node) node.shared = { link: `${location.origin}/s/${id}`, perm };
          return { root: { ...s.root } };
        }),
      unshare: (id) =>
        set((s) => {
          const node = findById(s.root, id);
          if (node) node.shared = null;
          return { root: { ...s.root } };
        }),
      uploadMany: (files) =>
        set((s) => {
          const parent = findAtPath(s.root, s.path);
          parent.children = parent.children || [];
          files.forEach((f) =>
            parent.children!.push({ id: crypto.randomUUID(), name: f.name, type: "file", size: f.size })
          );
          return { root: { ...s.root } };
        })
    }),
    { name: "zq_fs" }
  )
);
