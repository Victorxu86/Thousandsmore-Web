"use client";

import Ably from "ably/promises";

export type ChatClient = {
  ably: Ably.Realtime;
  channelName: string;
  channel: Ably.Types.RealtimeChannelPromise;
  disconnect: () => Promise<void>;
};

export async function connectChat(code: string): Promise<ChatClient> {
  const authUrl = `/api/chat/token?code=${encodeURIComponent(code)}`;
  const ably = new Ably.Realtime.Promise({
    authUrl,
    transports: ["web_socket", "xhr_streaming", "xhr_polling"],
  });
  // 等待连接，增加 7 秒超时与失败态监听，避免在受限环境中无响应
  await Promise.race([
    new Promise<void>((resolve, reject) => {
      ably.connection.once("connected", () => resolve());
      ably.connection.once("failed", () => reject(new Error("failed")));
      ably.connection.once("suspended", () => reject(new Error("suspended")));
    }),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error("timeout")), 7000)),
  ]).catch(async (err) => {
    try { await ably.close(); } catch {}
    throw err;
  });
  // 取回 token 接口返回的频道名（可通过首条 http 获取），这里简化：客户端再 fetch 一次拿 channel
  const metaRes = await fetch(authUrl);
  const meta = await metaRes.json();
  if (!metaRes.ok) throw new Error(meta.error || "auth failed");
  const channelName: string = meta.channel;
  const channel = ably.channels.get(channelName);
  return {
    ably,
    channelName,
    channel,
    disconnect: async () => {
      try { await channel.presence.leave(); } catch {}
      await ably.close();
    },
  };
}

export function genRoomCode(len = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}


