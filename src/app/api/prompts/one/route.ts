import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const lang = (searchParams.get("lang") === "en" ? "en" : "zh");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("prompts")
    .select("id, type, text, text_en")
    .eq("id", id)
    .eq("is_published", true)
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = data && data[0];
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const text = lang === "en" ? (row.text_en || row.text || "") : (row.text || "");
  return NextResponse.json({ id: row.id, type: row.type, text });
}


