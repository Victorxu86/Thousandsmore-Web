"use client";

import Ably from "ably/promises";

export type ChatClient = {
  ably: Ably.Realtime;
  channelName: string;
  channel: Ably.Types.RealtimeChannelPromise;
  disconnect: () => Promise<void>;
};

export async function connectChat(code: string, forcedTransport?: "xhr_polling" | "web_socket" | "auto"): Promise<ChatClient> {
  const authUrl = `/api/chat/token?code=${encodeURIComponent(code)}`;

  async function connectWith(options: Ably.Types.ClientOptions, timeoutMs: number): Promise<Ably.Realtime> {
    const client = new Ably.Realtime.Promise(options);
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        client.connection.once("connected", () => resolve());
        client.connection.once("failed", () => reject(new Error("failed")));
        // 不把 suspended 当作最终失败，给网络切换留余地
      }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]).catch(async (err) => {
      try { await client.close(); } catch {}
      throw err;
    });
    return client;
  }

  // 选择传输策略
  let ably: Ably.Realtime;
  if (forcedTransport === "web_socket") {
    ably = await connectWith({ authUrl, transports: ["web_socket"], tls: true }, 8000);
  } else if (forcedTransport === "xhr_polling") {
    ably = await connectWith({ authUrl, transports: ["xhr_polling"], tls: true }, 10000);
  } else {
    // auto：先 polling 再综合
    try {
      ably = await connectWith({ authUrl, transports: ["xhr_polling"], tls: true }, 8000);
    } catch (e1) {
      ably = await connectWith({ authUrl, transports: ["web_socket", "xhr_streaming", "xhr_polling"], tls: true }, 12000);
    }
  }

  // 取回频道名
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


