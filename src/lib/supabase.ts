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
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: {
        domain?: string;
        path?: string;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
        maxAge?: number;
      }) {
        cookieStore.set({ name, value, ...(options || {}) });
      },
      remove(name: string, options?: {
        domain?: string;
        path?: string;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
        maxAge?: number;
      }) {
        cookieStore.set({ name, value: "", ...(options || {}), maxAge: 0 });
      },
    },
  });
}


