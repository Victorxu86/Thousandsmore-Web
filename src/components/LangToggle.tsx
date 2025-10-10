"use client";
import Link from "next/link";
import { useLang, setLang } from "@/lib/lang";

export default function LangToggle() {
  const lang = useLang();
  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/pricing" className="hover:underline">{lang === "en" ? "Pricing" : "定价"}</Link>
      <Link href="/restore" className="hover:underline">{lang === "en" ? "Restore" : "恢复购买"}</Link>
      <button onClick={() => setLang(lang === "en" ? "zh" : "en")} className="px-3 py-1 rounded-full border hover:bg-black/5">
        {lang === "en" ? "中 / En" : "中 / En"}
      </button>
    </nav>
  );
}


