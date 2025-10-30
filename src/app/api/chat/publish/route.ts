import { NextRequest, NextResponse } from "next/server";
import Ably from "ably/promises";
import crypto from "crypto";
import { requireAdmin } from "@/app/api/admin/_utils";

function deriveChannel(code: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret).update(code).digest("hex");
  return `tm:chat:${h.slice(0, 40)}`;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const code = String(body?.code || "").trim();
    const text = String(body?.text || "ping");
    if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });
    const key = process.env.ABLY_API_KEY;
    const secret = process.env.CHAT_ROOM_SECRET;
    if (!key || !secret) return NextResponse.json({ error: "missing env" }, { status: 500 });
    const channel = deriveChannel(code, secret);
    const rest = new Ably.Rest(key);
    await rest.channels.get(channel).publish("diag", { text, at: Date.now() });
    return NextResponse.json({ ok: true, channel });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


