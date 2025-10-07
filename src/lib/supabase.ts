import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase public envs");
  return createBrowserClient(url, anon);
}

export async function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase public envs");
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      // @supabase/ssr 的 CookieMethodsServer 只要求 getAll（setAll 可选）
      getAll() {
        const all = cookieStore.getAll();
        return all?.map((c) => ({ name: c.name, value: c.value })) ?? [];
      },
    },
  });
}


