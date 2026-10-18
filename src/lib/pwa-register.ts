// Registro protegido del service worker de AulaPlus.
// Solo se registra en la app publicada en producción: nunca en dev ni en la
// vista previa de Lovable, para que el caché no sirva versiones viejas.
const BLOCKED_HOSTS = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true;
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppSw() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => r.active?.scriptURL.endsWith("/sw.js"))
      .map((r) => r.unregister()),
  );
}

export async function registerPwa() {
  if (isBlockedContext()) {
    await unregisterAppSw();
    return;
  }
  if (!("serviceWorker" in navigator)) return;
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}
