import { NextRequest, NextResponse } from "next/server";
import { signEntitlement, type EntitlementScope } from "@/lib/token";
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
    const token = signEntitlement({ email, scope, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 30*60 });
    const base = getBaseUrl();
    const link = `${base}/restore/token?token=${encodeURIComponent(token)}&next=${encodeURIComponent("/play/deeptalk?restore=ok")}`;
    // 实际发信可在此集成（略），当前返回链接便于测试/手动复制
    return NextResponse.json({ link });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


