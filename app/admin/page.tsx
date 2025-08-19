"use client";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useAuth, Role } from "@/lib/store";
import { useState } from "react";

export default function Admin() {
  const { user } = useAuth();
  const [members, setMembers] = useState<{id:string;name:string;email:string;role:Role}[]>([
    { id: "u1", name: user?.name || "Owner", email: user?.email || "owner@example.com", role: "owner" },
  ]);
  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="p-4">
          <div className="card max-w-3xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Admin</h2>
              <button className="btn" onClick={()=>{
                const name = prompt("Member name"); const email = prompt("Email");
                if (name && email) setMembers(m=>[...m,{id:crypto.randomUUID(),name,email,role:"member"}]);
              }}>Add member</button>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-500">
                <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th></th></tr>
              </thead>
              <tbody>
                {members.map(m=>(
                  <tr key={m.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="py-2">{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      <select className="input" value={m.role} onChange={e=>{
                        const role = e.target.value as Role;
                        setMembers(list=>list.map(x=> x.id===m.id? {...x, role}: x));
                      }}>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button className="btn-outline" onClick={()=> setMembers(list=>list.filter(x=>x.id!==m.id))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-zinc-500">Frontend-only — wire these actions to your Go APIs later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
