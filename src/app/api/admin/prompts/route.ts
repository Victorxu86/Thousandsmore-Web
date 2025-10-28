import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/app/api/admin/_utils";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  // PostgREST 默认每请求最多返回 ~1000 行，这里分页抓取直至取完
  const PAGE_SIZE = 1000;
  const items: any[] = [];
  let page = 0;
  // 循环分页读取，直到本页数量小于 PAGE_SIZE
  // 注意：每次都重建查询构造器，避免链式状态污染
  while (true) {
    let q = supabase
      .from("prompts")
      .select("id,category_id,type,text,text_en,is_published,is_trial,topic")
      .order("category_id")
      .order("id")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (category) q = q.eq("category_id", category);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = data || [];
    items.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    page += 1;
  }
  return NextResponse.json({ items });
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
  let uniqueItems = Array.from(map.values());

  // 填充仅含 id+text_en 的记录的必要字段（从现有库读取），避免 FK 报错
  const toFill = uniqueItems.filter((x) => !x.category_id || !x.type);
  if (toFill.length > 0) {
    const ids = toFill.map((x) => x.id);
    const { data: existing, error: qerr } = await supabase
      .from("prompts")
      .select("id, category_id, type, text, is_published, is_trial, topic")
      .in("id", ids);
    if (qerr) return NextResponse.json({ error: qerr.message }, { status: 500 });
    const exMap = new Map<string, any>();
    for (const r of existing || []) exMap.set(r.id, r);
    uniqueItems = uniqueItems.map((x) => {
      if (x.category_id && x.type) return x;
      const ex = exMap.get(x.id);
      if (!ex) {
        // 不存在的 id 且缺字段，跳过该条，避免违反外键
        return null as any;
      }
      return {
        ...ex,
        ...x,
        id: x.id,
        category_id: ex.category_id,
        type: ex.type,
      };
    }).filter(Boolean);
  }

  // Supabase/PostgREST 对每次写入也存在单请求行数和负载大小限制
  // 分批 upsert，避免超过 ~1000 行导致部分未写入
  const BATCH_SIZE = 1000;
  for (let i = 0; i < uniqueItems.length; i += BATCH_SIZE) {
    const chunk = uniqueItems.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("prompts").upsert(chunk, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: uniqueItems.length });
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


