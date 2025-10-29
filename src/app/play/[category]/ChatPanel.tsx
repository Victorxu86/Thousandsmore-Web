"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PromptType } from "@/data/types";
import { connectChat, genRoomCode } from "@/lib/chat";

type Props = {
  theme: {
    textAccent: string;
    borderAccent: string;
    hoverAccentBg: string;
    shadowAccent: string;
  };
  currentQuestionId: string | null;
  categoryId: string;
  onRoomToken?: (token: string | null) => void;
};

type ChatMsg = { id: string; sender: string; text: string; ts: number };

export default function ChatPanel({ theme, currentQuestionId, categoryId, onRoomToken }: Props) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [directLink, setDirectLink] = useState<string>("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const quotaMax = 5;
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [waitingStatus, setWaitingStatus] = useState<"idle"|"waiting"|"joined">("idle");
  const [joinError, setJoinError] = useState<string>("");
  const [inviteUntil, setInviteUntil] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [roomToken, setRoomToken] = useState<string | null>(null);

  const clientRef = useRef<Awaited<ReturnType<typeof connectChat>> | null>(null);
  const me = useMemo(() => `u_${Math.random().toString(36).slice(2, 8)}`, []);

  useEffect(() => {
    // 切题重置配额与消息区，但保持连接
    setMessages([]);
    setQuotaUsed(0);
  }, [currentQuestionId]);

  // 倒计时刷新
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // 直达链接自动加入（?code=XXXX）
  useEffect(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      const auto = (usp.get("code") || "").toUpperCase();
      if (auto && !connected && !connecting) {
        setCode(auto);
        setShowJoin(false);
        void handleJoin(auto, true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInvite() {
    // 若30分钟有效期内：复用同一房间码与直达链接，仅打开弹窗
    if (inviteCode && inviteUntil > Date.now()) {
      setShowInvite(true);
      return;
    }

    const c = genRoomCode(6);
    setInviteCode(c);
    setCode(c);
    try {
      const link = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(c)}`;
      setDirectLink(link);
    } catch { setDirectLink(""); }
    setShowInvite(true);
    setWaitingStatus("waiting");
    setInviteUntil(Date.now() + 30*60*1000);
    // 邀请方立即连接并监听对方加入
    setConnecting(true);
    try {
      const client = await connectChat(c);
      clientRef.current = client;
      try { await client.channel.presence.enter({ me }); } catch {}
      await client.channel.presence.subscribe("enter", (m) => {
        if (m.clientId && m.clientId !== client.ably.auth.clientId) {
          setWaitingStatus("joined");
          // 2 秒后关闭弹窗
          setTimeout(() => { setShowInvite(false); }, 2000);
        }
      });
      setConnected(true);
      // 订阅消息/typing（邀请方也要）
      await client.channel.subscribe("msg", (m) => {
        const data = m.data as { id: string; sender: string; text: string; ts: number; q?: string };
        if (currentQuestionId && data.q && data.q !== currentQuestionId) return;
        setMessages((prev) => [...prev, { id: data.id, sender: data.sender, text: data.text, ts: data.ts }]);
      });
      await client.channel.subscribe("typing", (m) => {
        const data = m.data as { sender: string; typing: boolean };
        if (data.sender === me) return;
        setPeerTyping(!!data.typing);
        if (data.typing) setTimeout(() => setPeerTyping(false), 3000);
      });
      // 请求房间令牌（按房主解锁状态）并广播给对方
      try {
        const res = await fetch(`/api/chat/room-token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: c, category: categoryId }) });
        const data = await res.json();
        if (res.ok && data.token) {
          setRoomToken(data.token);
          onRoomToken && onRoomToken(data.token);
          await client.channel.publish("room_token", { token: data.token });
        }
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  }

  async function handleJoin(c?: string, silent?: boolean) {
    const joinCode = (c || code).trim();
    if (!joinCode) return;
    setConnecting(true);
    try {
      const client = await connectChat(joinCode);
      // 限制 2 人：进入 presence 前检查当前在线人数
      try {
        await client.channel.attach();
        const members = await client.channel.presence.get();
        if ((members?.length || 0) >= 2) {
          await client.ably.close();
          setJoinError("房间已满（最多 2 人）");
          setShowJoin(true); // 显示错误
          return;
        }
      } catch {}
      clientRef.current = client;
      // presence 加入
      try { await client.channel.presence.enter({ me }); } catch {}
      // 订阅消息
      await client.channel.subscribe("msg", (m) => {
        const data = m.data as { id: string; sender: string; text: string; ts: number; q?: string };
        // 题目隔离（仅显示当前题目的消息）
        if (currentQuestionId && data.q && data.q !== currentQuestionId) return;
        setMessages((prev) => [...prev, { id: data.id, sender: data.sender, text: data.text, ts: data.ts }]);
      });
      // typing 指示
      await client.channel.subscribe("typing", (m) => {
        const data = m.data as { sender: string; typing: boolean };
        if (data.sender === me) return;
        setPeerTyping(!!data.typing);
        if (data.typing) {
          setTimeout(() => setPeerTyping(false), 3000);
        }
      });
      // 接收房间令牌（由房主下发）
      await client.channel.subscribe("room_token", (m) => {
        const data = m.data as { token?: string };
        if (data?.token) {
          setRoomToken(data.token);
          onRoomToken && onRoomToken(data.token);
        }
      });
      setConnected(true);
      if (!silent) setShowJoin(false);
    } catch (e) {
      console.error(e);
      setJoinError("加入失败，请稍后再试");
      setShowJoin(true);
    } finally {
      setConnecting(false);
    }
  }

  async function send() {
    const client = clientRef.current;
    if (!client || !input.trim() || quotaUsed >= quotaMax) return;
    const msg: ChatMsg = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, sender: me, text: input.trim(), ts: Date.now() };
    await client.channel.publish("msg", { ...msg, q: currentQuestionId || null });
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setQuotaUsed((n) => n + 1);
  }

  async function onTyping(v: string) {
    setInput(v);
    const client = clientRef.current;
    if (!client) return;
    if (!typing) {
      setTyping(true);
      try { await client.channel.publish("typing", { sender: me, typing: true }); } catch {}
      setTimeout(async () => {
        setTyping(false);
        try { await client.channel.publish("typing", { sender: me, typing: false }); } catch {}
      }, 1500);
    }
  }

  return (
    <div className="w-full max-w-2xl mt-6">
      {/* 邀请/加入控制条 */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        <button onClick={handleInvite} className={`px-3 py-2 rounded-full border text-sm ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent}`}>邀请朋友</button>
        <button onClick={()=>{ setJoinError(""); setShowJoin(true); }} disabled={connecting || connected} className={`px-3 py-2 rounded-full border text-sm ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent}`}>{connected?"已加入":"加入对话"}</button>
        {connected && (
          <button onClick={async ()=>{
            const client = clientRef.current;
            if (client) { try { await client.disconnect(); } catch {} }
            clientRef.current = null;
            setConnected(false);
            setMessages([]);
            setQuotaUsed(0);
            setInviteCode("");
            setDirectLink("");
            setCode("");
            setShowInvite(false);
            setShowJoin(false);
            setTyping(false);
            setPeerTyping(false);
            setWaitingStatus("idle");
            setRoomToken(null);
            onRoomToken && onRoomToken(null);
          }} className={`px-3 py-2 rounded-full border text-sm ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent}`}>退出并清空</button>
        )}
      </div>

      {/* 加入对话弹窗 */}
      {showJoin && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={()=>setShowJoin(false)} />
          <div className={`relative z-10 w-[92%] max-w-md rounded-xl border ${theme.borderAccent} bg-black/85 text-white p-5 ${theme.shadowAccent}`}>
            <h2 className="text-lg font-semibold mb-3">加入对话</h2>
            <input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} placeholder="输入房间码" className={`w-full rounded-lg border px-3 py-2 text-sm bg-black/40 ${theme.borderAccent}`} />
            {joinError && <div className="mt-2 text-sm text-rose-400">{joinError}</div>}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button onClick={()=>setShowJoin(false)} className={`px-3 py-2 rounded-full text-sm border ${theme.borderAccent} ${theme.hoverAccentBg}`}>取消</button>
              <button onClick={()=>handleJoin()} disabled={connecting || !code} className={`px-4 py-2 rounded-full text-sm bg-purple-600 text-white hover:brightness-110`}>加入</button>
            </div>
          </div>
        </div>
      )}

      {/* 聊天面板 */}
      {connected && (
        <div className={`mt-4 rounded-lg border ${theme.borderAccent} bg-black/30 p-3`}> 
          <div className="h-48 overflow-y-auto space-y-2 pr-1">
            {messages.map((m)=> (
              <div key={m.id} className={`text-sm ${m.sender===me?"text-right":"text-left"}`}>
                <span className={`inline-block px-3 py-1.5 rounded-lg border ${theme.borderAccent} ${theme.hoverAccentBg}`}>{m.text}</span>
              </div>
            ))}
            {peerTyping && <div className="text-xs opacity-70">对方正在输入…</div>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input value={input} onChange={(e)=>onTyping(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} placeholder={quotaUsed>=quotaMax?"已达本题上限":"输入消息…"} disabled={quotaUsed>=quotaMax} className={`flex-1 rounded-full border px-3 py-2 text-sm ${theme.borderAccent}`} />
            <button onClick={send} disabled={quotaUsed>=quotaMax || !input.trim()} className={`px-3 py-2 rounded-full border text-sm ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent}`}>发送</button>
          </div>
          <div className="mt-1 text-right text-xs opacity-70">{quotaUsed}/{quotaMax} 条/题</div>
        </div>
      )}

      {/* 邀请弹窗（参考激情页样式），点击外部关闭但保留底部固定条 */}
      {showInvite && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={()=>setShowInvite(false)} />
          <div className={`relative z-10 w-[92%] max-w-md rounded-xl border ${theme.borderAccent} bg-black/85 text-white p-5 ${theme.shadowAccent}`}>
            <h2 className="text-lg font-semibold mb-2">邀请朋友加入</h2>
            <div className="text-sm opacity-80 mb-3">将房间码或直达链接发给对方，进入页面后输入即可加入。</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs opacity-70">房间码</span>
                <div className="flex-1 font-mono tracking-wider text-base">{inviteCode}</div>
                <button onClick={()=>{ try { navigator.clipboard.writeText(inviteCode); } catch {} }} className={`px-2 py-1 rounded-full border text-xs ${theme.borderAccent} ${theme.hoverAccentBg}`}>复制</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs opacity-70">直达链接</span>
                <div className="flex-1 truncate text-xs">{directLink}</div>
                <button onClick={()=>{ try { navigator.clipboard.writeText(directLink); } catch {} }} className={`px-2 py-1 rounded-full border text-xs ${theme.borderAccent} ${theme.hoverAccentBg}`}>复制</button>
              </div>
            </div>
            <div className="mt-4 h-10 flex items-center justify-center">
              {waitingStatus === "waiting" && <div className="text-sm opacity-80 animate-pulse">等待加入中...</div>}
              {waitingStatus === "joined" && <div className="text-sm text-green-400">对方已加入</div>}
            </div>
            <div className="mt-2 text-xs opacity-70 leading-5">提示：每题每人最多可发送 5 条消息。邀请码/链接有效期 30 分钟。</div>
          </div>
        </div>
      )}

      {/* 底部固定邀请条（30 分钟显示） */}
      {inviteCode && inviteUntil > nowMs && !showInvite && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md rounded-full border ${theme.borderAccent} bg-black/80 text-white px-3 py-2 flex items-center gap-2 ${theme.shadowAccent}`}>
          <span className="text-xs opacity-80">房间码</span>
          <span className="font-mono tracking-wider">{inviteCode}</span>
          <button onClick={()=>{ try { navigator.clipboard.writeText(inviteCode); } catch {} }} className={`ml-1 px-2 py-1 rounded-full border text-xs ${theme.borderAccent} ${theme.hoverAccentBg}`}>复制</button>
          <div className="flex-1" />
          {directLink && (
            <button onClick={()=>{ try { navigator.clipboard.writeText(directLink); } catch {} }} className={`mr-2 px-2 py-1 rounded-full border text-xs ${theme.borderAccent} ${theme.hoverAccentBg}`}>复制链接</button>
          )}
          <span className="text-xs opacity-70">{Math.max(0, Math.ceil((inviteUntil - nowMs)/60000))}m</span>
        </div>
      )}
    </div>
  );
}


