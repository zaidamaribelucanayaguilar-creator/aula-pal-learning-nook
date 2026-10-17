// Tutor local (sin IA externa): responde conocimiento general y usa los apuntes como apoyo.
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function solveMath(question: string): { expr: string; result: number } | null {
  let q = norm(question)
    .replace(/(\d)\s*x\s*(\d)/g, "$1*$2")
    .replace(/por/g, "*").replace(/multiplicado/g, "*").replace(/mas/g, "+").replace(/menos/g, "-")
    .replace(/dividido( entre)?|entre/g, "/").replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**")
    .replace(/,/g, ".");
  const m = q.match(/[\d(][\d+\-*/.()\s]*[\d)]/g);
  if (!m) return null;
  const expr = m.sort((a, b) => b.length - a.length)[0]!.trim();
  if (!/[+\-*/]/.test(expr) || !/^[\d+\-*/.()\s]+$/.test(expr)) return null;
  try {
    const result = Function(`"use strict";return (${expr})`)() as number;
    if (typeof result !== "number" || !Number.isFinite(result)) return null;
    return { expr: expr.replace(/\*\*/g, "^"), result: Math.round(result * 1e6) / 1e6 };
  } catch { return null; }
}

const topics: { keys: string[]; text: string }[] = [
  { keys: ["fotosintesis"], text: "La **fotosíntesis** es el proceso con el que las plantas fabrican su alimento 🌿.\n\n- Usan **luz solar**, **agua** (que absorben por las raíces) y **dióxido de carbono** (del aire).\n- En las hojas, gracias a la **clorofila**, los transforman en **glucosa** (energía).\n- Liberan **oxígeno**, ¡el que respiramos!\n\nFórmula sencilla: agua + CO₂ + luz → glucosa + oxígeno." },
  { keys: ["fraccion"], text: "Una **fracción** representa partes de un todo: el **numerador** (arriba) dice cuántas partes tomas y el **denominador** (abajo) en cuántas se divide.\n\nEjemplo: 🍕 dividida en 4 y comes 1 → **1/4**.\nPara sumar fracciones busca un **denominador común**: 1/2 + 1/4 = 2/4 + 1/4 = **3/4**." },
  { keys: ["celula"], text: "La **célula** es la unidad más pequeña de vida 🔬. Tiene **membrana** (la protege), **citoplasma** (donde ocurren procesos) y **núcleo** (guarda el ADN). Las vegetales además tienen pared celular y cloroplastos." },
  { keys: ["agua", "ciclo"], text: "El **ciclo del agua** 💧: **evaporación** (el sol calienta el agua) → **condensación** (forma nubes) → **precipitación** (lluvia) → **escorrentía/infiltración** (vuelve a ríos y mares)." },
  { keys: ["sustantivo"], text: "Un **sustantivo** es la palabra que nombra personas, animales, cosas o ideas: *perro, María, mesa, alegría*." },
  { keys: ["verbo"], text: "Un **verbo** expresa acciones, estados o procesos: *correr, ser, crecer*. Cambia según la persona y el tiempo (yo corro, ellos corrieron)." },
  { keys: ["sistema solar", "planetas"], text: "El **sistema solar** 🪐 tiene 8 planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno. Un truco: *\"Mi Vieja Tía Mara Jamás Supo Usar Nada\"*." },
  { keys: ["texto narrativo", "narrativo"], text: "Un **texto narrativo** cuenta una historia con **inicio**, **desarrollo** y **desenlace**, con personajes, tiempo y lugar." },
  { keys: ["newton", "leyes del movimiento"], text: "Las **3 leyes de Newton** 🍎:\n1. **Inercia**: un cuerpo sigue en reposo o movimiento si nada lo cambia.\n2. **F = m·a**: la fuerza es masa por aceleración.\n3. **Acción y reacción**: toda fuerza genera otra igual y opuesta." },
  { keys: ["velocidad"], text: "La **velocidad** es la distancia recorrida en un tiempo: **v = d / t**. Ej.: 100 km en 2 h → 50 km/h. Si además indica dirección, es un vector." },
  { keys: ["energia"], text: "La **energía** es la capacidad de realizar trabajo ⚡. Formas: cinética (movimiento, Ec = ½mv²), potencial (posición, Ep = mgh), térmica, química, eléctrica. **No se crea ni se destruye, se transforma.**" },
  { keys: ["gravedad"], text: "La **gravedad** es la fuerza con que los cuerpos con masa se atraen. En la Tierra acelera los objetos a unos **9,8 m/s²**." },
  { keys: ["pitagoras"], text: "**Teorema de Pitágoras** 📐: en un triángulo rectángulo, **a² + b² = c²** (c es la hipotenusa). Ej.: 3² + 4² = 9 + 16 = 25 → c = 5." },
  { keys: ["ecuacion"], text: "Una **ecuación** es una igualdad con una incógnita. Para resolver 2x + 3 = 11: resta 3 → 2x = 8; divide entre 2 → **x = 4**. Lo que haces a un lado, hazlo al otro." },
  { keys: ["derivada"], text: "La **derivada** mide cómo cambia una función en un punto (la pendiente de la recta tangente). Reglas: d/dx(xⁿ) = n·xⁿ⁻¹; d/dx(constante) = 0. Ej.: d/dx(x³) = 3x²." },
  { keys: ["integral"], text: "La **integral** es la operación inversa de la derivada y calcula áreas bajo curvas. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Ej.: ∫2x dx = x² + C." },
  { keys: ["porcentaje"], text: "Un **porcentaje** es una parte de 100. Para hallar el 20% de 50: 50 × 20 / 100 = **10**." },
  { keys: ["adn"], text: "El **ADN** guarda la información genética 🧬. Es una doble hélice formada por nucleótidos con 4 bases: **A, T, C, G** (A con T, C con G)." },
  { keys: ["mitosis", "meiosis"], text: "**Mitosis**: una célula se divide en 2 idénticas (crecimiento, reparación). **Meiosis**: produce 4 células con la mitad de cromosomas (gametos), generando variabilidad." },
  { keys: ["ecosistema", "cadena alimenticia"], text: "Un **ecosistema** reúne seres vivos y su entorno. La **cadena alimenticia** va de **productores** (plantas) → **consumidores** (herbívoros, carnívoros) → **descomponedores** (hongos, bacterias)." },
  { keys: ["corazon", "circulatorio"], text: "El **corazón** ❤️ tiene 4 cavidades (2 aurículas y 2 ventrículos). Bombea sangre: la circulación **menor** lleva sangre a los pulmones y la **mayor** al resto del cuerpo." },
  { keys: ["sistema nervioso", "neurona", "cerebro"], text: "El **sistema nervioso** coordina el cuerpo 🧠. Central: **encéfalo y médula espinal**. Periférico: nervios. Su unidad es la **neurona**, que transmite impulsos eléctricos y químicos (sinapsis)." },
  { keys: ["digestivo"], text: "El **sistema digestivo**: boca → esófago → estómago → intestino delgado (absorbe nutrientes) → intestino grueso (absorbe agua). Lo ayudan hígado y páncreas." },
  { keys: ["huesos", "esqueleto", "oseo"], text: "El **esqueleto** adulto tiene **206 huesos**. Sostiene, protege órganos (el cráneo protege el cerebro) y produce células sanguíneas en la médula ósea." },
  { keys: ["psicologia", "maslow"], text: "La **psicología** estudia la mente y la conducta. La **pirámide de Maslow**: fisiológicas → seguridad → afiliación → reconocimiento → autorrealización." },
  { keys: ["memoria"], text: "La **memoria** tiene etapas: **codificación, almacenamiento y recuperación**. Hay memoria sensorial, a corto plazo (≈7 elementos) y a largo plazo. Se fortalece con repaso espaciado." },
  { keys: ["piaget"], text: "**Piaget** describió 4 etapas del desarrollo cognitivo: sensoriomotora (0–2), preoperacional (2–7), operaciones concretas (7–11) y operaciones formales (11+)." },
  { keys: ["revolucion francesa"], text: "La **Revolución Francesa** (1789) acabó con la monarquía absoluta en Francia. Lema: **Libertad, Igualdad, Fraternidad**. Hito: toma de la Bastilla (14 de julio)." },
  { keys: ["independencia del peru", "peru"], text: "El **Perú** proclamó su independencia el **28 de julio de 1821** con José de San Martín en Lima; se consolidó en la batalla de **Ayacucho (1824)**." },
  { keys: ["incas", "inca"], text: "El **Imperio inca** (Tahuantinsuyo) tuvo capital en **Cusco**. Destacó por el Qhapaq Ñan (caminos), andenes agrícolas, quipus y Machu Picchu." },
  { keys: ["segunda guerra mundial"], text: "La **Segunda Guerra Mundial** (1939–1945) enfrentó a los Aliados contra el Eje (Alemania, Italia, Japón). Terminó en 1945 y dio origen a la ONU." },
  { keys: ["primera guerra mundial"], text: "La **Primera Guerra Mundial** (1914–1918) inició tras el asesinato del archiduque Francisco Fernando. Terminó con el Tratado de Versalles (1919)." },
  { keys: ["metafora", "figuras literarias"], text: "**Figuras literarias**: **metáfora** (\"tus ojos son luceros\"), **símil** (\"como un lucero\"), **hipérbole** (exageración), **personificación** (\"el viento canta\")." },
  { keys: ["acento", "tilde"], text: "Reglas de **tildación**: **agudas** llevan tilde si terminan en n, s o vocal (canción); **graves** si NO terminan así (árbol); **esdrújulas** siempre (música)." },
  { keys: ["atomo"], text: "El **átomo** tiene núcleo (**protones** + y **neutrones**) y **electrones** (–) alrededor. El número de protones define el elemento." },
  { keys: ["tabla periodica"], text: "La **tabla periódica** ordena los 118 elementos por número atómico. Filas = **periodos**, columnas = **grupos** con propiedades parecidas." },
];

