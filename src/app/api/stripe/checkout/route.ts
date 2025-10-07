import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

type CheckoutRequestBody = {
  priceId?: string;
  lookupKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = (await req.json().catch(() => ({}))) as CheckoutRequestBody;

    // 1) 优先使用固定的 PRICE_ID；2) 其次用 body.priceId；3) 再用 lookup_key（env 或 body）去查询 Price
    let resolvedPriceId: string | null = process.env.STRIPE_PRICE_ID || body.priceId || null;

    if (!resolvedPriceId) {
      const lookupKey = process.env.STRIPE_LOOKUP_KEY || body.lookupKey;
      if (!lookupKey) {
        return NextResponse.json({ error: "Missing price configuration" }, { status: 400 });
      }
      const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
      const price = prices.data[0];
      if (!price) {
        return NextResponse.json({ error: "Price not found for lookup_key" }, { status: 400 });
      }
      resolvedPriceId = price.id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true,
      // 关键：确保收集并绑定邮箱，便于 webhook/恢复
      customer_creation: "always",
      customer_email: undefined,
      ui_mode: "hosted",
    };

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


