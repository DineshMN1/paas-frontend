"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const r = useRouter();
  useEffect(() => {
    const registered = localStorage.getItem("zq.registered") === "1";
    r.replace(registered ? "/login" : "/register");
  }, [r]);
  return null;
}
