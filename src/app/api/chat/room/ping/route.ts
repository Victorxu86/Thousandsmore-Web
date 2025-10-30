import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const roomId = String(body?.room_id || "");
    if (!roomId) return NextResponse.json({ error: "missing room" }, { status: 400 });
    const { data, error } = await supabase.from("chat_rooms").select("id,last_active_at,ended_at").eq("id", roomId).limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const room = data && data[0];
    if (!room) return NextResponse.json({ error: "room not found" }, { status: 404 });
  const now = Date.now();
  const lastActive = room.last_active_at ? Date.parse(String(room.last_active_at)) : 0;
    const idleTooLong = lastActive && (now - lastActive > 30 * 60 * 1000);
    if (room.ended_at || idleTooLong) {
      if (!room.ended_at && idleTooLong) {
        await supabase.from("chat_rooms").update({ ended_at: new Date().toISOString() }).eq("id", roomId);
      }
      return NextResponse.json({ ok: false, ended: true });
    }
    await supabase.from("chat_rooms").update({ last_active_at: new Date().toISOString() }).eq("id", roomId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


