"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import Link from "next/link";

export default function AuthStatus() {
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!email) {
    return <Link href="/login" className="text-sm hover:underline">登录</Link>;
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="opacity-80">{email}</span>
      <button
        className="px-2 py-1 rounded border hover:bg-black/5 dark:hover:bg-white/10"
        onClick={() => supabase.auth.signOut()}
      >
        退出
      </button>
    </div>
  );
}


