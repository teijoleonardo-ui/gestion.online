import type { GastoConcepto } from "@/lib/consultaGastosTipos";
import { buildCartRowsFromGastoConceptos } from "@/lib/cart-storage";

/** Payload en sessionStorage al ir a pagar desde un draft Terminal 4 (APM). */
export const APM_DRAFT_CHECKOUT_SESSION_KEY = "gestion:apm-draft-checkout-v1";

export type ApmDraftCheckoutSession = {
  numeroDraft: string;
  bl: string;
  contenedor: string;
  cuitFacturacion: string;
  conceptos: GastoConcepto[];
};

/** Convierte gastos de terminal al modelo de ítems del carrito (mock hasta API). */
export function conceptosTerminalToCartLines(
  conceptos: GastoConcepto[],
  bl: string,
  idBase: number,
): Array<{
  id: number;
  bl: string;
  contratanteSigla: "APM";
  concepto: string;
  tipo: GastoConcepto["tipo"];
  moneda: GastoConcepto["moneda"];
  importe: number;
}> {
  return buildCartRowsFromGastoConceptos(conceptos, bl, "APM", idBase) as Array<{
    id: number;
    bl: string;
    contratanteSigla: "APM";
    concepto: string;
    tipo: GastoConcepto["tipo"];
    moneda: GastoConcepto["moneda"];
    importe: number;
  }>;
}
