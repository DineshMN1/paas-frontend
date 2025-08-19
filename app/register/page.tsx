"use client";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/lib/store";
import { useState } from "react";

export default function Register() {
  const r = useRouter();
  const { register, registered } = useAuth();
  const [name, setName] = useState("Paas User");
  const [email, setEmail] = useState("user@example.com");
  const [pw, setPw] = useState("");

  if (registered) r.replace("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-md p-6">
        <h1 className="mb-4 text-2xl font-semibold">Create your ZynqCloud account</h1>
        <div className="card space-y-3">
          <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="input" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)}/>
          <button className="btn w-full" onClick={()=>{ register(name,email,pw); r.replace("/login"); }}>Register</button>
          <p className="text-sm text-center">Already have an account? <a className="link" href="/login">Login</a></p>
        </div>
      </main>
    </div>
  );
}
