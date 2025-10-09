"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const w = typeof window !== "undefined" ? window : null;
    const noIntro = w ? new URLSearchParams(w.location.search).get("noIntro") === "1" : false;
    let skip = false;
    try { skip = w ? w.sessionStorage.getItem("introShown") === "1" : false; } catch {}
    if (noIntro || skip) {
      setIntro(false);
      document.documentElement.classList.remove("hide-nav");
      return;
    }
    // 动画期间隐藏导航
    document.documentElement.classList.add("hide-nav");
    const t = setTimeout(() => {
      setIntro(false);
      document.documentElement.classList.remove("hide-nav");
      try { w?.sessionStorage.setItem("introShown", "1"); } catch {}
    }, 3400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      {intro && (
        <style id="home-hide-nav">{`.top-nav{opacity:0;pointer-events:none;}`}</style>
      )}
      <div className="relative w-full max-w-5xl mx-auto px-6">
        <h1 className={`fixed top-[25vh] left-1/2 -translate-x-1/2 text-3xl sm:text-4xl font-semibold text-center pointer-events-none z-10 ${intro ? "intro-fade" : ""}`}>Thousands More</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
          {/* 朋友（紫） */}
          <Link href="/play/dating" className="group block">
            <div className={`relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-purple-500/60 flex items-center justify-center overflow-hidden ${intro ? "intro-ring-1" : ""}`}>
              <div className="ring-breathe border-purple-500/70" />
              <div className="glow-layer glow-strong glow-purple" />
              <div className="glow-layer glow-purple" />
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
            <div className={`relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-yellow-500/60 flex items-center justify-center overflow-hidden ${intro ? "intro-ring-2" : ""}`}>
              <div className="ring-breathe border-yellow-500/70" />
              <div className="glow-layer glow-strong glow-yellow" />
              <div className="glow-layer glow-yellow" />
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
            <div className={`relative mx-auto w-[220px] h-[220px] rounded-full border-2 border-rose-600/60 flex items-center justify-center overflow-hidden ${intro ? "intro-ring-3" : ""}`}>
              <div className="ring-breathe border-rose-600/70" />
              <div className="glow-layer glow-strong glow-rose" />
              <div className="glow-layer glow-rose" />
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

        {/* 底部声明（进场结束后显示） */}
        {!intro && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 text-center text-[11px] sm:text-xs opacity-70 z-10">
            <span>
              使用本网站即表示您同意遵守并受我们的
              <Link href="/terms" className="underline hover:opacity-90 mx-1">服务条款</Link>
              与
              <Link href="/privacy" className="underline hover:opacity-90 mx-1">隐私政策</Link>
              的约束。成人相关内容仅面向已成年且自愿、合规、尊重边界的用户。
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
