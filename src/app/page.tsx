import Link from "next/link";
import { categories } from "@/data/prompts";

export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-12 max-w-4xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thousandsmore</h1>
        <nav className="text-sm flex items-center gap-4">
          <Link href="/pricing" className="hover:underline">定价</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </nav>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-medium mb-2">促进连接的问题与游戏</h2>
        <p className="opacity-80">选择一个板块，点击开始并随机出题；体验版每个板块可游玩 15 次。</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(categories).map((c) => (
          <Link
            key={c.id}
            href={`/play/${c.id}`}
            className="rounded-lg border p-5 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <div className="text-lg font-medium mb-1">{c.name}</div>
            <div className="opacity-80 text-sm mb-3">{c.description}</div>
            <div className="text-xs opacity-70">{c.allowedTypes.join(" / ")}</div>
          </Link>
        ))}
      </section>

      <footer className="mt-12 text-xs opacity-70 leading-6">
        <p>亲密与成人相关内容仅限成年人在自愿、合规、尊重边界的前提下使用。</p>
        <p>© {new Date().getFullYear()} thousandsmore.com</p>
      </footer>
    </div>
  );
}
