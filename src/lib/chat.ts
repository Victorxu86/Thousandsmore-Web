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
  const ably = new Ably.Realtime.Promise({ authUrl });
  await ably.connection.once("connected");
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


