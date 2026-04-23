// Fuente única de contratantes / armadores para todo el dashboard.
// Se usan en:
//   - app/dashboard/page.tsx          (grid con logos)
//   - app/dashboard/retenciones/page.tsx (select + detección desde la orden de pago)
// Agregar/remover acá impacta a ambos lugares.

export type Contratante = {
  id: number;
  sigla: string;
  nombre: string;
  /** Asset en /public: colores originales; escala de grises hasta hover (CSS). */
  logoSrc: string;
};

export const CONTRATANTES: Contratante[] = [
  { id: 1, sigla: "ZIM", nombre: "Star Shipping Argentina", logoSrc: "/logos/zim.svg" },
  { id: 2, sigla: "ONE", nombre: "Ocean Network Express Arg.", logoSrc: "/logos/one.svg" },
  { id: 3, sigla: "HMM", nombre: "Brings Austral", logoSrc: "/logos/hmm.svg" },
  { id: 4, sigla: "CN", nombre: "Consultora Núcleo", logoSrc: "/logos/cn.png" },
  { id: 5, sigla: "YM", nombre: "Yang Ming Argentina", logoSrc: "/logos/yml.svg" },
  { id: 6, sigla: "APC", nombre: "Administrative Processing Center", logoSrc: "/logos/apc.svg" },
  { id: 7, sigla: "SDC", nombre: "Agencia Marítima Sudocean", logoSrc: "/logos/sdc.svg" },
  { id: 8, sigla: "AMI", nombre: "Agencia Marítima Internacional", logoSrc: "/logos/ami.png" },
  { id: 9, sigla: "APM", nombre: "Terminal 4 - APM Terminals", logoSrc: "/logos/apm.svg" },
  { id: 10, sigla: "PIL", nombre: "PIL by AMI", logoSrc: "/logos/pil.png" },
];

/**
 * Busca un contratante a partir de un texto arbitrario (por ejemplo, el nombre
 * del PDF o el texto de la orden de pago). Hace matching case-insensitive contra
 * la sigla y algunas palabras del nombre.
 *
 * Devuelve la sigla en minúsculas como `value` (para usar con el <Select>) o
 * `null` si no encuentra nada.
 */
export function detectContratante(hay: string): string | null {
  const s = hay.toLowerCase();

  // Keywords específicos por contratante (siglas + nombres comerciales).
  const keywords: Record<string, string[]> = {
    zim: ["zim", "star shipping"],
    one: ["one ", "one.", "one_", "one-", "ocean network"],
    hmm: ["hmm", "brings austral"],
    cn: ["consultora nucleo", "consultora núcleo", " cn ", "-cn-", "_cn_"],
    ym: ["yang ming", " ym ", "-ym-", "_ym_", "yml"],
    apc: ["apc", "administrative processing"],
    sdc: ["sdc", "sudocean"],
    ami: ["ami", "agencia maritima internacional", "agencia marítima internacional"],
    apm: ["apm", "terminal 4", "apm terminals"],
    pil: ["pil by ami", " pil ", "-pil-", "_pil_", "pil."],
  };

  for (const [sigla, words] of Object.entries(keywords)) {
    if (words.some((w) => s.includes(w))) return sigla;
  }
  return null;
}
