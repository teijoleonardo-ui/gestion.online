/**
 * Persistencia del carrito en localStorage.
 * Si la clave no existe → primera visita: puede mostrarse seed demo desde la página.
 * Si existe `[]` → carrito vacío real (no volver a inyectar ejemplos).
 */

import type { GastoConcepto } from "@/lib/consultaGastosTipos";

export const GESTION_CART_ITEMS_STORAGE_KEY = "gestion-cart-items-v1";

type CartItemPersisted = {
  id: number;
  bl: string;
  contratanteSigla: string;
  concepto: string;
  tipo: string;
  moneda: string;
  importe: number;
  addedAt: string;
};

function isCartRow(row: unknown): row is CartItemPersisted {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    typeof r.bl === "string" &&
    typeof r.contratanteSigla === "string" &&
    typeof r.concepto === "string" &&
    (r.tipo === "Armador" || r.tipo === "Agencia") &&
    (r.moneda === "USD" || r.moneda === "ARS") &&
    typeof r.importe === "number" &&
    typeof r.addedAt === "string"
  );
}

/** Devuelve `null` si la clave no está (primera visita). Array (vacío o no) si hay datos guardados. */
export function loadCartItemsFromStorage(): CartItemPersisted[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GESTION_CART_ITEMS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: CartItemPersisted[] = [];
    for (const row of parsed) {
      if (isCartRow(row)) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

export function saveCartItemsToStorage(items: CartItemPersisted[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GESTION_CART_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

/** Filas sin `addedAt`; alinear con {@link conceptosTerminalToCartLines} en `apm-draft-checkout`. */
export function buildCartRowsFromGastoConceptos(
  conceptos: GastoConcepto[],
  bl: string,
  contratanteSigla: string,
  idBase: number,
): Omit<CartItemPersisted, "addedAt">[] {
  const blU = bl.trim().toUpperCase();
  const sig = contratanteSigla.trim().toUpperCase();
  return conceptos.map((g, idx) => ({
    id: idBase + idx,
    bl: blU,
    contratanteSigla: sig,
    concepto: `${g.codigoConcepto} — ${g.descripcion}`,
    tipo: g.tipo,
    moneda: g.moneda,
    importe: g.neto,
  }));
}

/**
 * Agrega al carrito persistido los conceptos de la consulta actual (reemplaza líneas previas del mismo BL + contratante).
 */
export function appendConsultaConceptosToCart(
  conceptos: GastoConcepto[],
  bl: string,
  contratanteSigla: string,
): void {
  if (typeof window === "undefined") return;
  const blNorm = bl.trim().toUpperCase();
  if (!blNorm || conceptos.length === 0) return;

  const siglaNorm = contratanteSigla.trim().toUpperCase();

  let existing = loadCartItemsFromStorage();
  if (existing === null) existing = [];

  const maxId = existing.reduce((m, i) => Math.max(m, i.id), 0);
  const idBase = maxId + 1;
  const addedAt = new Date().toISOString();

  const partial = buildCartRowsFromGastoConceptos(conceptos, bl, siglaNorm, idBase);
  const newRows: CartItemPersisted[] = partial.map((row) => ({ ...row, addedAt }));

  const filtered = existing.filter(
    (i) =>
      !(
        i.contratanteSigla.toUpperCase() === siglaNorm &&
        i.bl.toUpperCase() === blNorm
      ),
  );

  saveCartItemsToStorage([...filtered, ...newRows]);
}
