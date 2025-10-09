import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { signEntitlement } from "@/lib/token";

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
          // 简化：仅按邮箱落库权益与购买记录
          // scope: 读取 session.metadata.scope（all/dating/party/intimacy），默认 all
          const scope = (session.metadata?.scope as ("all"|"dating"|"party"|"intimacy")) || "all";
          // 开通权益（以邮箱+scope 为键）
          const { error: entErr } = await supabase
            .from("entitlements")
            .upsert({
              email,
              scope,
              unlocked: true,
            }, { onConflict: "email,scope" });

          // 记录购买
          await supabase.from("purchases").insert({
            email,
            stripe_checkout_session_id: session.id,
            status: session.status ?? "completed",
          });

          if (entErr) {
            console.warn("Entitlement upsert error", entErr);
          }

          // 生成短期签名（用于免登录认领），有效期 7 天
          const token = signEntitlement({ email, scope, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 7*24*3600 });
          // 将 token 放到 session metadata（可选），供成功页认领
          try {
            await stripe.checkout.sessions.update(session.id, { metadata: { tm_token: token } });
          } catch {}
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


