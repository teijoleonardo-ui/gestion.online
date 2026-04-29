/** Duración del resaltado (debe coincidir con la animación en `globals.css`). */
export const SECTION_SPOTLIGHT_MS = 2000;

/**
 * sessionStorage: id de sección del dashboard (`nuestros-contratantes`, `carta-garantia`) para
 * scroll + spotlight cuando `router.push("/dashboard#…")` no preserva el hash.
 */
export const DASHBOARD_TARGET_SECTION_STORAGE_KEY = "go-dashboard-section";

const CLASS_NAME = "section-spotlight-active";
const timers = new Map<string, number>();

/**
 * Resalta brevemente un elemento por id (borde + brillo) para marcar el destino del scroll o la navegación.
 */
export function flashSectionSpotlight(elementId: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(elementId);
  if (!el) return;

  const prev = timers.get(elementId);
  if (prev !== undefined) window.clearTimeout(prev);

  el.classList.remove(CLASS_NAME);
  void el.offsetWidth;
  el.classList.add(CLASS_NAME);

  const t = window.setTimeout(() => {
    el.classList.remove(CLASS_NAME);
    timers.delete(elementId);
  }, SECTION_SPOTLIGHT_MS);
  timers.set(elementId, t);
}

/** Espera un instante tras el scroll suave antes de activar el resaltado. */
export function flashSectionSpotlightAfterScroll(elementId: string, delayMs = 420) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => flashSectionSpotlight(elementId), delayMs);
}
