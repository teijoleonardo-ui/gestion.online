/**
 * Tipos de retención permitidos por contratante en la carga de comprobantes.
 * La sigla debe coincidir con `CONTRATANTES[].sigla` en minúsculas (valor del <Select>).
 */
import type { TipoRetencionValue } from "@/lib/extractRetencion";

export const TIPOS_PERMITIDOS_POR_CONTRATANTE: Record<string, TipoRetencionValue[]> = {
  apc: ["ganancias", "iva", "suss", "ibb_caba"],
  one: ["ganancias", "iva", "suss", "ibb_caba", "ibb_arba", "ibb_mendoza"],
  zim: ["ganancias", "iva", "suss", "ibb_caba", "ibb_arba"],
  ym: ["ganancias", "iva", "suss", "ibb_caba"],
  hmm: ["ganancias", "iva", "suss", "ibb_caba", "ibb_arba"],
  ami: [
    "ganancias",
    "iva",
    "suss",
    "ibb_caba",
    "ibb_arba",
    "ibb_mendoza",
    "ibb_santa_fe",
    "ibb_rio_negro",
    "ibb_cordoba",
    "ibb_misiones",
  ],
  sdc: [
    "ganancias",
    "iva",
    "suss",
    "ibb_caba",
    "ibb_arba",
    "ibb_mendoza",
    "ibb_santa_fe",
    "ibb_rio_negro",
    "ibb_cordoba",
    "ibb_misiones",
  ],
  cn: ["ganancias", "iva", "suss"],
};

/** Catálogo completo en orden de listado (filtrado por contratante en el formulario). */
export const RETENCIONES_TIPOS_CATALOGO: { value: TipoRetencionValue; label: string }[] = [
  { value: "ganancias", label: "Ganancias" },
  { value: "iva", label: "IVA" },
  { value: "suss", label: "SUSS" },
  { value: "ibb_caba", label: "IIBB CABA" },
  { value: "ibb_arba", label: "IIBB ARBA" },
  { value: "ibb_mendoza", label: "IIBB Mendoza" },
  { value: "ibb_santa_fe", label: "IIBB Santa Fe" },
  { value: "ibb_rio_negro", label: "IIBB Río Negro" },
  { value: "ibb_cordoba", label: "IIBB Córdoba" },
  { value: "ibb_misiones", label: "IIBB Misiones" },
];

/** Siglas (minúsculas) con reglas de retención en esta pantalla. */
export const CONTRATANTES_CON_RETENCIONES = new Set(Object.keys(TIPOS_PERMITIDOS_POR_CONTRATANTE));

export function tiposRetencionParaContratante(siglaLower: string): { value: TipoRetencionValue; label: string }[] {
  const permitidos = TIPOS_PERMITIDOS_POR_CONTRATANTE[siglaLower];
  if (!permitidos?.length) return [];
  const set = new Set(permitidos);
  return RETENCIONES_TIPOS_CATALOGO.filter((t) => set.has(t.value));
}
