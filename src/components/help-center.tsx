import { useState } from "react";
import { Search, BookOpen, HelpCircle, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "¿Cómo crece mi mascota?", a: "Cada cuaderno tiene su propia mascota. Perfecto suma 2 puntos, Bien suma 1 y Necesita Repaso 0. Cada 10 puntos sube de nivel.", who: "Estudiantes" },
  { q: "¿Cómo creo un cuaderno?", a: "En Mis cuadernos pulsa “+ Crear Nuevo Cuaderno”, elige nombre, mascota y color.", who: "Estudiantes" },
  { q: "¿Puedo subir archivos al tutor?", a: "Sí. En el chat pulsa “Archivo” y sube PDF, Word, Excel, PowerPoint o texto. Milo los lee y los guarda en tus apuntes.", who: "Estudiantes" },
  { q: "¿Qué es Estudio+?", a: "Una pestaña del cuaderno que crea mapas mentales, cuestionarios, tablas y resúmenes en audio a partir de tus apuntes.", who: "Estudiantes" },
  { q: "¿Cómo creo una clase?", a: "En Modo Profesor usa “Crear Nueva Clase” arriba y luego “Gestionar estudiantes” para añadir alumnos.", who: "Profesores" },
  { q: "¿Cómo armo grupos?", a: "Ve a Grupos de trabajo, elige el tamaño (2 a 6+) y pulsa mezclar.", who: "Profesores" },
  { q: "¿Cómo doy puntos?", a: "En Mi clase toca a un estudiante y elige una habilidad para sumar o restar puntos.", who: "Profesores" },
  { q: "¿Se guardan mis avances?", a: "Es un prototipo: los cambios viven mientras la pestaña esté abierta. Al recargar empieza de nuevo.", who: "Todos" },
  { q: "¿Cómo cambio mi nombre o idioma?", a: "Toca la flecha junto a tu avatar y elige Editar Perfil o Configuración.", who: "Todos" },
  { q: "¿Cómo cambio el fondo?", a: "Usa el botón de tema en la barra superior: claro, oscuro, azul escolar o una imagen propia.", who: "Todos" },
];
const guides = [
  { title: "Primeros pasos", steps: ["Crea tu primer cuaderno.", "Escribe o sube tus apuntes.", "Pregúntale a Milo tus dudas.", "Practica con flashcards y cuestionarios."] },
  { title: "Para profesores", steps: ["Crea tu clase.", "Añade a tus estudiantes.", "Arma grupos y usa el temporizador.", "Publica anuncios en el tablón."] },
  { title: "Estudiar mejor", steps: ["Usa Pomodoro: 25 min + 5 de descanso.", "Explica el tema con tus palabras.", "Repasa en días distintos.", "Escucha el resumen en audio antes de dormir."] },
];

function answer(q: string) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const best = faqs.map((f) => ({ f, s: words.filter((w) => (f.q + f.a).toLowerCase().includes(w)).length })).sort((a, b) => b.s - a.s)[0];
  return best && best.s > 0 ? `${best.f.q} — ${best.f.a}` : "No encontré una respuesta exacta. Prueba con otras palabras o pregúntale a Milo dentro de un cuaderno.";
}

export function HelpCenter() {
  const [tab, setTab] = useState<"faq" | "guides" | "ask">("faq");
  const [query, setQuery] = useState("");
  const [who, setWho] = useState("Todos");
  const [ask, setAsk] = useState("");
  const [reply, setReply] = useState("");
  const list = faqs.filter((f) => (who === "Todos" || f.who === who || f.who === "Todos") && (f.q + f.a).toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="help-center">
      <div className="tool-switch">
        <Button size="sm" variant={tab === "faq" ? "default" : "outline"} onClick={() => setTab("faq")}><HelpCircle />Preguntas</Button>
        <Button size="sm" variant={tab === "guides" ? "default" : "outline"} onClick={() => setTab("guides")}><BookOpen />Guías</Button>
        <Button size="sm" variant={tab === "ask" ? "default" : "outline"} onClick={() => setTab("ask")}><MessageCircleQuestion />Pregunta</Button>
      </div>
      {tab === "faq" && <>
        <div className="help-search"><Search size={16} /><input className="field" placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar preguntas" /></div>
        <div className="tool-switch">{["Todos", "Estudiantes", "Profesores"].map((w) => <Button key={w} size="sm" variant={who === w ? "secondary" : "ghost"} onClick={() => setWho(w)}>{w}</Button>)}</div>
        <div className="help-list">
          {list.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          {!list.length && <p className="text-muted-foreground">Sin resultados.</p>}
        </div>
      </>}
      {tab === "guides" && <div className="help-list">{guides.map((g) => <details key={g.title} open={g.title === "Primeros pasos"}><summary>{g.title}</summary><ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol></details>)}</div>}
      {tab === "ask" && <form className="modal-form" onSubmit={(e) => { e.preventDefault(); if (ask.trim()) setReply(answer(ask)); }}>
        <label>Escribe tu duda<input className="field" value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ej.: ¿cómo subo un PDF?" maxLength={200} /></label>
        <Button type="submit"><Send />Preguntar</Button>
        {reply && <div className="announcement"><p>{reply}</p></div>}
      </form>}
    </div>
  );
}
