import { NextRequest, NextResponse } from "next/server";
import Ably from "ably/promises";
import crypto from "crypto";

function deriveChannel(code: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret).update(code).digest("hex");
  return `tm:chat:${h.slice(0, 40)}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").trim();
    const sinceMs = Number(url.searchParams.get("since") || 0);
    const key = process.env.ABLY_API_KEY;
    const secret = process.env.CHAT_ROOM_SECRET;
    if (!key || !secret) return NextResponse.json({ error: "missing env" }, { status: 500 });
    if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });
    const channel = deriveChannel(code, secret);
    const rest = new Ably.Rest(key);
    const ch = rest.channels.get(channel);
    const params: Ably.Types.PaginatedResultParams = {};
    if (sinceMs > 0) params.start = new Date(sinceMs).toISOString();
    params.direction = 'forwards';
    const page = await ch.history(params);
    const items = (page.items || []).map((m) => ({ name: m.name, data: m.data, ts: m.timestamp }));
    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


