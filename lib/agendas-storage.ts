/**
 * Persistencia local de agendas Interbanking / DEBIN para checkout y pantalla Agendas.
 */

export type InterbankingCuenta = {
  id: number;
  cuit: string;
  nombre: string;
  activo: boolean;
};

export type DebinCuenta = {
  id: number;
  modalidad: "CBU" | "ALIAS";
  dato: string;
  nombre: string;
  activo: boolean;
};

export const INTERBANKING_STORAGE_KEY = "gestion-online-agendas-interbanking-v1";
export const DEBIN_STORAGE_KEY = "gestion-online-agendas-debin-v1";

export const AGENDAS_STORAGE_CHANGED_EVENT = "gestion:agendas-storage-changed";

function dispatchAgendasChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AGENDAS_STORAGE_CHANGED_EVENT));
}

export function loadInterbankingAgendas(): InterbankingCuenta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INTERBANKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as InterbankingCuenta[]) : [];
  } catch {
    return [];
  }
}

export function saveInterbankingAgendas(items: InterbankingCuenta[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTERBANKING_STORAGE_KEY, JSON.stringify(items));
    dispatchAgendasChanged();
  } catch {
    /* ignore quota */
  }
}

export function loadDebinAgendas(): DebinCuenta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEBIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DebinCuenta[]) : [];
  } catch {
    return [];
  }
}

export function saveDebinAgendas(items: DebinCuenta[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEBIN_STORAGE_KEY, JSON.stringify(items));
    dispatchAgendasChanged();
  } catch {
    /* ignore quota */
  }
}

/** Texto en el selector del carrito (VEP · Interbanking). */
export function formatInterbankingCheckoutLabel(c: Pick<InterbankingCuenta, "cuit" | "nombre">): string {
  return `${c.cuit.trim()} - ${c.nombre.trim()}`;
}

export function formatDebinCheckoutLabel(c: Pick<DebinCuenta, "dato" | "nombre">): string {
  return `${c.dato.trim()} - ${c.nombre.trim()}`;
}

export function agendaAutomaticaValueIb(id: number): string {
  return `ib:${id}`;
}

export function agendaAutomaticaValueDebin(id: number): string {
  return `db:${id}`;
}
