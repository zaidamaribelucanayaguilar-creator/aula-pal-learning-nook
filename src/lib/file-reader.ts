// Lectura local de archivos (sin servicios externos). Devuelve texto plano.
export type ReadResult = { name: string; kind: string; text: string; note?: string };

export async function readStudyFile(file: File): Promise<ReadResult> {
  const name = file.name;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const kind = ext.toUpperCase() || "Archivo";
  if (file.size > 15 * 1024 * 1024) return { name, kind, text: "", note: "El archivo supera 15 MB." };
  try {
    if (["txt", "md", "csv", "json", "html", "rtf"].includes(ext) || file.type.startsWith("text/"))
      return { name, kind, text: await file.text() };
    if (ext === "docx") {
      const mammoth = await import("mammoth");
      const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return { name, kind: "Word", text: r.value };
    }
    if (["xlsx", "xls", "ods"].includes(ext)) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const text = wb.SheetNames.map((n) => `Hoja ${n}:\n${XLSX.utils.sheet_to_csv(wb.Sheets[n]!)}`).join("\n\n");
      return { name, kind: "Excel", text };
    }
    if (ext === "pptx") {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
        .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));
      const parts: string[] = [];
      for (const s of slides) {
        const xml = await zip.file(s)!.async("string");
        parts.push([...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join(" "));
      }
      return { name, kind: "PowerPoint", text: parts.map((p, i) => `Diapositiva ${i + 1}: ${p}`).join("\n") };
    }
    if (ext === "pdf") {
      const pdfjs = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= Math.min(doc.numPages, 50); i++) {
        const c = await (await doc.getPage(i)).getTextContent();
        pages.push(c.items.map((it) => ("str" in it ? it.str : "")).join(" "));
      }
      return { name, kind: "PDF", text: pages.join("\n") };
    }
    if (file.type.startsWith("image/"))
      return { name, kind: "Imagen", text: "", note: "Puedo guardar la imagen como referencia, pero en modo local no leo el texto dentro de las imágenes. Escríbeme qué muestra y te ayudo." };
    return { name, kind, text: "", note: "Este formato no se puede leer todavía." };
  } catch {
    return { name, kind, text: "", note: "No pude leer este archivo. ¿Está dañado o protegido?" };
  }
}
