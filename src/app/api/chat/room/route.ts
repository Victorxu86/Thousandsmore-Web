import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { ENTITLEMENT_COOKIE, verifyEntitlement } from "@/lib/token";

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const categoryId = (body?.category_id as string) || "dating";
    const roomId = (body?.room_id as string) || Math.random().toString(36).slice(2, 8);
    const joinToken = Math.random().toString(36).slice(2, 10);

    // 识别房主是否有权益（email from auth user 或签名 Cookie）
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email ?? null;
    const token = req.cookies.get(ENTITLEMENT_COOKIE)?.value;
    const payload = verifyEntitlement(token);
    const ownerEmail = email || payload?.email || null;

    const { error } = await supabase.from("chat_rooms").insert({
      id: roomId,
      category_id: categoryId,
      owner_email: ownerEmail,
      join_token: joinToken,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: roomId, joinToken });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // 结束房间
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const roomId = String(body?.room_id || "");
    if (!roomId) return NextResponse.json({ error: "missing room" }, { status: 400 });
    const { error } = await supabase.from("chat_rooms").update({ ended_at: new Date().toISOString() }).eq("id", roomId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


