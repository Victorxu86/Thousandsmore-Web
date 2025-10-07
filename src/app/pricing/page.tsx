"use client";
export default function PricingPage() {
  return (
    <div className="min-h-screen p-8 sm:p-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">定价</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-6">
          <div className="text-lg font-medium mb-2">体验版</div>
          <div className="opacity-80 mb-4">每个板块 15 次随机题目/活动</div>
          <div className="text-2xl font-semibold mb-4">免费</div>
          <button className="px-4 py-2 rounded border text-sm opacity-70 cursor-not-allowed">当前方案</button>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-lg font-medium mb-2">永久解锁</div>
          <div className="opacity-80 mb-4">一次购买，解锁全部题库与次数限制</div>
          <div className="text-2xl font-semibold mb-4">¥28.8</div>
          <button
            className="px-4 py-2 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => alert("支付集成稍后接入 Stripe，敬请期待")}
          >
            购买
          </button>
        </div>
      </div>
      <p className="text-xs opacity-70 mt-6">定价为占位展示，稍后接入 Stripe Checkout。</p>
    </div>
  );
}


