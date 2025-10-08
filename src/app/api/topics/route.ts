import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getCategoryById } from "@/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  if (!categoryId || !getCategoryById(categoryId)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("prompts")
      .select("topic")
      .eq("category_id", categoryId)
      .eq("is_published", true)
      .not("topic", "is", null)
      .order("topic");
    if (error) throw error;
    const topics = Array.from(new Set((data || []).map((r: { topic: string | null }) => r.topic))).filter(Boolean) as string[];
    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ topics: [] });
  }
}


