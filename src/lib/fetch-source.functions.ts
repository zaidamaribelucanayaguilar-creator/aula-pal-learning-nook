import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Lee el texto visible de una página pública para usarlo como fuente del cuaderno.
export const fetchSource = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ url: z.string().url().max(2000) }).parse(input))
  .handler(async ({ data }) => {
    const url = new URL(data.url);
    if (!/^https?:$/.test(url.protocol)) throw new Error("Solo enlaces http(s)");
    const host = url.hostname;
    if (host === "localhost" || /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) throw new Error("Enlace no permitido");
    try {
      const res = await fetch(url.toString(), { headers: { "User-Agent": "AulaPlusBot/1.0", Accept: "text/html,text/plain" } });
      if (!res.ok) return { ok: false as const, title: host, text: "", error: `La página respondió ${res.status}` };
      const html = (await res.text()).slice(0, 600_000);
      const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? host).trim().slice(0, 120);
      const text = html
        .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000);
      return { ok: true as const, title, text, error: "" };
    } catch {
      return { ok: false as const, title: host, text: "", error: "No se pudo abrir el enlace" };
    }
  });
