// Backend-ready service para "Cotización del día" asignada por la agencia.
//
// ── Contrato de endpoints esperado (backend) ─────────────────────────
//   GET /api/cotizaciones/:sigla
//       Devuelve la cotización vigente asignada por la agencia para el
//       contratante indicado (ej: ONE, ZIM, HMM, YM, SDC, AMI, PIL ...).
//       200 → Cotizacion
//       404 → { error: "not_found" }  (no hay cotización cargada todavía)
//       5xx → { error: "unknown" }
//
// ── Flujo de negocio ─────────────────────────────────────────────────
//   La agencia carga manualmente la cotización del día en el panel
//   administrativo. Ese registro se guarda en la tabla `cotizaciones`
//   con los campos: sigla, usd, eur. El front sólo la consume por GET
//   y muestra los valores en un cartel flotante.

export interface Cotizacion {
  /** Sigla del contratante al que aplica (ej: "ONE", "ZIM"). */
  contratanteSigla: string;
  /** Tipo de cambio asignado por la agencia para USD (1 USD = N). */
  usd: number;
  /** Tipo de cambio asignado por la agencia para EUR (1 EUR = N). */
  eur: number;
}

export interface CotizacionResult {
  success: boolean;
  data?: Cotizacion;
  error?: "not_found" | "unknown";
}

const USE_MOCK = true;

export async function fetchCotizacion(
  contratanteSigla: string
): Promise<CotizacionResult> {
  if (USE_MOCK) return mockFetchCotizacion(contratanteSigla);

  try {
    const res = await fetch(
      `/api/cotizaciones/${encodeURIComponent(contratanteSigla)}`,
      { cache: "no-store" }
    );
    if (res.status === 404) return { success: false, error: "not_found" };
    if (!res.ok) return { success: false, error: "unknown" };
    const data = (await res.json()) as Cotizacion;
    return { success: true, data };
  } catch {
    return { success: false, error: "unknown" };
  }
}

// ─── Mock ────────────────────────────────────────────────────────────
// Cotizaciones de referencia para desarrollo. Se ignora cuando USE_MOCK=false.
const mockCotizaciones: Record<string, Cotizacion> = {
  ONE: { contratanteSigla: "ONE", usd: 1370, eur: 1495 },
  ZIM: { contratanteSigla: "ZIM", usd: 1368, eur: 1492 },
  HMM: { contratanteSigla: "HMM", usd: 1372, eur: 1498 },
  YM: { contratanteSigla: "YM", usd: 1371, eur: 1496 },
  SDC: { contratanteSigla: "SDC", usd: 1369, eur: 1493 },
  AMI: { contratanteSigla: "AMI", usd: 1370, eur: 1495 },
  PIL: { contratanteSigla: "PIL", usd: 1370, eur: 1495 },
  CN: { contratanteSigla: "CN", usd: 1370, eur: 1495 },
  APM: { contratanteSigla: "APM", usd: 1370, eur: 1495 },
};

async function mockFetchCotizacion(
  sigla: string
): Promise<CotizacionResult> {
  await new Promise((r) => setTimeout(r, 300));
  const data = mockCotizaciones[sigla.toUpperCase()];
  if (!data) return { success: false, error: "not_found" };
  return { success: true, data };
}

// ─── Helpers de formato ──────────────────────────────────────────────
export function formatCotizacion(value: number): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
