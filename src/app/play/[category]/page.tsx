"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categories, getCategoryById, getPromptsByType } from "@/data";
import { getRandomPrompt } from "@/data/prompts";
import type { Prompt, PromptType } from "@/data/types";

type PageProps = {
  params: { category: string };
};

export default function PlayCategoryPage({ params }: PageProps) {
  const category = useMemo(() => getCategoryById(params.category), [params.category]);
  const allowedTypes = category?.allowedTypes ?? ["question"];
  const initialType: PromptType | "all" = allowedTypes.length === 1 ? allowedTypes[0] : "all";
  const [typeFilter, setTypeFilter] = useState<PromptType | "all">(initialType);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [seenPromptIds, setSeenPromptIds] = useState<Set<string>>(new Set());
  const [isPro, setIsPro] = useState<boolean>(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [promptReady, setPromptReady] = useState(false);

  const theme = useMemo(() => {
    const id = category?.id;
    if (id === "party") {
      return {
        textAccent: "text-yellow-200",
        borderAccent: "border-yellow-500/60",
        borderStrong: "border-yellow-500/70",
        cardBorder: "border-yellow-500/40",
        hoverAccentBg: "hover:bg-yellow-500/10",
        arrowColor: "border-r-yellow-500/80",
        shadowAccent: "shadow-[0_2px_10px_rgba(234,179,8,0.25)]",
        cardShadow: "shadow-[0_8px_30px_rgba(234,179,8,0.25)]",
        selectedPill: "bg-yellow-500 text-black border-yellow-500",
      } as const;
    }
    if (id === "intimacy") {
      return {
        textAccent: "text-rose-200",
        borderAccent: "border-rose-600/60",
        borderStrong: "border-rose-600/70",
        cardBorder: "border-rose-600/40",
        hoverAccentBg: "hover:bg-rose-600/10",
        arrowColor: "border-r-rose-600/80",
        shadowAccent: "shadow-[0_2px_10px_rgba(225,29,72,0.25)]",
        cardShadow: "shadow-[0_8px_30px_rgba(225,29,72,0.25)]",
        selectedPill: "bg-rose-600 text-white border-rose-600",
      } as const;
    }
    // dating (朋友) 默认紫色
    return {
      textAccent: "text-purple-200",
      borderAccent: "border-purple-500/60",
      borderStrong: "border-purple-500/70",
      cardBorder: "border-purple-500/40",
      hoverAccentBg: "hover:bg-purple-600/10",
      arrowColor: "border-r-purple-500/80",
      shadowAccent: "shadow-[0_2px_10px_rgba(168,85,247,0.25)]",
      cardShadow: "shadow-[0_8px_30px_rgba(88,28,135,0.25)]",
      selectedPill: "bg-purple-600 text-white border-purple-600",
    } as const;
  }, [category]);

  // 首次渲染完成标记，避免 SSR/CSR 切换闪烁
  useEffect(() => {
    setHydrated(true);
  }, []);

  // 预置主题，避免进入时“晚一拍”出现
  const defaultTopics = useMemo(() => {
    const map: Record<string, string[]> = {
      dating: ["warmup", "connection", "deep"],
      intimacy: ["truth_basic", "dare_soft", "boundaries"],
      party: ["icebreaker", "dare_fun", "truth_chat"],
    };
    return category ? (map[category.id] ?? []) : [];
  }, [category]);

  useEffect(() => {
    if (defaultTopics.length > 0) setTopics(defaultTopics);
  }, [defaultTopics]);

  useEffect(() => {
    // 从后端查询是否解锁，以及返回列表（后端会按 10 或全部控制）
    async function fetchItems() {
      if (!category) return;
      const q = new URLSearchParams({ category: category.id });
      if (activeTopics.size > 0) q.set("topics", Array.from(activeTopics).join(","));
      const res = await fetch(`/api/prompts?${q.toString()}`);
      const data = await res.json();
      setIsPro(!!data.isPro);
    }
    fetchItems();
  }, [category, activeTopics]);

  useEffect(() => {
    async function fetchTopics() {
      if (!category) return;
      const res = await fetch(`/api/topics?category=${category.id}`);
      const data = await res.json();
      const fetched: string[] = data.topics || [];
      if (fetched.length === 0) return; // 使用预置即可
      // 合并预置与后端，去重
      setTopics((prev) => Array.from(new Set([...(prev.length ? prev : defaultTopics), ...fetched])));
    }
    fetchTopics();
  }, [category, defaultTopics]);

  useEffect(() => {
    if (!category) return;
    const prompts = getPromptsByType(category, typeFilter);
    const next = getRandomPrompt(prompts, undefined);
    setCurrentPrompt(next);
    setSeenPromptIds(new Set(next ? [next.id] : []));
    setPromptReady(true);
  }, [category, typeFilter]);

  if (!category) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">未找到该分类</h1>
        <p className="opacity-80">请选择以下有效分类进入游戏：</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(categories).map((c) => (
            <Link
              key={c.id}
              href={`/play/${c.id}`}
              className="rounded border px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const prompts = getPromptsByType(category, typeFilter);
  const limitReached = false; // 由后端控制返回数量，这里不再本地限制

  function handleNext() {
    if (limitReached) return;
    const next = getRandomPrompt(prompts, seenPromptIds);
    if (next) {
      const newSeen = new Set(seenPromptIds);
      newSeen.add(next.id);
      setSeenPromptIds(newSeen);
      setCurrentPrompt(next);
    }
  }

  function handleUpgrade() {
    window.location.href = "/pricing";
  }

  const ready = hydrated && (topics.length > 0) && promptReady;

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center gap-6 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
      {!ready && (
        <div className="fixed inset-0 bg-background" />
      )}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <Link href="/?noIntro=1" className={`group inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent} transition`}>
          <span className={`inline-block w-0 h-0 border-t-4 border-b-4 border-r-6 border-t-transparent border-b-transparent ${theme.arrowColor}`}></span>
          <span className={`${theme.textAccent} group-hover:text-white`}>返回</span>
        </Link>
        <div className="text-sm opacity-80" />
        <div />
      </div>

      <div className="w-full max-w-2xl text-center mt-10">
        <h1 className={`text-2xl font-semibold mb-2 ${theme.textAccent}`}>{category.id === "party" ? "酒桌" : category.id === "intimacy" ? "激情" : "朋友"}</h1>

        {/* 主题筛选：可视化 pill，默认“全部”；下移排版 */}
        {topics.length > 0 && (
          <div className="mt-6 mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTopics(new Set())}
              className={`px-3 py-1.5 rounded-full border text-sm ${activeTopics.size === 0 ? theme.selectedPill : `${theme.borderAccent} ${theme.textAccent} ${theme.hoverAccentBg}`}`}
            >
              全部
            </button>
            {topics.map((t) => {
              const label = t === 'warmup' ? '热身' : t === 'connection' ? '连接' : t === 'deep' ? '哲学' : t === 'icebreaker' ? '破冰' : t === 'dare_fun' ? '挑战' : t === 'truth_chat' ? '真心话' : t === 'truth_basic' ? '真心话' : t === 'dare_soft' ? '轻冒险' : t === 'boundaries' ? '边界' : t;
              const active = activeTopics.has(t);
              return (
                <button
                  key={t}
                  onClick={() => {
                    const next = new Set(activeTopics);
                    if (next.has(t)) next.delete(t); else next.add(t);
                    setActiveTopics(next);
                  }}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${active ? theme.selectedPill : `${theme.borderAccent} ${theme.textAccent} ${theme.hoverAccentBg}`}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {allowedTypes.length > 1 && (
          <div className="inline-flex rounded-full overflow-hidden mb-6 border">
            {(["all", "truth", "dare"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as ("all" | PromptType))}
                className={`px-4 py-2 text-sm border ${typeFilter === t ? theme.selectedPill : `${theme.borderAccent} ${theme.textAccent} ${theme.hoverAccentBg}`}`}
              >
                {t === "all" ? "混合" : t === "truth" ? "真心话" : "大冒险"}
              </button>
            ))}
          </div>
        )}

        {currentPrompt ? (
          <div className={`rounded-lg border ${theme.cardBorder} p-6 text-left bg-black/20 backdrop-blur-[2px] ${theme.cardShadow} card-breathe mt-10`}>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
              {currentPrompt.type === "question" ? "问题" : currentPrompt.type === "truth" ? "真心话" : "大冒险"}
            </div>
            <div className="text-lg leading-relaxed whitespace-pre-wrap">{currentPrompt.text}</div>

            <div className="mt-6 text-xs opacity-70">{isPro ? "已解锁全部问题" : "体验版（最多 10 条/分类）"}</div>
          </div>
        ) : (
          <div className="rounded-lg border p-6 opacity-70 mt-10">暂无可用条目</div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          {!isPro && (
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-full border ${theme.borderAccent} text-sm ${theme.hoverAccentBg} ${theme.shadowAccent}`}
            >
              解锁全部
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={limitReached}
            className={`px-4 py-2 rounded-full text-sm border ${theme.borderAccent} ${limitReached ? "opacity-50 cursor-not-allowed" : `${theme.hoverAccentBg} ${theme.shadowAccent}`}`}
          >
            下一个
          </button>
        </div>
      </div>
    </div>
  );
}


