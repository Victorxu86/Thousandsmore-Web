import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { ENTITLEMENT_COOKIE, signEntitlement } from "@/lib/token";

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

  // 查询是否已解锁
  const { data } = await supabase.from("entitlements").select("unlocked").eq("email", email).limit(1);
  const unlocked = !!(data && data[0]?.unlocked);
  if (!unlocked) {
    // 未找到购买记录，跳到定价提示
    return NextResponse.redirect(new URL(`/pricing?restore=not_found`, req.url));
  }

  // 下发 httpOnly 签名 Cookie，7 天有效
  const token = signEntitlement({ email, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 });
  const res = NextResponse.redirect(new URL(`/?restore=ok`, req.url));
  res.cookies.set(ENTITLEMENT_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7*24*3600 });
  return res;
}


