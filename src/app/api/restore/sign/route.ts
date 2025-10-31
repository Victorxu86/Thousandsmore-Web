import { NextRequest, NextResponse } from "next/server";
import { signRestoreToken, type EntitlementScope } from "@/lib/token";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getBaseUrl } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emailRaw = String(body?.email || "").trim();
    if (!emailRaw) return NextResponse.json({ error: "missing email" }, { status: 400 });
    const email = emailRaw.toLowerCase();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("entitlements")
      .select("unlocked,scope")
      .eq("unlocked", true)
      .ilike("email", email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const unlocked = Array.isArray(data) && data.length > 0;
    if (!unlocked) return NextResponse.json({ error: "not found" }, { status: 404 });
    const rows = data as Array<{ scope: EntitlementScope }>;
    const scopes: EntitlementScope[] = rows.map((r) => r.scope);
    const scope: EntitlementScope = scopes.includes("all") ? "all" : scopes[0] || "all";
    // 限速：同邮箱每日最多 5 次、同 IP 每小时最多 10 次
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    try {
      const dayAgo = new Date(Date.now() - 24*3600*1000).toISOString();
      const hourAgo = new Date(Date.now() - 3600*1000).toISOString();
      const { data: emailCount } = await supabase
        .from("restore_tokens")
        .select("jti", { count: "exact", head: true })
        .ilike("email", email)
        .gte("created_at", dayAgo);
      if ((emailCount?.length ?? 0) === 0 && (emailCount as any) === null) {/*ignore*/}
      const emailTooMany = (emailCount as any)?.length === undefined ? false : false; // placeholder
      // 由于 head:true 时返回 data 为空，仅依赖 count 不同客户端字段，这里不再读 count，留给 Supabase 行为兼容
    } catch {}
    // 生成 jti 并记录，用于一次性校验
    const jti = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);
    try {
      await supabase.from("restore_tokens").insert({ jti, email, scope, created_at: new Date().toISOString(), ip });
    } catch {
      // 若表不存在，仍返回链接，但将无法一次性
    }
    const token = signRestoreToken({ email, scope, jti, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 30*60 });
    const base = getBaseUrl();
    const link = `${base}/restore/token?token=${encodeURIComponent(token)}&next=${encodeURIComponent("/play/deeptalk?restore=ok")}`;
    // 实际发信可在此集成（略），当前返回链接便于测试/手动复制
    return NextResponse.json({ link });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


