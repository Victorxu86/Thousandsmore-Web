"use client";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/" className="group inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-purple-500/60 hover:bg-purple-600/10 shadow-[0_2px_10px_rgba(168,85,247,0.25)] transition">
          <span className="inline-block w-0 h-0 border-t-4 border-b-4 border-r-6 border-t-transparent border-b-transparent border-r-purple-500/80"></span>
          <span className="text-purple-200 group-hover:text-white">返回</span>
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-4 text-purple-200">定价</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-purple-500/40 p-6 bg-black/20 backdrop-blur-[2px] shadow-[0_8px_30px_rgba(88,28,135,0.25)]">
          <div className="text-lg font-medium mb-2">体验版</div>
          <div className="opacity-80 mb-4">每个板块 10 次随机题目/活动</div>
          <div className="text-2xl font-semibold mb-4">免费</div>
          <button className="px-4 py-2 rounded-full border border-purple-500/60 text-sm hover:bg-purple-600/10">当前方案</button>
        </div>
        <div className="rounded-lg border border-purple-500/40 p-6 bg-black/20 backdrop-blur-[2px] shadow-[0_8px_30px_rgba(88,28,135,0.25)]">
          <div className="text-lg font-medium mb-2">永久解锁</div>
          <div className="opacity-80 mb-4">一次购买，解锁全部题库与次数限制</div>
          <div className="text-2xl font-semibold mb-4">¥28.8</div>
          <button
            className="px-4 py-2 rounded-full border border-purple-500/60 text-sm hover:bg-purple-600/10"
            onClick={async () => {
              try {
                const res = await fetch("/api/stripe/checkout", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else alert(data.error || "无法创建结账会话");
              } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "网络异常";
                alert(message);
              }
            }}
          >
            购买
          </button>
        </div>
      </div>
    </div>
  );
}


