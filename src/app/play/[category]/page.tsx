"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  categories,
  getCategoryById,
  getPromptsByType,
  getRandomPrompt,
  FREE_LIMIT_PER_CATEGORY,
  type Prompt,
  type PromptType,
} from "@/data/prompts";

type PageProps = {
  params: { category: string };
};

export default function PlayCategoryPage({ params }: PageProps) {
  const category = useMemo(() => getCategoryById(params.category), [params.category]);
  const allowedTypes = category?.allowedTypes ?? ["question"];
  const initialType: PromptType | "all" = allowedTypes.length === 1 ? allowedTypes[0] : "truth";
  const [typeFilter, setTypeFilter] = useState<PromptType | "all">(initialType);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [seenPromptIds, setSeenPromptIds] = useState<Set<string>>(new Set());
  const [isPro, setIsPro] = useState<boolean>(false);
  const [usedCount, setUsedCount] = useState<number>(0);

  useEffect(() => {
    const purchase = window.localStorage.getItem("tm_purchase_status");
    setIsPro(purchase === "pro");
  }, []);

  useEffect(() => {
    if (!category) return;
    const prompts = getPromptsByType(category, typeFilter);
    const next = getRandomPrompt(prompts, undefined);
    setCurrentPrompt(next);
    setSeenPromptIds(new Set(next ? [next.id] : []));
    setUsedCount(1);
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
  const limitReached = !isPro && usedCount >= FREE_LIMIT_PER_CATEGORY;

  function handleNext() {
    if (limitReached) return;
    const next = getRandomPrompt(prompts, seenPromptIds);
    if (next) {
      const newSeen = new Set(seenPromptIds);
      newSeen.add(next.id);
      setSeenPromptIds(newSeen);
      setCurrentPrompt(next);
      setUsedCount((c) => c + 1);
    }
  }

  function handleUpgrade() {
    // 占位：支付集成完成后将跳转到结账
    window.location.href = "/pricing";
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← 返回</Link>
        <div className="text-sm opacity-80">{category.name}</div>
        <div />
      </div>

      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-semibold mb-2">{category.name}</h1>
        <p className="opacity-80 mb-4">{category.description}</p>

        {allowedTypes.length > 1 && (
          <div className="inline-flex rounded border overflow-hidden mb-4">
            {(["truth", "dare"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 text-sm ${typeFilter === t ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
              >
                {t === "truth" ? "真心话" : "大冒险"}
              </button>
            ))}
          </div>
        )}

        {currentPrompt ? (
          <div className="rounded-lg border p-6 text-left bg-background/60">
            <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
              {currentPrompt.type === "question" ? "问题" : currentPrompt.type === "truth" ? "真心话" : "大冒险"}
            </div>
            <div className="text-lg leading-relaxed whitespace-pre-wrap">{currentPrompt.text}</div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs opacity-70">
                {isPro ? "已解锁全部问题" : `体验版已用 ${usedCount}/${FREE_LIMIT_PER_CATEGORY}`}
              </div>
              <div className="flex gap-3">
                {!isPro && (
                  <button
                    onClick={handleUpgrade}
                    className="px-3 py-2 rounded border hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                  >
                    解锁全部
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={limitReached}
                  className={`px-3 py-2 rounded text-sm ${limitReached ? "opacity-50 cursor-not-allowed border" : "border hover:bg-black/5 dark:hover:bg-white/10"}`}
                >
                  下一个
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-6 opacity-70">暂无可用条目</div>
        )}

        {limitReached && (
          <div className="mt-4 text-sm text-red-600">
            体验版已达上限，前往“解锁全部”获取无限次数。
          </div>
        )}
      </div>
    </div>
  );
}


