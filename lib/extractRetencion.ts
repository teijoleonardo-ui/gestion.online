// Extracción de certificados de retención con pdf.js (browser, sin API keys).
//
// Este módulo:
//  1. Lee el texto del PDF con pdfjs-dist.
//  2. Lo divide en "sección del agente" (quien aplica la retención) y
//     "sección del sujeto retenido" (la empresa del usuario a la que se le
//     retuvo el pago).
//  3. Normaliza todo al schema que usa el formulario
//     (`app/dashboard/retenciones/page.tsx`):
//        fecha        → YYYY-MM-DD
//        cuitEmisor   → 11 dígitos sin guiones · CUIT del SUJETO RETENIDO
//                       (tu empresa, quien "emite" este comprobante hacia APC)
//        contratante  → sigla en minúsculas (debe existir en lib/contratantes.ts)
//                       · coincide con el AGENTE de retención (el armador que pagó)
//        numero       → 10 dígitos con ceros a la izquierda
//        tipo         → 'iva' | 'ganancias' | 'ibb_caba' | 'ibb_arba' | 'suss'
//
// Para PDFs escaneados (imagen), pdf.js no puede extraer texto. En ese caso
// devuelve `{ ok: false, reason: 'scanned' }` y el formulario se deja en blanco
// para que el usuario complete a mano.

import { CONTRATANTES, detectContratante } from "@/lib/contratantes";

// pdf.js se importa de forma dinámica dentro de `extractRetencionFromPDF`
// para evitar ejecutar nada durante el SSR de Next.js (el componente que llama
// a esta función ya es `"use client"`, pero el archivo igual se incluye en el
// bundle de servidor y pdf.js no tolera algunos entornos Node).
const PDFJS_WORKER_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfjsReady: Promise<typeof import("pdfjs-dist")> | null = null;
async function loadPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("pdf.js solo puede usarse en el navegador");
  }
  if (!pdfjsReady) {
    pdfjsReady = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
      return mod;
    });
  }
  return pdfjsReady;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────
export type TipoRetencionValue =
  | "iva"
  | "ganancias"
  | "ibb_caba"
  | "ibb_arba"
  | "suss";

export interface ExtractedRetencion {
  fecha: string;
  cuitEmisor: string;
  contratante: string;
  numero: string;
  tipo: TipoRetencionValue | "";
}

/**
 * Datos crudos leídos del PDF — útil para debug / logging / features futuras
 * (importes, alícuota, orden de pago, etc. que hoy no mostramos en el form).
 *
 * `agente*`   = quien aplica la retención (el armador, en nuestro negocio).
 * `retenido*` = el sujeto al que se le retuvo el pago (tu empresa).
 */
export interface RawRetencion {
  fechaComprobante: string;
  agenteRazonSocial: string;
  agenteCuit: string;
  retenidoRazonSocial: string;
  retenidoCuit: string;
  numeroCertificado: string;
  tipoRetencion: string;
  alicuota: string;
  importeSujeto: string;
  retencionTotal: string;
  ordenPago: string;
}

export type ExtractionResult =
  | { ok: true; data: ExtractedRetencion; raw: RawRetencion; rawText: string; filled: number }
  | { ok: false; reason: "scanned" | "parse_error" | "empty"; rawText: string };

// ─── API pública ──────────────────────────────────────────────────────────────
export async function extractRetencionFromPDF(
  file: File,
): Promise<ExtractionResult> {
  let rawText = "";
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let full = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ");
      full += pageText + "\n";
    }
    rawText = full.trim();
  } catch {
    return { ok: false, reason: "parse_error", rawText };
  }

  // PDF escaneado: el texto seleccionable es ~nulo.
  if (rawText.length < 80) {
    return { ok: false, reason: "scanned", rawText };
  }

  try {
    const raw = parseRetencionText(rawText);
    const data = mapToInternalSchema(raw, rawText);
    const filled = Object.values(data).filter((v) => String(v).trim() !== "").length;
    return { ok: true, data, raw, rawText, filled };
  } catch {
    return { ok: false, reason: "parse_error", rawText };
  }
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