const studyTips = "Aquí van mis mejores consejos de estudio 📚✨\n\n1. **Pomodoro**: 25 min de estudio y 5 de descanso.\n2. **Explícalo con tus palabras**, como si enseñaras a un amigo.\n3. **Repasa con flashcards** en días distintos (repaso espaciado).\n4. **Duerme bien**: tu cerebro guarda lo aprendido mientras descansas.\n5. Estudia sin el celular cerca 📵.";

export function tutorReply(question: string, notes: string, subject: string): string {
  const q = norm(question.trim());
  if (!q) return "¡Escríbeme tu duda y la resolvemos juntos! 😊";
  if (/^(hola|buenas|hey|buenos)/.test(q) && q.length < 25)
    return `¡Hola! 👋 Soy tu tutor. Puedo ayudarte con **${subject}** o con cualquier duda escolar: matemáticas, ciencias, lenguaje o consejos de estudio. ¿Qué quieres aprender hoy?`;
  const math = solveMath(question);
  if (math) return `¡Vamos a calcularlo! 🧮\n\n**${math.expr} = ${math.result}**\n\n¿Quieres que te explique el procedimiento paso a paso o probamos otro ejercicio?`;
  if (/consejo|tip|como estudiar|concentr|memoriz/.test(q)) return studyTips;
  if (/gracias/.test(q)) return "¡De nada! 💚 Sigue así, cada pregunta te hace más fuerte.";
  const topic = topics.find((t) => t.keys.some((k) => q.includes(k)));
  const words = q.split(/\W+/).filter((w) => w.length > 4);
  const sentences = notes.split(/(?<=\.)\s+/).filter(Boolean);
  const related = sentences.filter((s) => words.some((w) => norm(s).includes(w)));
  const fromNotes = related.length ? `\n\n📒 **En tus apuntes:** _${related.slice(0, 2).join(" ")}_` : "";
  if (topic) return topic.text + fromNotes + "\n\n¿Te preparo una pregunta de práctica?";
  if (related.length) return `¡Buena pregunta! Según tus fuentes de **${subject}**:\n\n_${related.slice(0, 2).join(" ")}_\n\nIntenta explicarlo con tus palabras y buscar un ejemplo de la vida diaria. ¿Lo intentamos juntos?`;
  return `¡Buena pregunta! 🌱 Todavía no tengo información sobre "${question.trim().slice(0, 80)}" en las fuentes de este cuaderno.\n\n${WEB_OFFER}`;
}

