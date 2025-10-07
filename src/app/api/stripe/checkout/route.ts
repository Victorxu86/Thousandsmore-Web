import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.json().catch(() => ({}));

    const priceId = process.env.STRIPE_PRICE_ID || body.priceId || process.env.STRIPE_LOOKUP_KEY;
    if (!priceId) {
      return NextResponse.json({ error: "Missing price configuration" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        process.env.STRIPE_LOOKUP_KEY
          ? { price: undefined as any, quantity: 1, price_data: undefined }
          : { price: priceId as string, quantity: 1 },
      ].filter(Boolean) as any,
      // 如果使用 lookup_key，推荐改为 prices: [{ lookup_key: 'xxx', quantity: 1 }]
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Checkout error" }, { status: 500 });
  }
}