/** "30546689979" → "30-54668997-9" (sólo para mostrar en el input). */
export function formatCuit(raw: string): string {
  const d = (raw ?? "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

/** "1.108.000,00" → 1108000 (para importes en formato argentino). */
export function parseArgentineFloat(raw: string): number {
  const s = (raw ?? "").trim();
  if (/\d\.\d{3}/.test(s) || /\d,\d{2}$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(s.replace(",", "."));
}

// ─── Split agente / retenido ──────────────────────────────────────────────────
// Separadores habituales que marcan el inicio de la sección del sujeto retenido.
// Lo que queda ANTES de cualquiera de estos es la sección del agente.
// IMPORTANTE: los patrones están ordenados de más específico a más amplio.
const RETAINED_SECTION_PATTERNS = [
  /CONTRIBUYENTE\s+SUJETO\s+A\s+RETENCI[OÓ]N/i,
  /SUJETO\s+(?:A\s+)?RETENCI[OÓ]N/i,
  /RAZ[OÓ]N\s+SOCIAL\s+DEL\s+(?:SUJETO|CONTRIBUYENTE|RETENIDO)/i,
  /DATOS\s+DEL\s+(?:SUJETO\s+RETENIDO|CONTRIBUYENTE)/i,
  /\bRETENIDO\b/i,
  /\bCONTRIBUYENTE\b/i,
] as const;

function splitAgentFromRetained(text: string): { agent: string; retained: string } {
  for (const sep of RETAINED_SECTION_PATTERNS) {
    const idx = text.search(sep);
    if (idx > 0) {
      return { agent: text.slice(0, idx), retained: text.slice(idx) };
    }
  }
  return { agent: text, retained: "" };
}

// ─── Parsing interno ──────────────────────────────────────────────────────────
function parseRetencionText(text: string): RawRetencion {
  const { agent, retained } = splitAgentFromRetained(text);

  return {
    fechaComprobante: extractFecha(text),
    agenteRazonSocial: extractRazonSocial(agent),
    agenteCuit: extractCuit(agent) || extractFirstCuit(text),
    retenidoRazonSocial: extractRazonSocial(retained),
    retenidoCuit: extractCuit(retained) || extractSecondCuit(text),
    numeroCertificado: extractNumeroCertificado(text),
    tipoRetencion: extractTipoRetencion(text),
    alicuota: extractAlicuota(text),
    importeSujeto: extractImporteSujeto(text),
    retencionTotal: extractRetencionTotal(text),
    ordenPago: extractOrdenPago(text),
  };
}

function extractFecha(text: string): string {
  const patterns = [
    /el\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    /fecha[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return "";
}

/** Extrae el primer CUIT del texto (11 dígitos, con o sin guiones/espacios). */
function extractCuit(text: string): string {
  if (!text) return "";
  const m = text.match(
    /(?:CUIT|C\.U\.I\.T\.?)[:\s]+(\d{2}[-\s]?\d{8}[-\s]?\d)/i,
  );
  if (m) return m[1].replace(/[-\s]/g, "");
  const m2 = text.match(/\b(\d{2}-\d{8}-\d)\b/);
  if (m2) return m2[1].replace(/-/g, "");
  const m3 = text.match(/\b(\d{11})\b/);
  if (m3) return m3[1];
  return "";
}

function extractFirstCuit(text: string): string {
  return extractCuit(text);
}

function extractSecondCuit(text: string): string {
  const all: string[] = [];
  for (const m of text.matchAll(
    /(?:CUIT|C\.U\.I\.T\.?)[:\s]+(\d{2}[-\s]?\d{8}[-\s]?\d)/gi,
  )) {
    all.push(m[1].replace(/[-\s]/g, ""));
  }
  if (all.length >= 2) return all[1];
  const bare: string[] = [];
  for (const m of text.matchAll(/\b(\d{2}-\d{8}-\d)\b/g)) bare.push(m[1].replace(/-/g, ""));
  if (bare.length >= 2) return bare[1];
  return "";
}

/**
 * Extrae la razón social de una sección. Busca una cadena en MAYÚSCULAS que
 * termine con un sufijo societario típico argentino (S.A., S.R.L., S.A.S.,
 * S.C.A., S.C.S., etc.). Esto es robusto incluso cuando pdf.js separa el
 * label ("Razón social:") del valor por culpa del layout visual.
 */
function extractRazonSocial(text: string): string {
  if (!text) return "";

  // Primer intento: respeta el label "Razón social:" si está seguido
  // directamente por el nombre.
  const labelled = text.match(
    /Raz[oó]n\s+[Ss]ocial[:\s]+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ0-9&.\-, ]{3,}?(?:\s(?:S\.?\s*A\.?(?:\s*S\.?)?|S\.?\s*R\.?\s*L\.?|S\.?\s*C\.?\s*[AS]\.?)\.?))/,
  );
  if (labelled) return cleanCompanyName(labelled[1]);

  // Segundo intento: cualquier secuencia tipo "XYZ S.A." / "XYZ S.R.L." que
  // aparezca en el texto.
  const anyCompany = text.match(
    /\b([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&.\-]*(?:\s+[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&.\-]*){0,6}\s+(?:S\.?\s*A\.?(?:\s*S\.?)?|S\.?\s*R\.?\s*L\.?|S\.?\s*C\.?\s*[AS]\.?))\b/,
  );
  if (anyCompany) return cleanCompanyName(anyCompany[1]);

  return "";
}

function cleanCompanyName(s: string): string {
  return s.trim().replace(/\s{2,}/g, " ");
}

function extractNumeroCertificado(text: string): string {
  const m = text.match(/(?:Certificado\s*(?:N[°ºo]\.?|No\.?)?)[:\s]*(\d+)/i);
  if (m) return m[1];
  return "";
}

/**
 * Detecta el tipo de retención con una lógica por puntaje para desambiguar
 * IBB ARBA vs IBB CABA. Se ignoran deliberadamente las palabras "CABA" y
 * "Ciudad de Buenos Aires" como marcadores por sí solas, porque aparecen en
 * direcciones postales incluso en certificados de ARBA (los domicilios
 * comerciales están típicamente en Capital).
 *
 * Sólo se consideran marcadores INSTITUCIONALES.
 */
function extractTipoRetencion(text: string): string {
  const arbaMarkers = [
    /\bARBA\b/gi,
    /GOBIERNO\s+DE\s+LA\s+PROVINCIA\s+DE\s+BUENOS\s+AIRES/gi,
    /AGENCIA\s+DE\s+RECAUDACI[OÓ]N\s+DE\s+LA\s+PROVINCIA/gi,
    /PROVINCIA\s+DE\s+BUENOS\s+AIRES/gi,
  ];
  const cabaMarkers = [
    /\bAGIP\b/gi,
    /\bGCBA\b/gi,
    /GOBIERNO\s+DE\s+LA\s+CIUDAD(?:\s+AUT[OÓ]NOMA)?\s+DE\s+BUENOS\s+AIRES/gi,
    /ADMINISTRACI[OÓ]N\s+GUBERNAMENTAL\s+DE\s+INGRESOS\s+P[UÚ]BLICOS/gi,
  ];
  const countMatches = (patterns: RegExp[]) =>
    patterns.reduce((n, r) => n + (text.match(r)?.length ?? 0), 0);

  const arbaScore = countMatches(arbaMarkers);
  const cabaScore = countMatches(cabaMarkers);
  const hasIibb = /INGRESOS\s+BRUTOS|\bIIBB\b|\bIIB\b/i.test(text);

  if (hasIibb || arbaScore > 0 || cabaScore > 0) {
    if (arbaScore > cabaScore) return "IIBB_ARBA";
    if (cabaScore > arbaScore) return "IIBB_CABA";
    return "IIBB"; // empate → se decide abajo en mapTipo (conservador)
  }

  if (/GANANCIAS/i.test(text)) return "GANANCIAS";
  if (/\bSUSS\b|SEGURIDAD\s+SOCIAL|\bSICOSS\b/i.test(text)) return "SUSS";

  // IVA sólo con títulos explícitos — en certificados de IIBB la palabra "IVA"
  // aparece en los importes ("IVA: 0,00") y no debe usarse como matcher.
  if (
    /RETENCI[OÓ]N\s+DE\s+IVA/i.test(text) ||
    /IMPUESTO\s+AL\s+VALOR\s+AGREGADO/i.test(text) ||
    /R\.?\s*G\.?\s*\d+.{0,40}IVA\b/i.test(text) ||
    /CERTIFICADO\s+DE\s+RETENCI[OÓ]N\s+.{0,30}IVA/i.test(text)
  ) {
    return "IVA";
  }

  return "";
}

function extractAlicuota(text: string): string {
  const m =
    text.match(/[Aa]l[íi]cuota[:\s]+([\d,.]+)\s*%/i) ||
    text.match(/([\d,.]+)\s*%/);
  if (m) return String(parseArgentineFloat(m[1]));
  return "";
}

function extractImporteSujeto(text: string): string {
  const m = text.match(
    /[Ii]mporte\s+sujeto\s+a\s+retenci[oó]n[:\s]+([\d.,]+)/i,
  );
  if (m) return String(Math.round(parseArgentineFloat(m[1])));
  return "";
}

function extractRetencionTotal(text: string): string {
  const m = text.match(/[Rr]etenci[oó]n\s+total[:\s]+([\d.,]+)/i);
  if (m) return String(Math.round(parseArgentineFloat(m[1])));
  return "";
}

function extractOrdenPago(text: string): string {
  const m = text.match(/[Oo]rden\s+de\s+[Pp]ago\s+(?:N[°ºo]\.?\s*)?(\d[\d-]+)/i);
  return m ? m[1] : "";
}

// ─── Mapeo crudo → schema interno ─────────────────────────────────────────────
//
// IMPORTANTE — mapeo de CUIT:
//   certificado.agenteCuit     → aparece en app como `contratante` (vía sigla)
//   certificado.retenidoCuit   → aparece en app como `cuitEmisor`
//
// En el negocio, el "emisor" del comprobante hacia APC es la empresa del
// usuario (= retenido del certificado), y el "contratante" es el armador que
// aplicó la retención (= agente del certificado).
function mapToInternalSchema(
  raw: RawRetencion,
  fullText: string,
): ExtractedRetencion {
  return {
    fecha: toIsoDate(raw.fechaComprobante),
    cuitEmisor: raw.retenidoCuit.replace(/\D/g, "").slice(0, 11),
    contratante:
      matchContratante(raw.agenteRazonSocial, raw.agenteCuit, fullText) ?? "",
    numero: padNumero10(raw.numeroCertificado),
    tipo: mapTipo(raw.tipoRetencion),
  };
}

function toIsoDate(dmY: string): string {
  if (!dmY) return "";
  const m = dmY.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!m) return "";
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function padNumero10(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "").slice(0, 10);
  return digits ? digits.padStart(10, "0") : "";
}

function mapTipo(raw: string): TipoRetencionValue | "" {
  switch (raw) {
    case "IVA":
      return "iva";
    case "GANANCIAS":
      return "ganancias";
    case "IIBB_CABA":
      return "ibb_caba";
    case "IIBB_ARBA":
      return "ibb_arba";
    case "IIBB":
      return ""; // empate de marcadores → mejor que elija el usuario
    case "SUSS":
      return "suss";
    default:
      return "";
  }
}

/**
 * Mapea la razón social del AGENTE de retención a una sigla del catálogo
 * interno (`CONTRATANTES` en `lib/contratantes.ts`).
 *
 * Estrategia (de más específica a más amplia):
 *   1. `detectContratante` sobre la razón social del agente.
 *   2. `detectContratante` sobre "{razonSocial} {cuitAgente}".
 *   3. Inclusión normalizada de la razón social del agente contra los nombres
 *      del catálogo.
 *   4. `detectContratante` sobre TODO el texto del PDF.
 *   5. Inclusión normalizada de cada nombre del catálogo contra el texto
 *      completo del PDF.
 *   6. Si nada matchea, null → el usuario selecciona manualmente.
 */
function matchContratante(
  razonSocial: string,
  cuitAgente: string,
  fullText: string,
): string | null {
  const direct = detectContratante(razonSocial);
  if (direct) return direct;

  if (cuitAgente) {
    const alt = detectContratante(`${razonSocial} ${cuitAgente}`);
    if (alt) return alt;
  }

  const rs = normalize(razonSocial);
  if (rs) {
    for (const c of CONTRATANTES) {
      const nombre = normalize(c.nombre);
      if (nombre && (rs.includes(nombre) || nombre.includes(rs))) {
        return c.sigla.toLowerCase();
      }
    }
  }

  const fromFull = detectContratante(fullText);
  if (fromFull) return fromFull;

  const fullNorm = normalize(fullText);
  if (fullNorm) {
    for (const c of CONTRATANTES) {
      const nombre = normalize(c.nombre);
      if (nombre && fullNorm.includes(nombre)) return c.sigla.toLowerCase();
    }
  }

  return null;
}

function normalize(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