export const WEB_OFFER = "¿Te gustaría que realice una búsqueda en la web sobre este tema para darte la respuesta?";

/** Preguntas de seguimiento sugeridas al final de cada respuesta. */
export function followUps(question: string, subject: string): string[] {
  const q = norm(question);
  if (solveMath(question)) return ["¿Me explicas el procedimiento paso a paso?", "Dame un ejercicio parecido", "¿Dónde se usa esto en la vida real?"];
  const topic = topics.find((t) => t.keys.some((k) => q.includes(k)));
  const name = topic ? topic.keys[0] : subject;
  return [`¿Exploramos las principales ramas de ${name}?`, `¿Cómo se relaciona ${name} con otras áreas?`, "Hazme una pregunta de práctica"];
}

/** Busca un resumen en Wikipedia en español (API pública con CORS). */
export async function webSearch(query: string): Promise<{ title: string; text: string; url: string } | null> {
  try {
    const s = await fetch(`https://es.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=1`).then((r) => r.json());
    const key = s?.pages?.[0]?.key;
    if (!key) return null;
    const p = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`).then((r) => r.json());
    if (!p?.extract) return null;
    return { title: p.title, text: p.extract, url: p.content_urls?.desktop?.page ?? `https://es.wikipedia.org/wiki/${key}` };
  } catch {
    return null;
  }
}

