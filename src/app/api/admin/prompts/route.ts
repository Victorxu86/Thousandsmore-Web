import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/app/api/admin/_utils";

type PromptType = "question" | "truth" | "dare";
type PromptRow = {
  id: string;
  category_id: string;
  type: PromptType;
  text: string;
  text_en?: string | null;
  is_published: boolean;
  is_trial: boolean;
  topic: string | null;
};

type MinimalItem = {
  id: string;
  category_id?: string;
  type?: PromptType;
  text?: string;
  text_en?: string | null;
  is_published?: boolean;
  is_trial?: boolean;
  topic?: string | null;
};

type ExistingRow = {
  id: string;
  category_id: string;
  type: PromptType;
  text: string;
  is_published: boolean;
  is_trial: boolean;
  topic: string | null;
};

type PromptUpsert = {
  id: string;
  category_id: string;
  type: PromptType;
  text: string;
  text_en?: string | null;
  is_published?: boolean;
  is_trial?: boolean;
  topic?: string | null;
};

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  // PostgREST 默认每请求最多返回 ~1000 行，这里分页抓取直至取完
  const PAGE_SIZE = 1000;
  const items: PromptRow[] = [];
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
    const rows = (data || []) as PromptRow[];
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
  const body = (await req.json()) as { items?: MinimalItem[] };
  const items: MinimalItem[] = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "no items" }, { status: 400 });
  // 为避免 Postgres 同一批次对同一主键多次 upsert 触发
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"
  // 先按 id 去重，保留最后一个，避免重复主键在一批次中多次命中
  const map = new Map<string, MinimalItem>();
  for (const it of items) {
    const id = String(it.id || "").trim();
    if (!id) continue;
    map.set(id, { ...map.get(id), ...it, id });
  }
  const uniqueItems: MinimalItem[] = Array.from(map.values());

  // 填充仅含 id+text_en 的记录的必要字段（从现有库读取），避免 FK 报错
  const toFill = uniqueItems.filter((x) => !x.category_id || !x.type);
  if (toFill.length > 0) {
    const ids = toFill.map((x) => x.id);
    const { data: existing, error: qerr } = await supabase
      .from("prompts")
      .select("id, category_id, type, text, is_published, is_trial, topic")
      .in("id", ids);
    if (qerr) return NextResponse.json({ error: qerr.message }, { status: 500 });
    const exMap = new Map<string, ExistingRow>();
    for (const r of (existing || []) as ExistingRow[]) exMap.set(r.id, r);
    const prepared: Array<PromptUpsert | null> = uniqueItems.map((x) => {
      if (x.category_id && x.type) {
        return {
          id: x.id,
          category_id: x.category_id,
          type: x.type,
          text: x.text ?? "",
          text_en: x.text_en ?? null,
          is_published: x.is_published ?? true,
          is_trial: x.is_trial ?? false,
          topic: x.topic ?? null,
        } satisfies PromptUpsert;
      }
      const ex = exMap.get(x.id);
      if (!ex) return null; // 不存在的 id 且缺字段，跳过该条
      return {
        id: x.id,
        category_id: ex.category_id,
        type: ex.type,
        text: x.text ?? ex.text,
        text_en: x.text_en ?? null,
        is_published: x.is_published ?? ex.is_published,
        is_trial: x.is_trial ?? ex.is_trial,
        topic: x.topic ?? ex.topic,
      } satisfies PromptUpsert;
    });
    const filtered = prepared.filter((v): v is PromptUpsert => v !== null);
    // 用补全后的集合替换为最终要 upsert 的集合
    const BATCH_SIZE = 1000;
    for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
      const chunk = filtered.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("prompts").upsert(chunk, { onConflict: "id" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: filtered.length });
  }

  // 如果无需补全，直接将 uniqueItems 规范化后分批 upsert
  const normalized: PromptUpsert[] = uniqueItems.map((x) => ({
    id: x.id,
    category_id: x.category_id!,
    type: x.type!,
    text: x.text ?? "",
    text_en: x.text_en ?? null,
    is_published: x.is_published ?? true,
    is_trial: x.is_trial ?? false,
    topic: x.topic ?? null,
  }));
  const BATCH_SIZE = 1000;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const chunk = normalized.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("prompts").upsert(chunk, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: normalized.length });
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


