/**
 * Tipos y helpers para el detalle de conceptos en consulta de gastos (BL).
 * El backend puede mapear su DTO a {@link GastoConcepto} y asignar el array en estado.
 */

export type GastoConceptoTipo = "Armador" | "Agencia";

export type GastoConceptoMoneda = "USD" | "ARS";

/**
 * Línea de detalle como en la web actual (modal de conceptos).
 * En consulta de gastos los importes se muestran en USD; `moneda` debería ser `"USD"` en el payload.
 */
export type GastoConcepto = {
  id: string;
  cuit: string;
  razonSocial: string;
  /** Código de concepto (ej. ECD, BLF). */
  codigoConcepto: string;
  comprobante: string;
  /** Número de contenedor o "0" si no aplica. */
  contenedor: string;
  descripcion: string;
  neto: number;
  /** Fecha ISO (yyyy-mm-dd) o cadena vacía si no aplica. */
  fecha: string;
  tipo: GastoConceptoTipo;
  moneda: GastoConceptoMoneda;
};

/**
 * Forma sugerida de payload de respuesta; ajustar al contrato real del servicio
 * (ej. GET /consultas/gastos?bl=…&contratante=…).
 */
export type ConsultaGastosApiResponse = {
  bl: string;
  conceptos: GastoConcepto[];
};

export function sumarConceptosPorTipoYMoneda(
  conceptos: GastoConcepto[],
  tipo: GastoConceptoTipo,
  moneda: GastoConceptoMoneda,
): number {
  return conceptos
    .filter((g) => g.tipo === tipo && g.moneda === moneda)
    .reduce((s, g) => s + g.neto, 0);
}

export function totalesPorMoneda(conceptos: GastoConcepto[]): {
  usd: number;
  ars: number;
} {
  return {
    usd: conceptos.filter((g) => g.moneda === "USD").reduce((s, g) => s + g.neto, 0),
    ars: conceptos.filter((g) => g.moneda === "ARS").reduce((s, g) => s + g.neto, 0),
  };
}

const MOCK_CUIT = "30701233820";
const MOCK_RAZON = "KIOSHI SA";
const MOCK_COMPROBANTE = "FACTURA RECIBO";
const MOCK_CONTENEDOR = "KOCU4557752";

function row(
  id: string,
  codigo: string,
  descripcion: string,
  neto: number,
  contenedor: string,
  tipo: GastoConceptoTipo,
  moneda: GastoConceptoMoneda,
  fecha = "",
): GastoConcepto {
  return {
    id,
    cuit: MOCK_CUIT,
    razonSocial: MOCK_RAZON,
    codigoConcepto: codigo,
    comprobante: MOCK_COMPROBANTE,
    contenedor,
    descripcion,
    neto,
    fecha,
    tipo,
    moneda,
  };
}

/** Filas alineadas al ejemplo operativo (misma estructura que la web actual). */
const FILAS_EJEMPLO: GastoConcepto[] = [
  row("1", "ECD", "EQUIPMENT CONDITION", 35, MOCK_CONTENEDOR, "Armador", "USD"),
  row("2", "BLF", "BILL OF LADING FEE", 70, "0", "Armador", "USD"),
  row("3", "LOG", "LOGISTIC FEE", 55.5, MOCK_CONTENEDOR, "Agencia", "USD"),
  row("4", "AUT", "AUTORIZACION DE ENTREGA", 101, MOCK_CONTENEDOR, "Agencia", "USD"),
  row("5", "THD", "TERMINAL HANDLING DESTINATION", 128.25, "0", "Armador", "USD"),
  row("6", "DOC", "DOCUMENTATION FEE", 42, MOCK_CONTENEDOR, "Agencia", "USD"),
  row("7", "ISPS", "ISPS SECURITY CHARGE", 18.9, "0", "Armador", "USD"),
  row("8", "VGM", "VERIFIED GROSS MASS", 33, MOCK_CONTENEDOR, "Armador", "USD", "2025-04-12"),
];

const ARMADOR_USD_NOMBRES = [
  "THC Destino",
  "THC Origen",
  "Seal Fee / Sellos",
  "Equipment Imbalance",
  "Cleaning / Limpieza contenedor",
  "Storage / Almacenaje",
  "Currency adjustment",
  "BAF / Bunker",
  "CAF",
  "Manifest correction",
  "Amendment fee",
  "Telex release",
  "Express release",
  "Switch B/L fee",
  "Heavy lift",
  "Oversize",
  "Reefer plug-in",
  "Monitoring",
  "Customs hold release",
  "Line detention",
];

const AGENCIA_USD_NOMBRES = [
  "Gate In",
  "Gate Out",
  "Derecho de Importación",
  "Handling",
  "THC Agencia",
  "Port charges",
  "Documentation agencia",
  "Courier / Mensajería",
  "Certificación",
  "Inspección SENASA",
  "Coordinación despacho",
  "Gastos locales USD",
  "Agency fee",
  "Communication",
  "Operational surcharge",
];

/** Conceptos agencia adicionales; importes siempre en USD (misma moneda en toda la consulta). */
const AGENCIA_EXTRA_USD_NOMBRES = [
  "Verificación",
  "Gastos administrativos agencia",
  "Honorarios gestión",
  "Sellados ARBA",
  "Tasas locales",
  "Traslado documentación",
  "Almacenaje fiscal",
  "Gestión AFIP",
];

function codigoDesdeNombre(nombre: string, i: number): string {
  const parts = nombre
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((p) => p.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "").slice(0, 1));
  const prefix = parts.join("").toUpperCase().slice(0, 3) || "C";
  return `${prefix}${i + 1}`;
}

/** Lista extensa solo para desarrollo / demo. En producción: `response.conceptos`. */
export function getMockConceptosConsulta(): GastoConcepto[] {
  const out: GastoConcepto[] = [...FILAS_EJEMPLO];
  let seq = FILAS_EJEMPLO.length + 1;
  const id = () => String(seq++);

  ARMADOR_USD_NOMBRES.forEach((descripcion, i) => {
    out.push(
      row(
        id(),
        codigoDesdeNombre(descripcion, i),
        descripcion.toUpperCase(),
        Math.round((45 + i * 17.5 + (i % 4) * 12.25) * 100) / 100,
        i % 2 === 0 ? MOCK_CONTENEDOR : "0",
        "Armador",
        "USD",
        i % 5 === 0 ? "2025-04-20" : "",
      ),
    );
  });

  AGENCIA_USD_NOMBRES.forEach((descripcion, i) => {
    out.push(
      row(
        id(),
        codigoDesdeNombre(descripcion, i + 40),
        descripcion.toUpperCase(),
        Math.round((30 + i * 22.1 + (i % 3) * 9.9) * 100) / 100,
        i % 3 === 0 ? MOCK_CONTENEDOR : "0",
        "Agencia",
        "USD",
        "",
      ),
    );
  });

  AGENCIA_EXTRA_USD_NOMBRES.forEach((descripcion, i) => {
    out.push(
      row(
        id(),
        codigoDesdeNombre(descripcion, i + 80),
        descripcion.toUpperCase(),
        Math.round((38 + i * 21.25 + (i % 4) * 7.5) * 100) / 100,
        "0",
        "Agencia",
        "USD",
        "",
      ),
    );
  });

  return out;
}
