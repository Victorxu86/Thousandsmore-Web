"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessInner() {
  const sp = useSearchParams();
  const sid = sp.get("session_id");
  async function claim() {
    if (!sid) return;
    try {
      await fetch("/api/stripe/claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: sid }) });
    } catch {}
  }
  if (sid) claim();
  return (
    <div className="min-h-screen p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">支付完成</h1>
      <p className="opacity-80 mb-6">我们已收到你的订单。稍后将自动开通权限。</p>
      {sid && (
        <div className="rounded border p-4 mb-6">
          <div className="text-xs opacity-70">Checkout Session</div>
          <div className="text-sm break-all">{sid}</div>
        </div>
      )}
      <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 max-w-xl mx-auto opacity-70">加载中…</div>}>
      <SuccessInner />
    </Suspense>
  );
}


