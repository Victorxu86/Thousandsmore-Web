import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { categories, getCategoryById, FREE_LIMIT_PER_CATEGORY } from "@/data/prompts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  if (!categoryId || !getCategoryById(categoryId)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ?? null;

  let isPro = false;
  if (email) {
    // 简化：按邮箱查询权益（与 webhook 中的 upsert 保持一致字段）
    const { data } = await supabase.from("entitlements").select("unlocked").eq("email", email).limit(1);
    isPro = !!(data && data[0]?.unlocked);
  }

  const category = categories[categoryId as keyof typeof categories];
  const items = isPro ? category.prompts : category.prompts.slice(0, FREE_LIMIT_PER_CATEGORY);
  return NextResponse.json({ isPro, items });
}


