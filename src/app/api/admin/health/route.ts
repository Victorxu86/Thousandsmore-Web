import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const env = {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  try {
    const supabase = getSupabaseAdmin();
    // 统计 prompts 数量，验证连接与权限
    const { count, error } = await supabase
      .from("prompts")
      .select("id", { count: "exact", head: true });
    if (error) return NextResponse.json({ env, db: { ok: false, error: error.message } }, { status: 500 });

    // 探测 text_en 列是否存在
    const probe = await supabase.from("prompts").select("id,text_en").limit(1);
    const textEnOk = !probe.error || !/column .*text_en.* does not exist/i.test(probe.error.message);

    return NextResponse.json({ env, db: { ok: true, promptsCount: count ?? null, textEnColumn: textEnOk } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ env, error: msg }, { status: 500 });
  }
}


