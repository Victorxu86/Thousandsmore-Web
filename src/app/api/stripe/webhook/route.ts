import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email || session.customer_email || null;
        if (email) {
          const supabase = getSupabaseAdmin();
          // 找用户（按 email）
          const { data: users, error: userErr } = await supabase
            .from("profiles")
            .select("id, email")
            .eq("email", email)
            .limit(1);

          let userId: string | null = null;
          if (!userErr && users && users.length > 0) {
            userId = users[0].id as string;
          }

          // 如果没有自建 profiles，可仅记录邮箱为外键字段（简化实现）
          // 开通权益（以邮箱为键）
          const { error: entErr } = await supabase
            .from("entitlements")
            .upsert({
              email,
              scope: "all",
              unlocked: true,
            }, { onConflict: "email" });

          // 记录购买
          await supabase.from("purchases").insert({
            email,
            stripe_checkout_session_id: session.id,
            status: session.status ?? "completed",
          });

          if (entErr) {
            console.warn("Entitlement upsert error", entErr);
          }
        }
        break;
      }
      default: {
        // 其他事件暂不处理
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


