import { useEffect, useRef, useState } from "react";
import { Network, ListChecks, Table2, Volume2, Pause, Play, Check, X, ChevronDown, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notebook } from "@/lib/aulaplus";
import { mindMap, makeQuiz, dataTable, summarize, sentences } from "@/lib/tutor";
import mascot from "@/assets/mascot.png";

type Tool = "map" | "quiz" | "table" | "audio";

function AudioPlayer({ title, lines }: { title: string; lines: string[] }) {
  const script = `Resumen de ${title}. ${lines.join(" ")}`;
  const total = Math.max(8, Math.round(script.split(/\s+/).length / 2.6));
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const timer = useRef<number | null>(null);
  const stop = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; };
  useEffect(() => () => { stop(); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);
  function play(from = pos) {
    const words = script.split(/\s+/);
    const start = Math.floor((from / total) * words.length);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(words.slice(start).join(" "));
      u.lang = "es-ES"; u.rate = rate;
      u.onend = () => { stop(); setPlaying(false); setPos(total); };
      window.speechSynthesis.speak(u);
    }
    setPlaying(true); stop();
    timer.current = window.setInterval(() => setPos((p) => { if (p + rate >= total) { stop(); setPlaying(false); return total; } return p + rate; }), 1000);
  }
  function pause() { stop(); setPlaying(false); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const current = Math.min(lines.length - 1, Math.floor((pos / total) * lines.length));
  return (
    <div className="audio-player">
      <div className="audio-top">
        <img src={mascot} alt="" width={64} height={64} className={playing ? "audio-pet talking" : "audio-pet"} />
        <div className="flex-1 min-w-0"><small className="subtitle">Resumen en audio · Milo</small><h3 className="truncate">{title}</h3></div>
        <div className={`audio-wave ${playing ? "on" : ""}`} aria-hidden>{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.07}s` }} />)}</div>
      </div>
      <input type="range" className="audio-range" min={0} max={total} step={1} value={pos} aria-label="Progreso del audio"
        onChange={(e) => { const v = Number(e.target.value); setPos(v); if (playing) play(v); }} />
      <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>{fmt(pos)}</span><span>{fmt(total)}</span></div>
      <div className="audio-controls">
        <Button variant="outline" size="icon" aria-label="Reiniciar" onClick={() => { pause(); setPos(0); }}><RotateCcw /></Button>
        {playing
          ? <Button size="lg" className="rounded-full" aria-label="Pausar" onClick={pause}><Pause /></Button>
          : <Button size="lg" className="rounded-full" aria-label="Reproducir" onClick={() => play(pos >= total ? 0 : pos)}><Play /></Button>}
        <Button variant="outline" size="sm" aria-label="Velocidad" onClick={() => setRate((r) => (r >= 1.5 ? 0.75 : r + 0.25))}><Gauge />{rate}x</Button>
      </div>
      <ol className="audio-transcript">{lines.map((s, i) => <li key={s} className={i === current && pos > 0 ? "on" : ""}>{s}</li>)}</ol>
    </div>
  );
}

export function StudyTools({ notebook, update }: { notebook: Notebook; update?: (n: Notebook) => void }) {
  const studio = notebook.studio ?? {};
  const [tool, setToolState] = useState<Tool>((studio.tool as Tool) ?? "map");
  const [picked, setPicked] = useState<Record<string, string>>(studio.quiz ?? {});
  const [openBranch, setOpenBranch] = useState<string | null>(null);
  const save = (patch: Partial<NonNullable<Notebook["studio"]>>) => update?.({ ...notebook, studio: { ...studio, ...patch } });
  const setTool = (t: Tool) => { setToolState(t); save({ tool: t }); };
  const text = notebook.notes;
  if (text.trim().length < 40)
    return <div className="tools-empty"><h3>Primero agrega fuentes o apuntes</h3><p className="text-muted-foreground">Añade un enlace o texto en Fuentes, o sube un archivo en el chat, para generar audio, mapas mentales y cuestionarios.</p></div>;
  const map = mindMap(notebook.name, text);
  const quiz = makeQuiz(text);
  const table = dataTable(text);
  const summary = summarize(text, 5);
  const all = sentences(text);
  const pick = (i: number, o: string) => { const next = { ...picked, [i]: o }; setPicked(next); save({ quiz: next }); };
  const tabs: { id: Tool; label: string; icon: typeof Network }[] = [
    { id: "audio", label: "Resumen en audio", icon: Volume2 },
    { id: "map", label: "Mapa mental", icon: Network },
    { id: "quiz", label: "Cuestionario", icon: ListChecks },
    { id: "table", label: "Tabla de datos", icon: Table2 },
  ];
  const score = quiz.filter((q, i) => picked[i] === q.answer).length;
  return (
    <div className="study-tools">
      <div className="tool-switch">
        {tabs.map((t) => <Button key={t.id} variant={tool === t.id ? "default" : "outline"} size="sm" onClick={() => setTool(t.id)}><t.icon />{t.label}</Button>)}
      </div>
      {tool === "audio" && <AudioPlayer title={notebook.name} lines={summary} />}
      {tool === "map" && <div className="mind-map">
        <div className={`mind-center tone-${notebook.tone}`}>{map.center}</div>
        <div className="mind-branches">{map.branches.map((b) => {
          const isOpen = openBranch === b.label;
          const more = all.filter((x) => x.toLowerCase().includes(b.label)).slice(0, 3);
          return <div className={`mind-branch ${isOpen ? "open" : ""}`} key={b.label}>
            <button type="button" className="mind-toggle" aria-expanded={isOpen} onClick={() => setOpenBranch(isOpen ? null : b.label)}>
              <strong>{b.label}</strong><ChevronDown size={16} className={isOpen ? "rotate-180 transition" : "transition"} />
            </button>
            {isOpen ? <ul>{more.map((m) => <li key={m}>{m}</li>)}</ul> : <p>{b.detail.slice(0, 90)}{b.detail.length > 90 ? "…" : ""}</p>}
          </div>;
        })}</div>
      </div>}
      {tool === "quiz" && <div className="quiz">
        {quiz.length === 0 && <p className="text-muted-foreground">Necesito fuentes un poco más largas para crear preguntas.</p>}
        {quiz.length > 0 && <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="pill mint">Aciertos: {score} / {quiz.length}</span>
          <Button size="sm" variant="ghost" onClick={() => { setPicked({}); save({ quiz: {} }); }}><RotateCcw />Reintentar</Button>
        </div>}
        {quiz.map((q, i) => <div className="quiz-item" key={i}>
          <p><strong>{i + 1}.</strong> {q.question}</p>
          <div className="quiz-options">{q.options.map((o) => {
            const chosen = picked[i] === o; const done = picked[i] !== undefined;
            return <Button key={o} size="sm" variant="outline" disabled={done} className={done && o === q.answer ? "quiz-right" : chosen ? "quiz-wrong" : ""} onClick={() => pick(i, o)}>
              {done && o === q.answer && <Check />}{chosen && o !== q.answer && <X />}{o}
            </Button>;
          })}</div>
        </div>)}
      </div>}
      {tool === "table" && <div className="overflow-x-auto"><table className="data-table">
        <thead><tr><th>Concepto</th><th>Veces</th><th>Contexto</th></tr></thead>
        <tbody>{table.map((r) => <tr key={r.term}><td><strong>{r.term}</strong></td><td>{r.count}</td><td>{r.context}</td></tr>)}</tbody>
      </table></div>}
    </div>
  );
}
