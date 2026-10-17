import { useEffect, useState } from "react";
import { Palette, Sun, Moon, School, ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

type Theme = "light" | "dark" | "school" | "custom";
const themes = [
  { id: "light", label: "Modo Claro", icon: Sun },
  { id: "dark", label: "Modo Oscuro", icon: Moon },
  { id: "school", label: "Azul Escolar", icon: School },
  { id: "custom", label: "Imagen personalizada", icon: ImageIcon },
] as const;

export function ThemeSettings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset["theme"] = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.setProperty("--custom-background", image ? `url(${JSON.stringify(image)})` : "none");
    return () => {
      delete root.dataset["theme"];
      root.classList.remove("dark");
      root.style.removeProperty("--custom-background");
    };
  }, [theme, image]);
  async function applyImage(e: React.FormEvent) {
    e.preventDefault();
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
    } catch {
      toast.error("Pega una URL de imagen válida que comience con https:// o http://.");
      return;
    }
    setChecking(true);
    const candidate = new Image();
    const loaded = await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => resolve(false), 8000);
      candidate.onload = () => { clearTimeout(timeout); resolve(true); };
      candidate.onerror = () => { clearTimeout(timeout); resolve(false); };
      candidate.src = parsed.href;
    });
    setChecking(false);
    if (!loaded) { toast.error("No se pudo abrir esa imagen. Prueba otra URL."); return; }
    setImage(parsed.href);
    setTheme("custom");
    toast.success("¡Tu nuevo fondo está listo!");
  }
  return <>
    <Button variant="ghost" size="icon" aria-label="Cambiar tema y fondo" title="Tema y fondo" onClick={() => setOpen(true)}><Palette /></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tu espacio, tu estilo</DialogTitle><DialogDescription>Tema y fondo</DialogDescription></DialogHeader>
        <div className="theme-options">
          {themes.map(({ id, label, icon: Icon }) => <Button key={id} variant="outline" className={`theme-option ${theme === id ? "selected" : ""}`} onClick={() => setTheme(id)}>
            <span className={`theme-swatch swatch-${id}`}><Icon /></span><span>{label}</span>{theme === id && <Check className="ml-auto" />}
          </Button>)}
        </div>
        {theme === "custom" && <form onSubmit={applyImage} className="modal-form">
          <label htmlFor="background-url">URL de la imagen de fondo</label>
          <input id="background-url" className="field" type="url" placeholder="https://…/imagen.jpg" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <Button type="submit" disabled={checking}><ImageIcon />{checking ? "Abriendo imagen…" : "Aplicar fondo"}</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </>;
}