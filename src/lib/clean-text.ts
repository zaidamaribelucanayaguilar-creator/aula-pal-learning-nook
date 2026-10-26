// Limpieza de texto importado (fuentes web, PDF, TXT): decodifica entidades HTML
// y elimina la "basura de navegación" (botones de compartir, menús, pies de página).
// Módulo browser-safe: sin dependencias de Node, apto para pruebas unitarias.

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»",
  iexcl: "¡", iquest: "¿", deg: "°", plusmn: "±", times: "×", divide: "÷",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  agrave: "à", egrave: "è", ccedil: "ç", copy: "©", reg: "®", trade: "™",
};

/** Convierte entidades HTML (&#8211;, &#x2019;, &aacute;…) en sus caracteres normales. */
export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return code >= 32 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    })
    .replace(/&#(\d+);?/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return code >= 32 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    })
    .replace(/&([a-zA-Z]+);/g, (m, name: string) => NAMED_ENTITIES[name] ?? m);
}

// Frases típicas de navegación/compartir que no aportan contenido educativo.
const JUNK_PATTERNS: RegExp[] = [
  /^(share|compartir|compartir en|tweet|twittear|pin it|guardar en pinterest)\b/i,
  /^(compartir|share)\b.{0,40}\b(facebook|twitter|x\.com|linkedin|whatsapp|telegram|pinterest|reddit|correo|email)\b/i,
  /^(copiar enlace|copy link|enlace copiado|link copied)\b/i,
  /^(suscr[ií]bete|suscripci[oó]n|newsletter|reg[ií]strate|inicia sesi[oó]n|iniciar sesi[oó]n|crea tu cuenta|log in|sign up)\b/i,
  /^(men[uú]|menu|buscar|search|ir al contenido|skip to content|navegaci[oó]n)\b/i,
  /\b(todos los derechos reservados|all rights reserved|pol[ií]tica de privacidad|pol[ií]tica de cookies|aviso legal|t[eé]rminos y condiciones)\b/i,
  /^(publicidad|anuncios?|advertisement|sponsored|patrocinado)\b/i,
  /^(leer m[aá]s|read more|ver m[aá]s|art[ií]culos relacionados|related articles|tambi[eé]n te puede interesar)\b/i,
  /^(s[ií]guenos|follow us|s[ií]guenos en)\b/i,
  /^(comentarios?|comments?|deja un comentario|leave a reply)\b/i,
  /^(inicio|home|contacto|contact|acerca de|about us|qui[eé]nes somos)\s*$/i,
  /^(aceptar cookies?|aceptar todas|rechazar|configurar cookies?)\b/i,
  /^(imprimir|print|descargar pdf|download pdf|escuchar|listen)\s*$/i,
];

/** Elimina líneas de navegación, botones de compartir y pies de página. */
export function stripWebJunk(input: string): string {
  const lines = input.split(/\n+/);
  const kept: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    if (JUNK_PATTERNS.some((re) => re.test(line))) continue;
    // Líneas muy cortas tipo menú: pocas palabras, sin verbo ni puntuación final.
    const words = line.split(" ").length;
    if (line.length < 24 && words <= 3 && !/[.!?:;…)]$/.test(line) && !/\d/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}

/** Limpieza completa: entidades + basura web + espacios. Lista para el tutor y los resúmenes. */
export function cleanImportedText(input: string): string {
  return stripWebJunk(decodeHtmlEntities(input))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
