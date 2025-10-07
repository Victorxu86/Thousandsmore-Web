"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const sid = sp.get("session_id");
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


