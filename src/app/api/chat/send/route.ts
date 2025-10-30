import { NextRequest, NextResponse } from "next/server";
import Ably from "ably/promises";
import crypto from "crypto";

function deriveChannel(code: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret).update(code).digest("hex");
  return `tm:chat:${h.slice(0, 40)}`;
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ABLY_API_KEY;
    const secret = process.env.CHAT_ROOM_SECRET;
    if (!key || !secret) return NextResponse.json({ error: "missing env" }, { status: 500 });
    const body = await req.json();
    const code = String(body?.code || "").trim();
    const name = String(body?.name || "msg");
    const data = body?.data ?? {};
    if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });
    const rest = new Ably.Rest(key);
    const channel = deriveChannel(code, secret);
    await rest.channels.get(channel).publish(name, data);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


