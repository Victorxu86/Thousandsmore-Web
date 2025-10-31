import { NextRequest, NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE, verifyEntitlement, signEntitlement, type EntitlementScope } from "@/lib/token";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || undefined;
  const next = searchParams.get("next") || "/play/deeptalk?restore=ok";
  if (!token) return NextResponse.redirect(new URL("/restore?error=missing_token", req.url));

  const payload = verifyEntitlement(token);
  if (!payload?.email) return NextResponse.redirect(new URL("/restore?error=invalid_token", req.url));
  if (payload.exp && payload.exp * 1000 < Date.now()) return NextResponse.redirect(new URL("/restore?error=expired", req.url));

  const email = payload.email;
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("entitlements").select("unlocked,scope").eq("email", email).eq("unlocked", true);
  if (error) return NextResponse.redirect(new URL(`/restore?error=${encodeURIComponent(error.message)}`, req.url));
  const unlocked = Array.isArray(data) && data.length > 0;
  if (!unlocked) return NextResponse.redirect(new URL("/pricing?restore=not_found", req.url));

  const rows = Array.isArray(data) ? (data as Array<{ scope: EntitlementScope }>) : [];
  const scopes: EntitlementScope[] = rows.map((r) => r.scope);
  const preferredScope: EntitlementScope =
    scopes.includes("all") ? "all" : scopes.includes("dating") ? "dating" : scopes.includes("party") ? "party" : scopes.includes("intimacy") ? "intimacy" : "all";

  const cookieToken = signEntitlement({ email, scope: preferredScope, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 });
  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(ENTITLEMENT_COOKIE, cookieToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7*24*3600 });
  return res;
}


