import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room");
  const promptId = searchParams.get("prompt") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  if (!roomId) return NextResponse.json({ error: "missing room" }, { status: 400 });
  const supabase = await getSupabaseServer();
  let q = supabase.from("chat_messages").select("id,room_id,user_id,nickname,prompt_id,text,created_at").eq("room_id", roomId).order("created_at", { ascending: false }).limit(limit);
  if (promptId) q = q.eq("prompt_id", promptId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data || []).reverse() });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const roomId = String(body?.room_id || "");
    const userId = String(body?.user_id || "").slice(0, 64);
    const nickname = (body?.nickname ? String(body.nickname) : "").slice(0, 32);
    const promptId = body?.prompt_id ? String(body.prompt_id) : null;
    const text = String(body?.text || "").trim();
    if (!roomId || !userId || !text) return NextResponse.json({ error: "missing fields" }, { status: 400 });

    // 每题每人最多 5 句、总 10 句限制
    if (promptId) {
      const { data: userCountData, error: c1 } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId)
        .eq("prompt_id", promptId)
        .eq("user_id", userId);
      if (c1) return NextResponse.json({ error: c1.message }, { status: 500 });
      const userCount = userCountData?.length ? userCountData.length : (userCountData as any);
      if ((userCount as number) >= 5) return NextResponse.json({ error: "per-user limit reached" }, { status: 429 });

      const { count: totalCount, error: c2 } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId)
        .eq("prompt_id", promptId);
      if (c2) return NextResponse.json({ error: c2.message }, { status: 500 });
      if ((totalCount ?? 0) >= 10) return NextResponse.json({ error: "room total limit reached" }, { status: 429 });
    }

    const { error } = await supabase.from("chat_messages").insert({ room_id: roomId, user_id: userId, nickname, prompt_id: promptId, text });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


