import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ENTITLEMENT_COOKIE, verifyEntitlement } from "@/lib/token";

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 });
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const metadata = (session.metadata ?? {}) as Record<string, string>;
    const token = metadata.tm_token as string | undefined;
    const payload = verifyEntitlement(token);
    if (!payload) return NextResponse.json({ error: "invalid token" }, { status: 400 });
    const res = NextResponse.json({ ok: true, email: payload.email });
    res.cookies.set(ENTITLEMENT_COOKIE, token!, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7*24*3600 });
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "claim error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


