"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

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
        options: { emailRedirectTo: `${window.location.origin}/restore/callback` },
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
    <div className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">恢复购买</h1>
      <p className="opacity-80 mb-4 text-sm">输入支付使用的邮箱，我们会发送恢复链接以解锁设备。</p>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
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


