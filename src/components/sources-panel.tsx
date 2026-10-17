import { useState } from "react";
import { Link2, FileText, Trash2, Loader2, ChevronDown, Lightbulb, ListChecks, BookOpenText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Notebook } from "@/lib/aulaplus";
import { fetchSource } from "@/lib/fetch-source.functions";
import { readStudyFile } from "@/lib/file-reader";
import { digestSource } from "@/lib/tutor";

const md = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

export function SourcesPanel({ notebook: n, update }: { notebook: Notebook; update: (n: Notebook) => void }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const sources = n.sources ?? [];
  const add = (title: string, kind: "link" | "texto" | "archivo", body: string, link?: string) => {
    const d = digestSource(body);
    const id = crypto.randomUUID();
    update({
      ...n,
      notes: `${n.notes ? n.notes + "\n\n" : ""}📎 ${title}\n${body}`,
      sources: [...sources, { id, title, kind, ...(link ? { url: link } : {}), ...d }],
    });
    setOpen(id);
    toast.success(`Fuente añadida: ${title}`, { description: `${d.points.length} puntos clave y ${d.ideas.length} ideas principales extraídas.` });
  };
  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!/^https?:\/\/\S+\.\S+/.test(url.trim())) { toast.error("Pega un enlace válido (https://…)"); return; }
    setBusy(true);
    try {
      const r = await fetchSource({ data: { url: url.trim() } });
      if (!r.ok || !r.text) toast.error(r.error || "No encontré texto en ese enlace");
      else { add(r.title, "link", r.text, url.trim()); setUrl(""); }
    } catch { toast.error("No se pudo leer ese enlace"); }
    setBusy(false);
  }
  return (
    <div className="sources-panel">
      <h2>Fuentes del cuaderno</h2>
      <p className="subtitle">Milo lee estas fuentes, extrae lo importante y las usa para responder, resumir y crear tu Studio.</p>
      <form className="inline-form" onSubmit={addUrl}>
        <input className="field" aria-label="Enlace" placeholder="Pega un enlace de internet…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Link2 />}Añadir enlace</Button>
      </form>
      <textarea className="field min-h-32" aria-label="Texto de la fuente" placeholder="…o pega aquí un texto" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" disabled={!text.trim()} onClick={() => { add(text.trim().slice(0, 40) + "…", "texto", text.trim()); setText(""); }}><FileText />Añadir texto</Button>
        <label className="upload-btn">
          <input type="file" hidden accept=".pdf,.docx,.xlsx,.pptx,.txt,.md,.csv" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const r = await readStudyFile(f);
            if (r.text.trim()) add(r.name, "archivo", r.text.trim().slice(0, 20000)); else toast.error(r.note ?? "No encontré texto");
            e.target.value = "";
          }} />
          <FileText size={16} />Subir documento
        </label>
      </div>
      <ul className="source-list">
        {!sources.length && <li className="subtitle">Aún no hay fuentes. ¡Añade la primera!</li>}
        {sources.map((s, idx) => (
          <li key={s.id} className="source-card">
            <div className="source-head">
              <span className="pill sky">[{idx + 1}] {s.kind}</span>
              <button type="button" className="flex-1 truncate text-left font-bold" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>{s.title}</button>
              <Button size="icon" variant="ghost" aria-label={`Ver resumen de ${s.title}`} onClick={() => setOpen(open === s.id ? null : s.id)}><ChevronDown className={open === s.id ? "rotate-180 transition" : "transition"} /></Button>
              <Button size="icon" variant="ghost" aria-label={`Quitar ${s.title}`} onClick={() => update({ ...n, sources: sources.filter((x) => x.id !== s.id) })}><Trash2 /></Button>
            </div>
            {open === s.id && (
              <div className="source-digest">
                {!!s.ideas?.length && <div><h4><Lightbulb size={15} />Ideas principales</h4><div className="flex flex-wrap gap-1.5">{s.ideas.map((i) => <span key={i} className="pill lilac">{i}</span>)}</div></div>}
                {!!s.summary?.length && <div><h4><BookOpenText size={15} />Resumen</h4><p>{s.summary.join(" ")}</p></div>}
                {!!s.points?.length && <div><h4><ListChecks size={15} />Puntos clave</h4><ul>{s.points.map((p) => <li key={p}>{md(p)}</li>)}</ul></div>}
                {!s.summary?.length && <p className="subtitle">Fuente guardada antes de la extracción automática. Vuelve a añadirla para ver su resumen.</p>}
                {s.url && <a className="text-primary text-sm underline" href={s.url} target="_blank" rel="noopener noreferrer">Abrir fuente original</a>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
