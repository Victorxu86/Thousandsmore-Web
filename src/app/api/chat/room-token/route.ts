import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabaseServer";

type RoomTokenPayload = {
  code: string;
  category: string;
  pro: boolean;
  exp: number; // epoch ms
};

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function sign(payload: RoomTokenPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const { code, category } = await req.json();
    const codeStr = String(code || "").trim();
    const categoryId = String(category || "").trim();
    if (!codeStr || !categoryId) return NextResponse.json({ error: "missing code/category" }, { status: 400 });

    // 判定房主是否 Pro（all 或该分类）
    const supabase = await getSupabaseServer();
    const { data: user } = await supabase.auth.getUser();
    const email = user.user?.email ?? null;
    let hostPro = false;
    if (email) {
      const { data } = await supabase
        .from("entitlements")
        .select("unlocked,scope")
        .eq("email", email)
        .in("scope", ["all", categoryId])
        .order("scope")
        .limit(1);
      hostPro = !!(data && data[0]?.unlocked);
    }

    const secret = getEnv("CHAT_ROOM_SECRET");
    const payload: RoomTokenPayload = { code: codeStr, category: categoryId, pro: hostPro, exp: Date.now() + 30 * 60 * 1000 };
    const token = sign(payload, secret);
    return NextResponse.json({ token, pro: hostPro, exp: payload.exp });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


