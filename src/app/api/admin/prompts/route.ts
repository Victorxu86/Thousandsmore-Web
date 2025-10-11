import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/app/api/admin/_utils";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  let q = supabase.from("prompts").select("id,category_id,type,text,text_en,is_published,is_trial,topic").order("category_id").order("id");
  if (category) q = q.eq("category_id", category);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const body = await req.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "no items" }, { status: 400 });
  // 为避免 Postgres 同一批次对同一主键多次 upsert 触发
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"
  // 先按 id 去重，保留最后一个，避免重复主键在一批次中多次命中
  const map = new Map<string, any>();
  for (const it of items) {
    const id = String(it.id || "").trim();
    if (!id) continue;
    map.set(id, { ...map.get(id), ...it, id });
  }
  const uniqueItems = Array.from(map.values());
  const { error } = await supabase.from("prompts").upsert(uniqueItems, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: items.length });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const { error } = await supabase.from("prompts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


