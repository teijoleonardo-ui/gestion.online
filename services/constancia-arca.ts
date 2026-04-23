// Servicio de Constancia de Inscripción ARCA (ex-AFIP).
//
// ── Contexto ─────────────────────────────────────────────────────────
// El sitio público de ARCA (https://seti.afip.gob.ar/padron-puc-constancia-internet/)
// NO permite embeber la constancia en un iframe (usa X-Frame-Options:
// SAMEORIGIN) ni tampoco se puede scrapear directamente porque ARCA
// introdujo un CAPTCHA obligatorio antes de devolver los datos.
//
// Para mostrar los datos estructurados en nuestra tarjeta (columna
// derecha de la sección "Carta de Garantía") hay dos caminos reales:
//
// 1) Web Service oficial de ARCA (`ws_sr_constancia_inscripcion`).
//    - Requiere certificado digital X.509 emitido con clave fiscal
//      nivel 3 de la empresa.
//    - Habilitar el servicio desde el "Administrador de Relaciones" del
//      portal ARCA para la CUIT de la empresa.
//    - Implementar WSAA (firma PKCS7 de un TRA, obtener token+sign con
//      TTL de 12h, cachear) y consumir SOAP del padrón alcance 4/5/10/13.
//    - Gratis, oficial. Devuelve razón social, domicilio fiscal,
//      actividad principal, estado del CUIT, impuestos inscriptos,
//      monotributo, etc.
//
// 2) SDK de terceros (Afip SDK / Arca SDK).
//    - API REST simple: POST https://app.afipsdk.com/api/v1/afip/requests
//      con `Authorization: Bearer <TOKEN>`.
//    - Dev gratis con CUITs de prueba, producción pago + requiere
//      igualmente el certificado de la empresa vinculado.
//    - Integración mucho más rápida que WSAA manual.
//
// ── Cómo enchufar este service ───────────────────────────────────────
// Reemplazar `fetchConstanciaArca` para que llame a un endpoint propio
// (ej: `GET /api/constancia-arca/:cuit`) o directamente al SDK elegido.
// El shape de la respuesta ya está tipado en `ConstanciaArca` para que
// no haya que tocar el componente que la consume.

export interface ConstanciaArca {
  cuit: string;
  /** Razón social (persona jurídica) o apellido + nombre (persona física). */
  razonSocial: string;
  /** Domicilio fiscal en una sola línea (o concatenado). */
  domicilioFiscal?: string;
  /** Actividad principal según F.883 (código + descripción). */
  actividadPrincipal?: string;
  /** Estado del CUIT ante ARCA (ej: "Activo", "Limitado", "Inactivo"). */
  estado?: string;
  /** Impuestos/regímenes a los que está inscripto. */
  impuestos?: string[];
  /** Fecha de inscripción (ISO 8601). */
  fechaInscripcion?: string;
  /** Categoría de monotributo si aplica (ej: "A", "B", ...). */
  monotributoCategoria?: string;
}

export interface ConstanciaArcaResult {
  success: boolean;
  data?: ConstanciaArca;
  error?: "not_found" | "unauthorized" | "unknown";
}

/**
 * Consulta la constancia de inscripción de ARCA para el CUIT indicado.
 *
 * Hoy devuelve `error: "unknown"` porque todavía no está conectado al
 * backend real. Cuando el backend esté listo, reemplazar el cuerpo por:
 *
 *   const res = await fetch(`/api/constancia-arca/${cuit}`, { cache: "no-store" });
 *   if (res.status === 404) return { success: false, error: "not_found" };
 *   if (!res.ok) return { success: false, error: "unknown" };
 *   return { success: true, data: (await res.json()) as ConstanciaArca };
 */
export async function fetchConstanciaArca(
  cuit: string
): Promise<ConstanciaArcaResult> {
  void cuit;
  return { success: false, error: "unknown" };
}

/** URL pública de ARCA para abrir la constancia en una pestaña nueva. */
export function buildArcaPublicUrl(cuit: string): string {
  return `https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do?cuitConsulta=${cuit}`;
}
