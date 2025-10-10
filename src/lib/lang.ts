"use client";

export type Lang = "zh" | "en";
const KEY = "tm_lang";

export function getLang(): Lang {
  try {
    const v = localStorage.getItem(KEY) as Lang | null;
    if (v === "en" || v === "zh") return v;
  } catch {}
  return "zh";
}

export function setLang(lang: Lang) {
  try { localStorage.setItem(KEY, lang); } catch {}
  try { window.dispatchEvent(new CustomEvent("tm_lang_change", { detail: lang } as any)); } catch {}
}

import { useEffect, useState } from "react";
export function useLang(): Lang {
  const [lang, set] = useState<Lang>("zh");
  useEffect(() => {
    set(getLang());
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as Lang | undefined;
      if (d === "en" || d === "zh") set(d);
      else set(getLang());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) set(getLang());
    };
    window.addEventListener("tm_lang_change", onChange as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tm_lang_change", onChange as any);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return lang;
}


