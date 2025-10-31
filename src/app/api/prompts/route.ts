import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ENTITLEMENT_COOKIE, verifyEntitlement } from "@/lib/token";
import { categories, getCategoryById } from "@/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  const topicParam = searchParams.get("topics") || searchParams.get("topic");
  const topics = topicParam ? topicParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const lang = (searchParams.get("lang") === "en" ? "en" : "zh");
  const roomId = searchParams.get("room") || undefined;
  if (!categoryId || !getCategoryById(categoryId)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? null;
  // 免登录：校验 httpOnly 签名 Cookie
  const token = req.cookies.get(ENTITLEMENT_COOKIE)?.value;
  const tokenPayload = verifyEntitlement(token);

  let isPro = false;
  if (email) {
    // 简化：按邮箱查询权益（与 webhook 中的 upsert 保持一致字段）
    const { data } = await supabase.from("entitlements").select("unlocked,scope").eq("email", email).in("scope", ["all", categoryId]).order("scope").limit(1);
    isPro = !!(data && data[0]?.unlocked);
  }
  // Cookie 也可解锁
  if (!isPro && tokenPayload?.email) {
    // 校验令牌 scope
    if (tokenPayload.scope === "all" || tokenPayload.scope === categoryId) {
      isPro = true;
    }
  }

  // 房间继承：若提供 roomId，则按房主权益解锁（scope: all 或匹配分类）
  if (!isPro && roomId) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: roomData } = await supabaseAdmin.from("chat_rooms").select("owner_email").eq("id", roomId).limit(1);
    const ownerEmail = roomData && roomData[0]?.owner_email;
    if (ownerEmail) {
      const { data } = await supabaseAdmin
        .from("entitlements")
        .select("unlocked,scope")
        .eq("email", ownerEmail)
        .in("scope", ["all", categoryId])
        .order("scope")
        .limit(1);
      isPro = !!(data && data[0]?.unlocked);
    }
  }

  // 从数据库读取，非 Pro 仅返回 trial 题目
  try {
    const supabase = await getSupabaseServer();
    if (!isPro) {
      let query = supabase
        .from("prompts")
        .select("id, text, text_en, type, topic")
        .eq("category_id", categoryId)
        .eq("is_published", true)
        .eq("is_trial", true);
      if (topics.length > 0) query = query.in("topic", topics);
      const { data, error } = await query.order("id");
      if (error) throw error;
      type DbRow = { id: string; type: "question"|"truth"|"dare"; topic: string|null; text: string|null; text_en: string|null };
      const rows: DbRow[] = Array.isArray(data) ? (data as DbRow[]) : [];
      const items = rows.map((r) => ({ id: r.id, type: r.type, topic: r.topic, text: lang === "en" ? (r.text_en || r.text || "") : (r.text || "") }));
      return NextResponse.json({ isPro, items });
    }
    let proQuery = supabase
      .from("prompts")
      .select("id, text, text_en, type, topic")
      .eq("category_id", categoryId)
      .eq("is_published", true);
    if (topics.length > 0) proQuery = proQuery.in("topic", topics);
    const { data, error } = await proQuery.order("id");
    if (error) throw error;
    type DbRow = { id: string; type: "question"|"truth"|"dare"; topic: string|null; text: string|null; text_en: string|null };
    const rows: DbRow[] = Array.isArray(data) ? (data as DbRow[]) : [];
    const items = rows.map((r) => ({ id: r.id, type: r.type, topic: r.topic, text: lang === "en" ? (r.text_en || r.text || "") : (r.text || "") }));
    return NextResponse.json({ isPro, items });
  } catch {
    // 回退到内置题库，确保不因 DB 故障影响体验
    const category = categories[categoryId as keyof typeof categories];
    // 内置题库未携带 topic 字段，这里忽略 topic 过滤
    const all = category.prompts;
    const items = all;
    return NextResponse.json({ isPro, items, fallback: true });
  }
}


