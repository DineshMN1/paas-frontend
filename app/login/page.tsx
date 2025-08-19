"use client";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Login() {
  const r = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("user@example.com");
  const [pw, setPw] = useState("");

  useEffect(()=>{ if (user) r.replace("/dashboard"); }, [user, r]);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-md p-6">
        <h1 className="mb-4 text-2xl font-semibold">Login</h1>
        <div className="card space-y-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="input" placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)}/>
          <button className="btn w-full" onClick={()=> login(email, pw) && r.replace("/dashboard")}>Sign in</button>
          <p className="text-sm text-center">New here? <a className="link" href="/register">Create an account</a></p>
        </div>
      </main>
    </div>
  );
}
