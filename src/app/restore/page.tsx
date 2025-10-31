"use client";
import { useState, useRef } from "react";
import { useLang } from "@/lib/lang";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getBaseUrl } from "@/lib/config";
import Link from "next/link";

export default function RestorePage() {
  const supabase = getSupabaseBrowser();
  const lang = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSend() {
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${getBaseUrl()}/restore/callback?next=/play/deeptalk?restore=ok` },
      });
      if (error) throw error;
      setMsg(lang==='en'? 'Restore link sent. Please check your inbox.' : "恢复链接已发送，请检查邮箱");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : (lang==='en'? 'Failed to send' : "发送失败");
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLink() {
    setLoading(true);
    setMsg(null);
    setGeneratedLink(null);
    try {
      const r = await fetch("/api/restore/sign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || (lang==='en'? 'Failed to generate' : "生成失败"));
      setGeneratedLink(j.link as string);
      setMsg(lang==='en'? 'Restore link generated' : "已生成恢复链接");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : (lang==='en'? 'Failed to generate' : "生成失败");
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
          <span className="text-purple-200 group-hover:text-white">{lang==='en'? 'Back' : '返回'}</span>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-purple-200">{lang==='en'? 'Restore purchase' : '恢复购买'}</h1>
      <p className="opacity-80 mb-4 text-sm">{lang==='en'? 'Enter the email you used for purchase. We will send you a restore link to unlock this device.' : '输入支付使用的邮箱，我们会发送恢复链接以解锁设备。'}</p>
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
          {lang==='en'? 'Send' : '发送'}
        </button>
        <button
          className="px-4 py-2 rounded-full border border-purple-500/60 text-sm hover:bg-purple-600/10 disabled:opacity-50"
          onClick={handleGenerateLink}
          disabled={!email || loading}
        >
          {lang==='en'? 'Generate link' : '直接生成链接'}
        </button>
      </div>
      {msg && <div className="mt-4 text-sm opacity-80">{msg}</div>}
      {generatedLink && (
        <div className="mt-3 rounded-xl border border-purple-500/60 bg-black/80 text-white p-4 shadow-[0_8px_30px_rgba(168,85,247,.25)]">
          <div className="text-xs opacity-80 mb-2">{lang==='en'? 'Signed restore link (valid for 30 minutes)' : '签名恢复链接（30分钟内有效）'}</div>
          <div className="flex items-start gap-2">
            <textarea
              ref={linkRef}
              readOnly
              value={generatedLink}
              className="flex-1 text-xs bg-black/40 border border-purple-500/40 rounded p-2 leading-relaxed break-all select-all"
              rows={3}
            />
            <button
              onClick={async ()=>{
                try {
                  await navigator.clipboard.writeText(generatedLink);
                  setCopied(true);
                  setTimeout(()=>setCopied(false), 1200);
                } catch {
                  try { linkRef.current?.select(); document.execCommand('copy'); setCopied(true); setTimeout(()=>setCopied(false), 1200); } catch {}
                }
              }}
              className="shrink-0 px-3 py-2 rounded-full border border-purple-500/60 text-xs hover:bg-purple-600/10"
            >{lang==='en'? 'Copy' : '复制'}</button>
          </div>
          <div className={`mt-2 text-xs transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>{lang==='en'? 'Copied. Please open it in your system browser.' : '已复制，请粘贴到系统浏览器打开'}</div>
        </div>
      )}
    </div>
  );
}


