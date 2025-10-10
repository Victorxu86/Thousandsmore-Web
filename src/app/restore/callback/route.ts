import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { ENTITLEMENT_COOKIE, signEntitlement, type EntitlementScope } from "@/lib/token";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/restore?error=missing_code", req.url));

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/restore?error=${encodeURIComponent(error.message)}`, req.url));

  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (!email) return NextResponse.redirect(new URL(`/restore?error=no_email`, req.url));

  // 查询是否已解锁（按 scope）
  const { data } = await supabase.from("entitlements").select("unlocked,scope").eq("email", email).eq("unlocked", true);
  const unlocked = Array.isArray(data) && data.length > 0;
  if (!unlocked) {
    // 未找到购买记录，跳到定价提示
    return NextResponse.redirect(new URL(`/pricing?restore=not_found`, req.url));
  }

  // 下发 httpOnly 签名 Cookie，7 天有效
  const rows = Array.isArray(data) ? (data as Array<{ scope: EntitlementScope }>) : [];
  const scopes: EntitlementScope[] = rows.map((r) => r.scope);
  const preferredScope: EntitlementScope =
    scopes.includes("all")
      ? "all"
      : scopes.includes("dating")
      ? "dating"
      : scopes.includes("party")
      ? "party"
      : scopes.includes("intimacy")
      ? "intimacy"
      : "all";
  const token = signEntitlement({ email, scope: preferredScope, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 });
  const res = NextResponse.redirect(new URL(`/?restore=ok`, req.url));
  res.cookies.set(ENTITLEMENT_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7*24*3600 });
  return res;
}


