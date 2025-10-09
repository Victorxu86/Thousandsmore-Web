"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getBaseUrl } from "@/lib/config";
import Link from "next/link";

export default function RestorePage() {
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${getBaseUrl()}/restore/callback` },
      });
      if (error) throw error;
      setMsg("恢复链接已发送，请检查邮箱");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "发送失败";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-6">
        <Link href="/" className="group inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-purple-500/60 hover:bg-purple-600/10 shadow-[0_2px_10px_rgba(168,85,247,0.25)] transition">
          <span className="inline-block w-0 h-0 border-t-4 border-b-4 border-r-6 border-t-transparent border-b-transparent border-r-purple-500/80"></span>
          <span className="text-purple-200 group-hover:text-white">返回</span>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-purple-200">恢复购买</h1>
      <p className="opacity-80 mb-4 text-sm">输入支付使用的邮箱，我们会发送恢复链接以解锁设备。</p>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 rounded border border-purple-500/60 bg-transparent px-3 py-2"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-full border border-purple-500/60 text-sm hover:bg-purple-600/10 disabled:opacity-50"
          onClick={handleSend}
          disabled={!email || loading}
        >
          发送
        </button>
      </div>
      {msg && <div className="mt-4 text-sm opacity-80">{msg}</div>}
    </div>
  );
}


