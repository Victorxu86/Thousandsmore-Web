"use client";
import { useEffect, useState } from "react";

type PromptRow = {
  id: string;
  category_id: string;
  type: "question" | "truth" | "dare";
  text: string;
  text_en?: string;
  is_published: boolean;
  is_trial: boolean;
  topic: string | null;
};

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string>("");
  const [items, setItems] = useState<PromptRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [paste, setPaste] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const pageSize = 100;
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("adminToken") || "";
      if (saved) setAdminToken(saved);
    } catch {}
  }, []);

  async function load() {
    setLoading(true); setMessage("");
    try {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      const res = await fetch(`/api/admin/prompts${qs}`, { headers: { "x-admin-token": adminToken } });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
        setPage(0);
        setMessage(`已加载 ${Array.isArray(data.items)?data.items.length:0} 条`);
        try { sessionStorage.setItem("adminToken", adminToken); } catch {}
      } else {
        setMessage(data.error || "加载失败");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessage(msg || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  function normalizeType(value: string): PromptRow["type"] {
    if (value === "truth" || value === "dare" || value === "question") return value;
    return "question";
  }

  function parsePaste(text: string): PromptRow[] {
    // 支持粘贴格式（优先推荐 9 列固定模板）：
    // 1) 9列（推荐）：id	category_id	type	text_zh	text_en	is_published	is_trial	topic	操作(忽略)
    // 2) 8列（中英）：id	category_id	type	text_zh	text_en	is_published	is_trial	topic
    // 3) 7列（仅中文）：id	category_id	type	text	is_published	is_trial	topic
    // 4) 4列（英文增量）：id	category_id	type	text_en（仅更新 text_en）
    // 5) 2列（英文增量）：id	text_en（仅更新 text_en）
    const rows = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: PromptRow[] = [];
    for (const line of rows) {
      const useTabs = line.includes("\t");
      const cols = useTabs ? line.split("\t") : line.split(/\s{2,}|,\s?/);
      if (cols.length >= 9) {
        // 9列：最后一列“操作”忽略
        const id = cols[0]?.trim();
        const category_id = cols[1]?.trim();
        const type = cols[2]?.trim();
        const textZh = cols[3] ?? "";
        const textEn = cols[4] ?? "";
        const isPub = (cols[5] ?? "true").toLowerCase() === "true";
        const isTrial = (cols[6] ?? "false").toLowerCase() === "true";
        const topic = (cols[7] ?? "").trim() || null;
        parsed.push({ id, category_id, type: normalizeType(type), text: textZh, text_en: textEn, is_published: isPub, is_trial: isTrial, topic });
        continue;
      }
      if (cols.length >= 8) {
        // 8列：中英双语
        const id = cols[0]?.trim();
        const category_id = cols[1]?.trim();
        const type = cols[2]?.trim();
        const textZh = cols[3] ?? "";
        const textEn = cols[4] ?? "";
        const isPub = (cols[5] ?? "true").toLowerCase() === "true";
        const isTrial = (cols[6] ?? "false").toLowerCase() === "true";
        const topic = (cols[7] ?? "").trim() || null;
        parsed.push({ id, category_id, type: normalizeType(type), text: textZh, text_en: textEn, is_published: isPub, is_trial: isTrial, topic });
        continue;
      }
      if (cols.length === 7) {
        // 7列：仅中文
        const id = cols[0]?.trim();
        const category_id = cols[1]?.trim();
        const type = cols[2]?.trim();
        const textZh = cols[3] ?? "";
        const isPub = (cols[4] ?? "true").toLowerCase() === "true";
        const isTrial = (cols[5] ?? "false").toLowerCase() === "true";
        const topic = (cols[6] ?? "").trim() || null;
        parsed.push({ id, category_id, type: normalizeType(type), text: textZh, text_en: undefined, is_published: isPub, is_trial: isTrial, topic });
        continue;
      }
      if (cols.length === 4) {
        // 4列：英文增量（仅更新 text_en） id, category_id, type, text_en
        const id = cols[0]?.trim();
        const textEn = cols[3] ?? "";
        parsed.push({ id, category_id: cols[1]?.trim() || "", type: normalizeType(cols[2]?.trim() || "question"), text: "", text_en: textEn, is_published: true, is_trial: false, topic: null });
        continue;
      }
      if (cols.length === 2) {
        // 2列：英文增量（仅更新 text_en） id, text_en
        const id = cols[0]?.trim();
        const textEn = cols[1] ?? "";
        parsed.push({ id, category_id: "intimacy", type: "truth", text: "", text_en: textEn, is_published: true, is_trial: false, topic: null });
        continue;
      }
      // 兜底（视为旧格式：id, category, type, text...）
      if (cols.length >= 4) {
        const id = cols[0]?.trim();
        const category_id = cols[1]?.trim();
        const type = cols[2]?.trim();
        const textCol = cols.slice(3).join(" ");
        parsed.push({ id, category_id, type: normalizeType(type), text: textCol, text_en: undefined, is_published: true, is_trial: false, topic: null });
      }
    }
    return parsed;
  }

  async function save() {
    setLoading(true); setMessage("");
    try {
      if (!adminToken) throw new Error("请先输入 Admin Token");
      const payload = { items };
      const res = await fetch(`/api/admin/prompts`, { method: "POST", headers: { "content-type": "application/json", "x-admin-token": adminToken }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setMessage(`已保存 ${data.count} 条`);
      // 保存成功后重新加载，确保界面显示最新总数（>1000 也能完整展示）
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessage(msg || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">题库管理</h1>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
        <input className="rounded border px-3 py-2" placeholder="Admin Token" value={adminToken} onChange={(e) => setAdminToken(e.target.value)} />
        <select className="rounded border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">全部分类</option>
          <option value="dating">朋友</option>
          <option value="party">酒桌</option>
          <option value="intimacy">激情</option>
        </select>
        <button onClick={load} className="px-3 py-2 rounded border hover:bg-black/5">加载</button>
        <button onClick={save} disabled={loading} className="px-3 py-2 rounded border hover:bg-black/5">保存</button>
        <button onClick={async ()=>{
          setLoading(true); setMessage("");
          try {
            if (!adminToken) throw new Error("请先输入 Admin Token");
            const res = await fetch(`/api/admin/health`, { headers: { "x-admin-token": adminToken } });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || data?.db?.error || "检查失败");
            const envMsg = `Env: URL=${data.env?.hasUrl?'OK':'缺失'}, ServiceKey=${data.env?.hasServiceKey?'OK':'缺失'}`;
            const dbMsg = `DB: 连接=${data.db?.ok?'OK':'失败'}，prompts=${data.db?.promptsCount ?? '未知'}，text_en列=${data.db?.textEnColumn?'存在':'缺失'}`;
            setMessage(`${envMsg}；${dbMsg}`);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setMessage(msg || "网络错误");
          } finally {
            setLoading(false);
          }
        }} className="px-3 py-2 rounded border hover:bg-black/5">检查连接</button>
      </div>
      <div className="mb-4 text-sm opacity-80">当前记录数：{items.length} 条</div>

      {message && <div className="mb-4 text-sm opacity-80">{message}</div>}

      <details className="mb-4">
        <summary className="cursor-pointer text-sm">批量粘贴导入（推荐 9 列固定模板）</summary>
        <textarea className="w-full h-28 rounded border p-2 mt-2" placeholder={"id\tcategory_id\ttype\ttext_zh\ttext_en\tis_published\tis_trial\ttopic\t操作(忽略)"} value={paste} onChange={(e) => setPaste(e.target.value)} />
        <div className="mt-2 flex items-center gap-2">
          <button className="px-3 py-2 rounded border hover:bg-black/5" onClick={async () => {
            const parsed = parsePaste(paste);
            if (!parsed.length) return;
            setLoading(true); setMessage("");
            try {
              if (!adminToken) throw new Error("请先输入 Admin Token");
              // 先更新本地列表，便于用户立即看到结果
              setItems((prev) => {
                const byId = new Map<string, PromptRow>();
                for (const it of prev) byId.set(it.id.trim(), it);
                for (const it of parsed) {
                  const id = it.id.trim();
                  const existing = byId.get(id);
                  if (existing) byId.set(id, { ...existing, ...it, id });
                  else byId.set(id, { ...it, id });
                }
                return Array.from(byId.values());
              });
              setMessage(`解析并追加成功（${parsed.length} 条），正在保存到数据库...`);
              // 仅将本次解析出来的条目写入数据库，避免一次提交过大
              const res = await fetch(`/api/admin/prompts`, {
                method: "POST",
                headers: { "content-type": "application/json", "x-admin-token": adminToken },
                body: JSON.stringify({ items: parsed }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "保存失败");
              setMessage(`解析并追加成功（${parsed.length} 条），已保存 ${data.count} 条`);
              // 保存成功后刷新一次，确保与 Supabase 同步（含 >1000 的完整数据）
              await load();
              // 跳到最后一页便于检查新增
              setPage((p)=>{
                const total = (items.length + parsed.length);
                return Math.max(0, Math.floor((total - 1) / pageSize));
              });
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              setMessage(msg || "网络错误");
            } finally {
              setLoading(false);
            }
          }}>解析并追加</button>
          <button className="px-3 py-2 rounded border hover:bg-black/5" onClick={() => setPaste("")}>清空输入</button>
        </div>
      </details>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">分类</th>
              <th className="p-2 text-left">类型</th>
              <th className="p-2 text-left">文本(中文)</th>
              <th className="p-2 text-left">Text (EN)</th>
              <th className="p-2 text-left">发布</th>
              <th className="p-2 text-left">试用</th>
              <th className="p-2 text-left">主题</th>
              <th className="p-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(page * pageSize, page * pageSize + pageSize).map((r, idx) => (
              <tr key={r.id} className="border-t">
                <td className="p-2"><input className="w-36 rounded border px-2 py-1" value={r.id} onChange={(e) => {
                  const v = e.target.value; setItems((prev) => prev.map((x, i) => (i=== (page*pageSize+idx))?{...x,id:v}:x));
                }} /></td>
                <td className="p-2">
                  <select className="rounded border px-2 py-1" value={r.category_id} onChange={(e)=>{
                    const v=e.target.value; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,category_id:v}:x));
                  }}>
                    <option value="dating">dating</option>
                    <option value="party">party</option>
                    <option value="intimacy">intimacy</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="rounded border px-2 py-1" value={r.type} onChange={(e)=>{
                    const v=e.target.value as PromptRow["type"]; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,type:v}:x));
                  }}>
                    <option value="question">question</option>
                    <option value="truth">truth</option>
                    <option value="dare">dare</option>
                  </select>
                </td>
                <td className="p-2"><textarea className="w-full h-16 rounded border px-2 py-1" value={r.text} onChange={(e)=>{
                  const v=e.target.value; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,text:v}:x));
                }} /></td>
                <td className="p-2"><textarea className="w-full h-16 rounded border px-2 py-1" value={r.text_en||""} onChange={(e)=>{
                  const v=e.target.value; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,text_en:v}:x));
                }} /></td>
                <td className="p-2">
                  <input type="checkbox" checked={r.is_published} onChange={(e)=>{
                    const v=e.target.checked; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,is_published:v}:x));
                  }} />
                </td>
                <td className="p-2">
                  <input type="checkbox" checked={r.is_trial} onChange={(e)=>{
                    const v=e.target.checked; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,is_trial:v}:x));
                  }} />
                </td>
                <td className="p-2"><input className="w-28 rounded border px-2 py-1" value={r.topic || ""} onChange={(e)=>{
                  const v=e.target.value || null; setItems((p)=>p.map((x,i)=>i===(page*pageSize+idx)?{...x,topic:v}:x));
                }} /></td>
                <td className="p-2">
                  <button className="px-2 py-1 rounded border hover:bg-black/5" onClick={async ()=>{
                    const id = r.id; setItems((p)=>p.filter((x)=>x.id!==id));
                    await fetch(`/api/admin/prompts?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-token": adminToken }});
                  }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 分页控制 */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        {(() => {
          const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
          return (
            <>
              <button className="px-2 py-1 rounded border hover:bg-black/5" disabled={page<=0} onClick={()=>setPage((p)=>Math.max(0,p-1))}>上一页</button>
              <span>第 {page+1} / {totalPages} 页</span>
              <button className="px-2 py-1 rounded border hover:bg-black/5" disabled={page>=totalPages-1} onClick={()=>setPage((p)=>Math.min(totalPages-1,p+1))}>下一页</button>
            </>
          );
        })()}
      </div>
    </div>
  );
}


