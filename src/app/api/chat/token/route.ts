import { NextRequest, NextResponse } from "next/server";
import Ably from "ably/promises";
import crypto from "crypto";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function deriveChannel(code: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret).update(code).digest("hex");
  // 限制频道字符集，避免特殊符号
  return `tm:chat:${h.slice(0, 40)}`; // 40位足够防碰撞
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || "").trim();
    if (!code || code.length < 4) {
      return NextResponse.json({ error: "invalid code" }, { status: 400 });
    }
    const apiKey = getEnv("ABLY_API_KEY");
    const roomSecret = getEnv("CHAT_ROOM_SECRET");
    const channel = deriveChannel(code, roomSecret);

    const rest = new Ably.Rest(apiKey);
    // 仅允许该频道的 publish/subscribe/presence
    const capability = JSON.stringify({ [channel]: ["publish", "subscribe", "presence"] });
    const tokenRequest = await rest.auth.createTokenRequest({
      ttl: 30 * 60 * 1000, // 30 分钟
      capability,
      clientId: `web:${Math.random().toString(36).slice(2, 10)}`,
    });

    return NextResponse.json({ tokenRequest, channel });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


