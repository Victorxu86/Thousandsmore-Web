import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase public envs");
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        const all = cookieStore.getAll();
        return all?.map((c) => ({ name: c.name, value: c.value })) ?? [];
      },
      setAll(cookiesToSet) {
        for (const c of cookiesToSet) {
          cookieStore.set({ name: c.name, value: c.value, ...(c.options || {}) });
        }
      },
    },
  });
}


