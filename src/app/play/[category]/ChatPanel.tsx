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
};

type ChatMsg = { id: string; sender: string; text: string; ts: number };

export default function ChatPanel({ theme, currentQuestionId }: Props) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [code, setCode] = useState("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const quotaMax = 5;

  const clientRef = useRef<Awaited<ReturnType<typeof connectChat>> | null>(null);
  const me = useMemo(() => `u_${Math.random().toString(36).slice(2, 8)}`, []);

  useEffect(() => {
    // 切题重置配额与消息区，但保持连接
    setMessages([]);
    setQuotaUsed(0);
  }, [currentQuestionId]);

  async function handleInvite() {
    const c = genRoomCode(6);
    setInviteCode(c);
    setCode(c);
  }

  async function handleJoin() {
    if (!code) return;
    setConnecting(true);
    try {
      const client = await connectChat(code);
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
      setConnected(true);
    } catch (e) {
      console.error(e);
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
        <div className="flex items-center gap-2">
          <input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} placeholder="输入房间码" className={`rounded-full border px-3 py-2 text-sm ${theme.borderAccent}`} />
          <button onClick={handleJoin} disabled={connecting || connected} className={`px-3 py-2 rounded-full border text-sm ${theme.borderAccent} ${theme.hoverAccentBg} ${theme.shadowAccent}`}>{connected?"已加入":"加入对话"}</button>
        </div>
      </div>

      {inviteCode && (
        <div className={`mt-2 text-center text-sm opacity-80`}>房间码：<span className="font-mono tracking-wider">{inviteCode}</span>（复制给朋友）</div>
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
    </div>
  );
}


