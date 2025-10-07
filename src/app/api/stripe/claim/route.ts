import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ENTITLEMENT_COOKIE, verifyEntitlement, signEntitlement } from "@/lib/token";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 });
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const metadata = (session.metadata ?? {}) as Record<string, string>;
    let token = metadata.tm_token as string | undefined;
    let payload = verifyEntitlement(token);

    // 若 webhook 尚未写入 token，则基于 Stripe 会话直签并落库
    if (!payload) {
      const email = session.customer_details?.email || (session as any).customer_email || null;
      const paid = session.payment_status === "paid" || session.status === "complete";
      if (!email || !paid) {
        return NextResponse.json({ error: "session not claimable" }, { status: 400 });
      }
      // 生成并回写 token（可选）
      token = signEntitlement({ email, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 });
      try {
        await stripe.checkout.sessions.update(session.id, { metadata: { ...(metadata || {}), tm_token: token } });
      } catch {}
      // 落库
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from("entitlements")
          .upsert({ email, scope: "all", unlocked: true }, { onConflict: "email" });
        await supabase
          .from("purchases")
          .upsert({ email, stripe_checkout_session_id: session.id, status: session.status ?? "completed" }, { onConflict: "stripe_checkout_session_id" });
      } catch {}
      payload = { email, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 };
    }

    const res = NextResponse.json({ ok: true, email: payload.email });
    res.cookies.set(ENTITLEMENT_COOKIE, token!, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7*24*3600 });
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "claim error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


