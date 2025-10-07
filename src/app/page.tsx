"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 3400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      {/* 欢迎动画覆盖层 */}
      {!introDone && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-background">
          <div className="relative w-full max-w-5xl mx-auto px-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-center mb-10">Thousandsmore</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
              <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-purple-500/60 flex items-center justify-center overflow-hidden intro-ring-1">
                <div className="absolute inset-[-20%] rounded-full border-2 border-purple-500/40 wobble-spin" style={{ animationDuration: "2.2s" }} />
                <div className="absolute inset-[-10%] rounded-full border-2 border-purple-500/60 wobble-spin" style={{ animationDuration: "2.6s", animationDelay: "-.4s" }} />
                <div className="absolute inset-0 rounded-full border-2 border-purple-500 wobble-spin" style={{ animationDuration: "3.0s", animationDelay: "-.6s" }} />
                <div className="relative text-center">
                  <div className="text-sm uppercase tracking-wide opacity-70 mb-1">朋友</div>
                  <div className="text-lg font-medium">开启话题</div>
                </div>
              </div>
              <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-yellow-500/60 flex items-center justify-center overflow-hidden intro-ring-2">
                <div className="absolute inset-[-20%] rounded-full border-2 border-yellow-500/40 wobble-spin" style={{ animationDuration: "2.4s" }} />
                <div className="absolute inset-[-10%] rounded-full border-2 border-yellow-500/60 wobble-spin" style={{ animationDuration: "2.8s", animationDelay: "-.5s" }} />
                <div className="absolute inset-0 rounded-full border-2 border-yellow-500 wobble-spin" style={{ animationDuration: "3.1s", animationDelay: "-.7s" }} />
                <div className="relative text-center">
                  <div className="text-sm uppercase tracking-wide opacity-70 mb-1">酒桌</div>
                  <div className="text-lg font-medium">真心话/大冒险</div>
                </div>
              </div>
              <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-rose-600/60 flex items-center justify-center overflow-hidden intro-ring-3">
                <div className="absolute inset-[-20%] rounded-full border-2 border-rose-600/40 wobble-spin" style={{ animationDuration: "2.1s" }} />
                <div className="absolute inset-[-10%] rounded-full border-2 border-rose-600/60 wobble-spin" style={{ animationDuration: "2.6s", animationDelay: "-.3s" }} />
                <div className="absolute inset-0 rounded-full border-2 border-rose-600 wobble-spin" style={{ animationDuration: "3.0s", animationDelay: "-.5s" }} />
                <div className="relative text-center">
                  <div className="text-sm uppercase tracking-wide opacity-70 mb-1">激情</div>
                  <div className="text-lg font-medium">边界内探索</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主页面布局 */}
      <div className="relative w-full max-w-5xl mx-auto px-6">
        <h1 className="text-3xl sm:text-4xl font-semibold text-center mb-8">Thousandsmore</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
          {/* 朋友（紫） */}
          <Link href="/play/dating" className="group block">
            <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-purple-500/60 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-[-20%] rounded-full border-2 border-purple-500/40 wobble-spin" style={{ animationDuration: "6.5s" }} />
              <div className="absolute inset-[-10%] rounded-full border-2 border-purple-500/60 wobble-spin" style={{ animationDuration: "7.3s", animationDelay: "-.6s" }} />
              <div className="absolute inset-0 rounded-full border-2 border-purple-500 wobble-spin" style={{ animationDuration: "8.4s", animationDelay: "-.9s" }} />
              <div className="relative text-center">
                <div className="text-sm uppercase tracking-wide opacity-70 mb-1">朋友</div>
                <div className="text-lg font-medium">开启话题</div>
              </div>
            </div>
          </Link>

          {/* 酒桌（金） */}
          <Link href="/play/party" className="group block">
            <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-yellow-500/60 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-[-20%] rounded-full border-2 border-yellow-500/40 wobble-spin" style={{ animationDuration: "6.8s" }} />
              <div className="absolute inset-[-10%] rounded-full border-2 border-yellow-500/60 wobble-spin" style={{ animationDuration: "7.6s", animationDelay: "-.7s" }} />
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500 wobble-spin" style={{ animationDuration: "8.8s", animationDelay: "-1.1s" }} />
              <div className="relative text-center">
                <div className="text-sm uppercase tracking-wide opacity-70 mb-1">酒桌</div>
                <div className="text-lg font-medium">真心话/大冒险</div>
              </div>
            </div>
          </Link>

          {/* 激情（艳红） */}
          <Link href="/play/intimacy" className="group block">
            <div className="relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-rose-600/60 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-[-20%] rounded-full border-2 border-rose-600/40 wobble-spin" style={{ animationDuration: "6.2s" }} />
              <div className="absolute inset-[-10%] rounded-full border-2 border-rose-600/60 wobble-spin" style={{ animationDuration: "7.1s", animationDelay: "-.4s" }} />
              <div className="absolute inset-0 rounded-full border-2 border-rose-600 wobble-spin" style={{ animationDuration: "8.2s", animationDelay: "-.8s" }} />
              <div className="relative text-center">
                <div className="text-sm uppercase tracking-wide opacity-70 mb-1">激情</div>
                <div className="text-lg font-medium">边界内探索</div>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs opacity-70">
          点击圆圈进入不同玩法。成人相关内容仅限成年人在自愿、合规、尊重边界的前提下使用。
        </p>
      </div>
    </main>
  );
}