export type WebHit = { title: string; text: string; url: string };
/** Varios resultados de Wikipedia para citar con notas al pie. */
export async function webSearchMany(query: string, limit = 3): Promise<WebHit[]> {
  try {
    const s = await fetch(`https://es.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=${limit}`).then((r) => r.json());
    const keys: string[] = (s?.pages ?? []).map((p: { key: string }) => p.key).slice(0, limit);
    const hits = await Promise.all(keys.map(async (key) => {
      try {
        const p = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`).then((r) => r.json());
        return p?.extract ? { title: p.title as string, text: p.extract as string, url: (p.content_urls?.desktop?.page as string) ?? `https://es.wikipedia.org/wiki/${key}` } : null;
      } catch { return null; }
    }));
    return hits.filter((h): h is WebHit => !!h);
  } catch { return []; }
}

/** Respuesta con citas [1], notas al pie y enlace a Google. */
export function formatWebAnswer(query: string, hits: WebHit[]): string {
  if (!hits.length) return `No encontré un resultado claro en la web 😕. Puedes [buscarlo en Google](https://www.google.com/search?q=${encodeURIComponent(query)}) o pegar un enlace en **Fuentes**.`;
  const [main, ...rest] = hits;
  const body = [`### 🌐 Lo que encontré sobre "${query.slice(0, 80)}"`, "", `${main!.text} [¹](${main!.url})`];
  const sup = ["¹", "²", "³", "⁴"];
  if (rest.length) body.push("", "**También relacionado:**", ...rest.map((h, i) => `- **${h.title}** — ${sentences(h.text)[0] ?? h.text.slice(0, 160)} [${sup[i + 1]}](${h.url})`));
  body.push("", "---", "**Notas al pie**", ...hits.map((h, i) => `${sup[i]} [${h.title} — Wikipedia](${h.url})`), `🔎 [Ver más resultados en Google](https://www.google.com/search?q=${encodeURIComponent(query)})`);
  return body.join("\n");
}

/** Extrae resumen estructurado, puntos clave e ideas principales de una fuente. */
export function digestSource(text: string) {
  const s = sentences(text);
  const terms = keyTerms(text, 8);
  const summary = summarize(text, 3);
  const points = terms.slice(0, 6).map((t) => {
    const x = s.find((y) => y.toLowerCase().includes(t)) ?? "";
    return `**${t[0]!.toUpperCase()}${t.slice(1)}:** ${x.slice(0, 180)}`;
  }).filter((p) => !p.endsWith(":** "));
  const ideas = terms.slice(0, 5).map((t) => t[0]!.toUpperCase() + t.slice(1));
  return { summary, points, ideas };
}

// ---------- Herramientas de estudio locales ----------
export function sentences(text: string) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.length > 15);
}
const stop = new Set("el la los las un una unos unas de del y o a en que por para con se su sus es son al lo como mas pero sus este esta estos estas cuando donde tiene tienen ser hay muy".split(" "));
export function keyTerms(text: string, max = 8) {
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-záéíóúñü]{5,}/g) ?? []) if (!stop.has(norm(w))) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}
export function summarize(text: string, max = 3) {
  const s = sentences(text); const terms = keyTerms(text, 10);
  return s.map((x, i) => ({ x, i, score: terms.filter((t) => x.toLowerCase().includes(t)).length }))
    .sort((a, b) => b.score - a.score).slice(0, max).sort((a, b) => a.i - b.i).map((r) => r.x);
}
export function mindMap(topic: string, text: string) {
  const terms = keyTerms(text, 6);
  return { center: topic, branches: terms.map((t) => ({ label: t, detail: sentences(text).find((x) => x.toLowerCase().includes(t)) ?? "" })) };
}
export type QuizItem = { question: string; options: string[]; answer: string };
export function makeQuiz(text: string, count = 5): QuizItem[] {
  const terms = keyTerms(text, 12);
  const out: QuizItem[] = [];
  for (const s of sentences(text)) {
    const term = terms.find((t) => s.toLowerCase().includes(t));
    if (!term) continue;
    const distract = terms.filter((t) => t !== term).slice(out.length % 3, out.length % 3 + 3);
    if (distract.length < 2) continue;
    const options = [term, ...distract].sort((a, b) => a.localeCompare(b));
    out.push({ question: s.replace(new RegExp(term, "i"), "_____"), options, answer: term });
    if (out.length >= count) break;
  }
  return out;
}
export function dataTable(text: string) {
  return keyTerms(text, 8).map((t) => ({ term: t, count: (text.toLowerCase().match(new RegExp(t, "g")) ?? []).length, context: sentences(text).find((x) => x.toLowerCase().includes(t)) ?? "" }));
}
