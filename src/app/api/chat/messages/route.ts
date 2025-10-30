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

    // 房间状态检查与自动过期（10 分钟无活动）
    {
      const { data: rooms, error: rerr } = await supabase
        .from("chat_rooms").select("id,last_active_at,ended_at").eq("id", roomId).limit(1);
      if (rerr) return NextResponse.json({ error: rerr.message }, { status: 500 });
      const room = rooms && rooms[0];
      if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });
      const now = Date.now();
      const lastActive = room.last_active_at ? Date.parse(String(room.last_active_at)) : 0;
      const ended = !!room.ended_at;
      const idleTooLong = lastActive && (now - lastActive > 10 * 60 * 1000);
      if (ended || idleTooLong) {
        if (!ended && idleTooLong) {
          await supabase.from("chat_rooms").update({ ended_at: new Date().toISOString() }).eq("id", roomId);
        }
        return NextResponse.json({ error: "room ended" }, { status: 410 });
      }
    }

    // 每题每人最多 5 句、总 10 句限制
    if (promptId) {
      const { count: userCount, error: c1 } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId)
        .eq("prompt_id", promptId)
        .eq("user_id", userId);
      if (c1) return NextResponse.json({ error: c1.message }, { status: 500 });
      if ((userCount ?? 0) >= 5) return NextResponse.json({ error: "per-user limit reached" }, { status: 429 });

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
    // 更新活跃时间
    await supabase.from("chat_rooms").update({ last_active_at: new Date().toISOString() }).eq("id", roomId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


