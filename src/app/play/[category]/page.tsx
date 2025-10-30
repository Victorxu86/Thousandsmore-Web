"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categories, getCategoryById, getPromptsByType } from "@/data";
import { getRandomPrompt } from "@/data/prompts";
import type { Prompt, PromptType } from "@/data/types";
import { useLang, setLang } from "@/lib/lang";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { RealtimePostgresInsertPayload, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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
  const [remoteItems, setRemoteItems] = useState<Array<{ id: string; type: PromptType; text: string; topic?: string | null }>>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false);
  const [room, setRoom] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }
  const lang = useLang();

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
  // 房间辅助：创建/结束/复制链接
  async function createRoom() {
    if (!category) return;
    const res = await fetch(`/api/chat/room`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ category_id: category.id, lang }) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || '创建失败'); return; }
    const url = new URL(window.location.href);
    url.searchParams.set('room', data.id);
    window.history.replaceState(null, '', url.toString());
    setRoom(data.id);
    try { await navigator.clipboard.writeText(url.toString()); showToast(lang==='en'?'Room created & link copied':'已创建并复制邀请链接'); } catch { showToast(lang==='en'?'Room created':'已创建'); }
  }
  async function endRoom() {
    const room = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : null;
    if (!room) return;
    const res = await fetch(`/api/chat/room`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room_id: room }) });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || '结束失败'); return; }
    showToast(lang==='en'?'Room ended':'房间已结束');
    // 清理 URL 与本地状态
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState(null, '', url.toString());
    setRoom(null);
  }
  function copyLink() {
    const url = new URL(window.location.href);
    const hasRoom = !!url.searchParams.get('room');
    if (!hasRoom) { showToast(lang==='en'?'No room yet. Create first.':'尚未创建房间'); return; }
    navigator.clipboard.writeText(url.toString());
    showToast(lang==='en'?'Link copied':'已复制链接');
  }

  // 首次渲染完成标记，避免 SSR/CSR 切换闪烁
  useEffect(() => {
    setHydrated(true);
    try { if (typeof window !== 'undefined') setRoom(new URLSearchParams(window.location.search).get('room')); } catch {}
  }, []);

  // 激情页一次性年龄确认（sessionStorage）
  useEffect(() => {
    if (category?.id !== "intimacy") {
      setAgeConfirmed(true);
      return;
    }
    let ok = false;
    try { ok = sessionStorage.getItem("intimacy_age_ok") === "1"; } catch {}
    setAgeConfirmed(ok);
  }, [category?.id]);

  // 预置主题，避免进入时“晚一拍”出现
  const defaultTopics = useMemo(() => {
    // 与数据库当前 topic 值保持一致（中文键），避免与接口返回合并时重复
    const map: Record<string, string[]> = {
      dating: ["了解", "升温", "哲学"],
      intimacy: ["轻松", "热情", "极限"],
      party: ["破冰", "八卦", "找乐子"],
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
      const q = new URLSearchParams({ category: category.id, lang });
      if (room) q.set('room', room);
      if (activeTopics.size > 0) q.set("topics", Array.from(activeTopics).join(","));
      const res = await fetch(`/api/prompts?${q.toString()}`);
      const data = await res.json();
      setIsPro(!!data.isPro);
      const items = Array.isArray(data.items) ? data.items : [];
      setRemoteItems(items as Array<{ id: string; type: PromptType; text: string; topic?: string | null }>);
      // 切题视为活跃：ping 房间，防止10分钟自动结束
      if (room) {
        fetch('/api/chat/room/ping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room_id: room }) });
        // 若房间存在，拉取当前房间选中题目；若为空则以首题作为默认并写回房间
        try {
          const rr = await fetch(`/api/chat/room?room_id=${encodeURIComponent(room)}`);
          const rj = await rr.json();
          const pid = rj?.current_prompt_id as (string | null | undefined);
          const collection = (items as Array<{id:string; type: PromptType; text:string; topic?:string|null}>);
          if (pid) {
            const hit = collection.find(x=>x.id===pid);
            if (hit) {
              const p: Prompt = { id: hit.id, text: hit.text, type: hit.type };
              setCurrentPrompt(p);
              setSeenPromptIds(new Set([p.id]));
            }
          } else if (collection.length > 0) {
            const first = collection[0];
            const p: Prompt = { id: first.id, text: first.text, type: first.type };
            setCurrentPrompt(p);
            setSeenPromptIds(new Set([p.id]));
            fetch('/api/chat/room', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room_id: room, current_prompt_id: first.id }) });
          }
        } catch {}
      }
    }
    fetchItems();
  }, [category, activeTopics, lang, room]);

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
    // 房间会话由房间状态决定题目，不进行本地随机
    if (room) return;
    const source = remoteItems.length > 0 ? remoteItems : getPromptsByType(category, typeFilter);
    const filtered = typeFilter === "all" ? source : source.filter((p) => p.type === typeFilter);
    const next = getRandomPrompt(filtered as Prompt[], undefined);
    setCurrentPrompt(next || null);
    setSeenPromptIds(new Set(next ? [next.id] : []));
    setPromptReady(true);
  }, [category, typeFilter, remoteItems, room]);

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

  const prompts = ((): Prompt[] => {
    const source = remoteItems.length > 0 ? remoteItems : getPromptsByType(category, typeFilter);
    return (typeFilter === "all" ? source : source.filter((p) => p.type === typeFilter)) as Prompt[];
  })();
  const limitReached = false; // 由后端控制返回数量，这里不再本地限制

  function handleNext() {
    if (limitReached) return;
    const next = getRandomPrompt(prompts, seenPromptIds);
    if (next) {
      const newSeen = new Set(seenPromptIds);
      newSeen.add(next.id);
      setSeenPromptIds(newSeen);
      setCurrentPrompt(next);
      // 同步到房间
      if (room) {
        fetch('/api/chat/room', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room_id: room, current_prompt_id: next.id }) });
      }
    }
  }

  function handleUpgrade() {
    window.location.href = "/pricing";
  }

  // 内容就绪（不含年龄确认）
  const contentReady = hydrated && (topics.length > 0) && promptReady;
  // 容器可见（内容就绪，或者激情页需要显示弹窗）
  const containerVisible = contentReady || (category.id === "intimacy" && hydrated);

  return (
    <div className={`min-h-screen p-4 sm:p-6 flex flex-col items-center gap-6 transition-opacity duration-300 ${containerVisible ? "opacity-100" : "opacity-0"}`}>
      {/* 背景遮罩：内容未就绪 → 实色；激情未确认 → 磨砂 */}
      {!contentReady && category.id !== "intimacy" && (
        <div className="fixed inset-0 bg-background" />
      )}
      {category.id === "intimacy" && hydrated && !ageConfirmed && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md" />
      )}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <Link href="/?noIntro=1" className={`group inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent} transition`}>
          <span className={`inline-block w-0 h-0 border-t-4 border-b-4 border-r-6 border-t-transparent border-b-transparent ${theme.arrowColor}`}></span>
          <span className={`${theme.textAccent} group-hover:text-white`}>{lang === "en" ? "Back" : "返回"}</span>
        </Link>
        <div className="flex-1" />
        {allowedTypes.length > 1 && (
          <div className="relative">
            {(() => {
              const options = ["all", "truth", "dare"] as const;
              const current: "all" | "truth" | "dare" =
                typeFilter === "truth" || typeFilter === "dare" ? typeFilter : "all";
              const idx = Math.max(0, options.indexOf(current));
              const thumbBg = category.id === "party" ? "bg-yellow-500/70" : category.id === "intimacy" ? "bg-rose-600/70" : "bg-purple-600/70";
              const selectedText = category.id === "party" ? "text-black" : "text-white";
              return (
                <div className={`relative grid grid-cols-3 rounded-full border ${theme.borderAccent} bg-black/30 backdrop-blur-sm p-0.5`} style={{ width: 220 }}>
                  <div
                    className={`absolute inset-y-0 rounded-full transition-transform duration-200 ease-out ${thumbBg} shadow-[0_1px_6px_rgba(0,0,0,0.25)]`}
                    style={{ width: "33.3333%", transform: `translateX(${idx * 100}%)` }}
                  />
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTypeFilter(opt === "all" ? "all" : opt)}
                      className={`relative z-10 px-2.5 py-1 text-xs whitespace-nowrap transition-colors cursor-pointer ${typeFilter === opt ? `${selectedText} font-medium` : `${theme.textAccent} opacity-80 hover:opacity-100`}`}
                    >
                      {opt === "all" ? (lang === "en" ? "Mixed" : "混合") : opt === "truth" ? (lang === "en" ? "Truth" : "真心话") : (lang === "en" ? "Dare" : "大冒险")}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        <div className="ml-3 flex items-center gap-2">
          <button onClick={createRoom} className={`px-3 py-1.5 rounded-full border ${theme.borderAccent} text-xs ${theme.hoverAccentBg}`}>{lang==='en'?'Invite Friends':'邀请朋友'}</button>
          <button onClick={copyLink} className={`px-3 py-1.5 rounded-full border ${theme.borderAccent} text-xs ${theme.hoverAccentBg}`}>{lang==='en'?'Copy Link':'复制链接'}</button>
          <button onClick={endRoom} className={`px-3 py-1.5 rounded-full border ${theme.borderAccent} text-xs ${theme.hoverAccentBg}`}>{lang==='en'?'End':'结束房间'}</button>
        </div>
      </div>

      <div className="w-full max-w-2xl text-center mt-10">
        <h1 className={`text-2xl font-semibold mb-2 ${theme.textAccent}`}>
          {category.id === "party" ? (lang === "en" ? "Party" : "酒桌") : category.id === "intimacy" ? (lang === "en" ? "Intimacy" : "激情") : (lang === "en" ? "Deeptalk" : "Deeptalk")}
        </h1>

        {/* 激情页年龄确认弹窗 */}
        {category.id === "intimacy" && hydrated && !ageConfirmed && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="modal-pop w-[92%] max-w-md rounded-xl border border-rose-600/60 bg-black/85 text-white p-5 shadow-[0_10px_40px_rgba(225,29,72,.35)]">
              <h2 className="text-lg font-semibold mb-2">{lang === "en" ? "Before you enter" : "进入前的确认"}</h2>
              <p className="text-sm opacity-80 leading-6">
                {lang === "en" ? "This page contains adult/sensitive content. For consenting adults only." : "本页面包含成人与敏感内容。仅限成年人在自愿、合规、尊重边界的前提下使用。"}
              </p>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => (window.location.href = "/?noIntro=1")}
                  className="px-3 py-2 rounded-full text-sm border border-rose-600/60 hover:bg-rose-600/10"
                >
                  {lang === "en" ? "Home" : "返回首页"}
                </button>
                <button
                  onClick={() => { try { sessionStorage.setItem("intimacy_age_ok", "1"); } catch {}; setAgeConfirmed(true); }}
                  className="px-4 py-2 rounded-full text-sm bg-rose-600 text-white hover:brightness-110"
                >
                  {lang === "en" ? "I am an adult, continue" : "我已成年，继续"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 主题筛选：可视化 pill，默认“全部”；下移排版 */}
        {topics.length > 0 && (
          <div className="mt-6 mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTopics(new Set())}
              className={`px-3 py-1.5 rounded-full border text-sm ${activeTopics.size === 0 ? theme.selectedPill : `${theme.borderAccent} ${theme.textAccent} ${theme.hoverAccentBg}`}`}
            >
              {lang === "en" ? "All" : "全部"}
            </button>
            {topics.map((t) => {
              // 兼容老的英文键与当前中文键，双向映射
              const label =
                t === 'warmup' || t === '了解' ? '了解' :
                t === 'connection' || t === '升温' ? '升温' :
                t === 'deep' || t === '哲学' ? '哲学' :
                t === 'icebreaker' || t === '破冰' ? '破冰' :
                t === 'truth_chat' || t === '八卦' ? '八卦' :
                t === 'dare_fun' || t === '找乐子' ? '找乐子' :
                t === 'truth_basic' || t === '轻松' ? '轻松' :
                t === 'dare_soft' || t === '热情' ? '热情' :
                t === 'boundaries' || t === '极限' ? '极限' : t;
              const labelEn =
                t === 'warmup' || t === '了解' ? 'Knowing' :
                t === 'connection' || t === '升温' ? 'Heat Up' :
                t === 'deep' || t === '哲学' ? 'Philosophy' :
                t === 'icebreaker' || t === '破冰' ? 'Icebreaker' :
                t === 'truth_chat' || t === '八卦' ? 'Gossip' :
                t === 'dare_fun' || t === '找乐子' ? 'Fun' :
                t === 'truth_basic' || t === '轻松' ? 'Easy' :
                t === 'dare_soft' || t === '热情' ? 'Passion' :
                t === 'boundaries' || t === '极限' ? 'Extreme' : String(t);
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
                  {lang === 'en' ? labelEn : label}
                </button>
              );
            })}
          </div>
        )}

        {/* 顶部已提供分段滑动控件，这里移除中部切换 */}

        {currentPrompt ? (
          <div className={`rounded-lg border ${theme.cardBorder} p-6 text-left bg-black/20 backdrop-blur-[2px] ${theme.cardShadow} card-breathe mt-10`}>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
              {currentPrompt.type === "question" ? (lang === "en" ? "Question" : "问题") : currentPrompt.type === "truth" ? (lang === "en" ? "Truth" : "真心话") : (lang === "en" ? "Dare" : "大冒险")}
            </div>
            <div className="text-lg leading-relaxed whitespace-pre-wrap">{currentPrompt.text}</div>

            <div className="mt-6 text-xs opacity-70">{isPro ? (lang === "en" ? "All questions unlocked" : "已解锁全部问题") : (lang === "en" ? "Trial (max 10 per category)" : "体验版（最多 10 条/分类）")}</div>
          </div>
        ) : (
          <div className="rounded-lg border p-6 opacity-70 mt-10">{lang === "en" ? "No items available" : "暂无可用条目"}</div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          {!isPro && (
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-full border ${theme.borderAccent} text-sm ${theme.hoverAccentBg} ${theme.shadowAccent}`}
            >
              {lang === "en" ? "Unlock All" : "解锁全部"}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={limitReached}
            className={`px-4 py-2 rounded-full text-sm border ${theme.borderAccent} ${limitReached ? "opacity-50 cursor-not-allowed" : `${theme.hoverAccentBg} ${theme.shadowAccent}`}`}
          >
            {lang === "en" ? "Next" : "下一个"}
          </button>
        </div>
        {/* Toast */}
        {toast && (
          <div className="fixed inset-x-0 bottom-20 flex justify-center pointer-events-none">
            <div className="pointer-events-auto rounded-full border border-purple-500/60 bg-black/85 text-white text-sm px-4 py-2 shadow-[0_6px_20px_rgba(168,85,247,.25)]">
              {toast}
            </div>
          </div>
        )}
        {/* 底部聊天面板：黑+紫主题，固定中下区域 */}
        {(() => {
          // 简化：使用内联组件以减少文件改动
          function ChatBox() {
            const [loaded, setLoaded] = useState(false);
            const [items, setItems] = useState<Array<{ id: string; user_id: string; nickname?: string; text: string; created_at: string }>>([]);
            const [myId, setMyId] = useState<string>("");
            const roomParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : null;
            const initialNick = (() => {
              try {
                const r = roomParam; if (!r) return "";
                return sessionStorage.getItem(`chat_nick_${r}`) || "";
              } catch { return ""; }
            })();
            const initialNeedNick = (() => {
              try {
                const r = roomParam; if (!r) return true;
                return sessionStorage.getItem(`chat_nick_set_${r}`) === '1' ? false : true;
              } catch { return true; }
            })();
            const [nick, setNick] = useState<string>(initialNick);
            const [needNick, setNeedNick] = useState<boolean>(initialNeedNick);
            const [input, setInput] = useState("");
            const promptId = currentPrompt?.id || null;
            useEffect(() => {
              if (!room) return;
              // 生成临时用户ID
              let uid = "";
              try { uid = sessionStorage.getItem("chat_uid") || ""; } catch {}
              if (!uid) { uid = Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem("chat_uid", uid); } catch {} }
              setMyId(uid);
              // 载入最近消息
              (async () => {
                const qs = new URLSearchParams({ room, limit: "50" });
                if (promptId) qs.set("prompt", promptId);
                const res = await fetch(`/api/chat/messages?${qs.toString()}`);
                const data = await res.json();
                setItems(Array.isArray(data.items) ? data.items : []);
                setLoaded(true);
              })();
              // 实时订阅
              const supa = getSupabaseBrowser();
              type ChatRow = { room_id: string; user_id: string; text: string; prompt_id?: string | null; nickname?: string | null; created_at: string };
              const channel = supa.channel(`room:${room}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room}` }, (payload: RealtimePostgresInsertPayload<ChatRow>) => {
                  const r = payload.new;
                  if (promptId && r.prompt_id && r.prompt_id !== promptId) return;
                  setItems((prev) => [...prev, { id: Math.random().toString(36), user_id: r.user_id, nickname: r.nickname || undefined, text: r.text, created_at: r.created_at }]);
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_rooms', filter: `id=eq.${room}` }, async (payload: RealtimePostgresChangesPayload<{ current_prompt_id?: string|null }>) => {
                  const pid = (payload.new as { current_prompt_id?: string|null } | null)?.current_prompt_id ?? null;
                  if (!pid) return;
                  const collection: Array<{ id: string; type: PromptType; text: string }> =
                    (remoteItems.length ? remoteItems.map(({id,type,text})=>({id,type,text})) : prompts.map(({id,type,text})=>({id,type,text})));
                  let hit = collection.find(x=>x.id===pid);
                  if (!hit) {
                    try {
                      const r = await fetch(`/api/prompts/one?id=${encodeURIComponent(pid)}&lang=${lang}`);
                      const pj = await r.json();
                      if (r.ok && pj?.id) {
                        hit = { id: pj.id, text: pj.text, type: pj.type };
                      }
                    } catch {}
                  }
                  if (hit) {
                    const p: Prompt = { id: hit.id, text: hit.text, type: hit.type };
                    setCurrentPrompt(p);
                    setSeenPromptIds(new Set([p.id]));
                  }
                })
                .subscribe();
              return () => { try { supa.removeChannel(channel); } catch {} };
            }, [room, promptId]);

            // 不再在切题时重置昵称；房间仅在首次进入时由 initialNeedNick 控制是否弹窗
            async function send() {
              if (!room || !myId || !input.trim()) return;
              if (!nick.trim()) { showToast(lang==='en'? 'Please set a nickname' : '请先设置昵称'); return; }
              if (!promptId) { showToast(lang==='en'? 'Please wait for the question to load' : '请等待题目加载完成'); return; }
              const payload = { room_id: room, user_id: myId, nickname: nick || null, prompt_id: promptId, text: input.trim() };
              const res = await fetch(`/api/chat/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
              const data = await res.json();
              if (!res.ok) {
                showToast(data.error || '发送失败');
                return;
              }
              setItems((prev) => [...prev, { id: Math.random().toString(36), user_id: myId, nickname: nick || undefined, text: input.trim(), created_at: new Date().toISOString() }]);
              setInput("");
            }
            // 轮询兜底（Realtime 未生效时也能看到对方）
            useEffect(() => {
              if (!room) return;
              const t = setInterval(async () => {
                const qs = new URLSearchParams({ room, limit: "50" });
                if (promptId) qs.set("prompt", String(promptId));
                const res = await fetch(`/api/chat/messages?${qs.toString()}`);
                const data = await res.json();
                if (Array.isArray(data.items)) setItems(data.items);
              }, 4000);
              return () => clearInterval(t);
            }, [room, promptId]);
            // 输入时 ping，防止超时结束
            useEffect(() => {
              if (!room) return;
              if (!input) return;
              const t = setTimeout(() => {
                fetch('/api/chat/room/ping', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ room_id: room }) });
              }, 800);
              return () => clearTimeout(t);
            }, [room, input]);

            // 轮询房间当前题目作为兜底（Realtime 失败时也能同步），每2秒对比不同则切换
            useEffect(() => {
              if (!room) return;
              const t = setInterval(async () => {
                try {
                  const rr = await fetch(`/api/chat/room?room_id=${encodeURIComponent(room)}`);
                  const rj = await rr.json();
                  const pid: string | null = rj?.current_prompt_id ?? null;
                  if (!pid) return;
                  const collection: Array<{ id: string; type: PromptType; text: string }> =
                    (remoteItems.length ? remoteItems.map(({id,type,text})=>({id,type,text})) : prompts.map(({id,type,text})=>({id,type,text})));
                  if (currentPrompt?.id === pid) return;
                  const hit = collection.find(x=>x.id===pid);
                  if (hit) {
                    const p: Prompt = { id: hit.id, text: hit.text, type: hit.type };
                    setCurrentPrompt(p);
                    setSeenPromptIds(new Set([p.id]));
                  }
                } catch {}
              }, 2000);
              return () => clearInterval(t);
            }, [room, remoteItems, currentPrompt?.id, prompts]);
            return (
              <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none">
                <div className="pointer-events-auto w-[92%] max-w-2xl rounded-xl border border-purple-500/60 bg-black/80 backdrop-blur-md shadow-[0_10px_30px_rgba(168,85,247,.25)] p-3">
                  {needNick && (
                    <div className="fixed inset-x-0 z-50 bottom-28 flex items-center justify-center">
                      <div className="w-[92%] max-w-sm rounded-xl border border-purple-500/60 bg-black/90 text-white p-5 shadow-[0_10px_40px_rgba(168,85,247,.35)]">
                        <h2 className="text-lg font-semibold mb-2">{lang==='en'?'Set your nickname':'请输入昵称'}</h2>
                        <p className="text-sm opacity-80 mb-3">{lang==='en'?'This will be shown to your partner in this room only.':'只用于当前房间展示，不会被保存。'}</p>
                        <div className="flex items-center gap-2">
                          <input autoFocus value={nick} onChange={(e)=>setNick(e.target.value)} placeholder={lang==='en'?'Nickname':'昵称'} className="flex-1 px-3 py-2 rounded border border-purple-500/60 bg-black/60 text-sm text-white placeholder:text-white/40" />
                          <button onClick={()=>{ if(nick.trim()){ setNeedNick(false); try { sessionStorage.setItem(`chat_nick_set_${room}`,'1'); sessionStorage.setItem(`chat_nick_${room}`, nick.trim()); } catch {} } }} className="px-3 py-2 rounded bg-purple-600 text-white text-sm hover:brightness-110 disabled:opacity-50" disabled={!nick.trim()}>{lang==='en'?'Confirm':'确定'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-purple-200/80 mb-2 flex items-center justify-between">
                    <span>{lang === 'en' ? 'Chat' : '聊天'} {room ? `#${room}` : ''}</span>
                    {!room && <span className="opacity-70">{lang === 'en' ? 'Create a chat to start' : '创建房间后开始聊天'}</span>}
                  </div>
                  <div className="max-h-48 overflow-auto space-y-2 pr-1">
                    {items.map((m, i) => (
                      <div key={m.id + i} className={`text-sm ${m.user_id === myId ? 'text-purple-200' : 'text-white/90'}`}>
                        <span className="opacity-70 mr-2">{m.nickname || (m.user_id === myId ? (lang==='en'?'Me':'我') : 'Guest')}</span>
                        <span>{m.text}</span>
                      </div>
                    ))}
                    {loaded && items.length === 0 && (
                      <div className="text-sm opacity-70">{lang==='en'?'No messages yet':'还没有消息'}</div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} placeholder={lang==='en'?'Type a message':'输入消息'} className="flex-1 px-3 py-2 rounded border border-purple-500/60 bg-black/60 text-sm text-white placeholder:text-white/40" />
                    <button onClick={send} disabled={!nick.trim() || !promptId} className="px-3 py-2 rounded bg-purple-600 text-white text-sm hover:brightness-110 disabled:opacity-50">{lang==='en'?'Send':'发送'}</button>
                  </div>
                </div>
              </div>
            );
          }
          return room ? <ChatBox /> : null;
        })()}
      </div>
    </div>
  );
}


