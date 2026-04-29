"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Download,
  AlertCircle,
  Ship,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CotizacionDialog } from "@/components/cotizacion/cotizacion-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { flashSectionSpotlightAfterScroll } from "@/lib/section-spotlight";
import {
  type GastoConcepto,
  type GastoConceptoTipo,
  getMockConceptosConsulta,
  sumarConceptosPorTipoYMoneda,
  totalesPorMoneda,
} from "@/lib/consultaGastosTipos";
import { dispatchCartAdded } from "@/lib/cart-events";

type FiltroConceptosModal = "todos" | GastoConceptoTipo;

function formatFechaConcepto(fecha: string): string {
  const t = fecha.trim();
  if (!t) return "—";
  const d = new Date(`${t}T12:00:00`);
  return Number.isNaN(d.getTime()) ? t : d.toLocaleDateString("es-AR");
}

/** Metadatos de respuesta (mock); con API real vendrían del backend. */
const mockResultadoComún = {
  tipoFactura: "FACTURA RECIBO",
  razonSocialFacturacion: "RHENUS LOGISTICS ARGENTINA S.A.",
  cuitFacturacionFallback: "30715632663",
  buque: "XIN CHANG SHA 412S",
  observaciones:
    "El bill of lading está disponible para retirar. No te olvides de llevar la boleta impresa.",
} as const;

type FormOpcion =
  | "exportacion"
  | "importacion"
  | "demora"
  | "cancelacion_cuenta_corriente"
  | "comprar_certificados"
  | "certificados_asociados"
  | "certificados_disponibles"
  | "drafts_generados";

type FieldKey =
  | "cuitFacturar"
  | "bl"
  | "impresionBL"
  | "certFlete"
  | "nroContenedor"
  | "fecha"
  | "cuitCancelarFacturas"
  | "cantidadCertificados";

type KnowBoxSection = {
  heading?: string;
  paragraphs: string[];
};

type ContratanteConfig = {
  title: string;
  subtitle: string;
  contactLines: string[];
  brand: string;
  logoSrc?: string;
  /** Clase tailwind para el fondo del contenedor del logo. Default: `bg-white`. */
  logoBg?: string;
  /** Opciones habilitadas en el <Select>. Si se omite, se muestran todas. */
  opciones?: FormOpcion[];
  /** Campos a pedir para cada opción. Si se omite, se usa el layout por defecto (ZIM-like). */
  fieldsByOpcion?: Partial<Record<FormOpcion, FieldKey[]>>;
  /** Párrafos para la sección "Cosas que tenés que saber". Default: textos ZIM-like. */
  knowBoxParagraphs?: string[];
  /** Alternativa a `knowBoxParagraphs`: permite sub-títulos con párrafos agrupados. */
  knowBoxSections?: KnowBoxSection[];
  /** Si es `true`, no se muestra el botón "Cotización del día". */
  hideCotizacion?: boolean;
};

const DEFAULT_FIELDS_BY_OPCION: Record<FormOpcion, FieldKey[]> = {
  exportacion: ["cuitFacturar", "bl", "impresionBL"],
  importacion: ["bl", "certFlete"],
  demora: ["bl", "nroContenedor", "fecha"],
  cancelacion_cuenta_corriente: ["bl"],
  comprar_certificados: ["cuitFacturar", "cantidadCertificados"],
  certificados_asociados: [],
  certificados_disponibles: [],
  drafts_generados: [],
};

const ALL_OPCIONES: FormOpcion[] = [
  "exportacion",
  "importacion",
  "demora",
  "cancelacion_cuenta_corriente",
];

// ─── Formularios reutilizables ───────────────────────────────────────
// El grupo HMM / YM / SDC / AMI / PIL comparte exactamente el mismo
// formulario (Importación, Exportación, Demora) con los mismos campos.
const FIELDS_GRUPO_ESTANDAR: Partial<Record<FormOpcion, FieldKey[]>> = {
  importacion: ["bl", "certFlete"],
  exportacion: ["bl"],
  demora: ["bl", "nroContenedor", "fecha"],
};

const OPCIONES_GRUPO_ESTANDAR: FormOpcion[] = [
  "importacion",
  "exportacion",
  "demora",
];

// Aviso común a varias agencias.
const NO_CHEQUES_PARAGRAPH =
  "Te recordamos que la agencia no acepta pagos con cheques ni Echeqs. Si necesitás más información o ayuda, estamos acá para asistirte.";

const contratantesConfig: Record<string, ContratanteConfig> = {
  ZIM: {
    title: "Star Shipping Argentina",
    subtitle: "ZIM",
    contactLines: [
      "expodocs@zim.com",
      "impodocs@zim.com",
      "Paraguay 1778 Piso 12°",
      "5199-1390",
    ],
    brand: "ZIM",
    logoSrc: "/logos/zim.svg",
  },
  ONE: {
    title: "Ocean Network Express Argentina",
    subtitle: "ONE",
    contactLines: [
      "ar.booking@one-line.com",
      "Bouchard 557 - 11th Floor",
      "5984-4032",
    ],
    brand: "ONE",
    logoSrc: "/logos/one.svg",
    opciones: ["importacion", "exportacion", "demora"],
    fieldsByOpcion: {
      importacion: ["bl", "certFlete"],
      exportacion: ["bl"],
      demora: ["bl"],
    },
    knowBoxParagraphs: [
      "Si necesitás abonar demoras, recordá que primero tenés que solicitarlo a ONE escribiendo al correo ar.eqc@one-line.com. Una vez que te confirmen el envío del gasto, podrás verificarlo en la web y realizar la transacción.",
      "Es importante tener en cuenta que ONE no emite un nuevo libre deuda, pero en el cuerpo de la factura se indicará la fecha hasta la cual se realizó el pago.",
      "Si tenés alguna duda, no dudes en escribirnos, estamos para ayudarte.",
    ],
  },
  HMM: {
    title: "Brings Austral",
    subtitle: "HMM",
    contactLines: ["25 de Mayo 555 Piso 20 (1002)", "4310-2390"],
    brand: "HMM",
    logoSrc: "/logos/hmm.svg",
    opciones: OPCIONES_GRUPO_ESTANDAR,
    fieldsByOpcion: FIELDS_GRUPO_ESTANDAR,
    knowBoxParagraphs: [
      "Para buscar los BLs de HMM, es importante que contengan el prefijo HDMU.",
      NO_CHEQUES_PARAGRAPH,
    ],
  },
  YM: {
    title: "Yang Ming Argentina",
    subtitle: "YM",
    contactLines: [],
    brand: "YM",
    logoSrc: "/logos/yml.svg",
    opciones: OPCIONES_GRUPO_ESTANDAR,
    fieldsByOpcion: FIELDS_GRUPO_ESTANDAR,
    knowBoxParagraphs: [NO_CHEQUES_PARAGRAPH],
  },
  SDC: {
    title: "Agencia Marítima Sudocean",
    subtitle: "SDC",
    contactLines: ["25 de Mayo 555 19° - (1002)"],
    brand: "SDC",
    logoSrc: "/logos/sdc.svg",
    opciones: OPCIONES_GRUPO_ESTANDAR,
    fieldsByOpcion: FIELDS_GRUPO_ESTANDAR,
    knowBoxParagraphs: [NO_CHEQUES_PARAGRAPH],
  },
  AMI: {
    title: "Agencia Marítima Internacional S.A.",
    subtitle: "AMI",
    contactLines: [],
    brand: "AMI",
    logoSrc: "/logos/ami.png",
    /* Mismo #164e63 que el hover en “Nuestros contratantes”: solo el recuadro del logo. */
    logoBg: "bg-[#164e63] ring-1 ring-white/20 shadow-sm",
    opciones: OPCIONES_GRUPO_ESTANDAR,
    fieldsByOpcion: FIELDS_GRUPO_ESTANDAR,
    knowBoxParagraphs: [NO_CHEQUES_PARAGRAPH],
  },
  PIL: {
    title: "By AMI",
    subtitle: "PIL",
    contactLines: ["25 de Mayo 555 19° - (1002)"],
    brand: "PIL",
    logoSrc: "/logos/pil.png",
    opciones: OPCIONES_GRUPO_ESTANDAR,
    fieldsByOpcion: FIELDS_GRUPO_ESTANDAR,
    knowBoxParagraphs: [NO_CHEQUES_PARAGRAPH],
  },
  CN: {
    title: "Consultora Núcleo",
    subtitle: "CN",
    contactLines: [
      "info@cnucleo.com.ar",
      "Av.Caseros 3563, Distrito Tecnológico",
      "5293-6250",
    ],
    brand: "CN",
    logoSrc: "/logos/cn.png",
    opciones: [
      "comprar_certificados",
      "cancelacion_cuenta_corriente",
      "certificados_asociados",
      "certificados_disponibles",
    ],
    fieldsByOpcion: {
      comprar_certificados: ["cuitFacturar", "cantidadCertificados"],
      cancelacion_cuenta_corriente: ["cuitCancelarFacturas"],
      certificados_asociados: [],
      certificados_disponibles: [],
    },
    knowBoxSections: [
      {
        heading: "Importaciones",
        paragraphs: [
          "En las importaciones, el importador ya conoce la marca y el número del contenedor antes del retiro de la terminal portuaria. Es fundamental asociar el certificado TAP (Transporte Argentino Protegido) antes del retiro del contenedor para que el seguro sea válido. Desde el momento en que se asocia el certificado, el seguro tiene una vigencia de 90 días y cubre el contenedor hasta que este sea devuelto vacío a la terminal. Esto libera al importador de cualquier responsabilidad derivada de la carta de garantía de contenedor, que generalmente exigen las líneas marítimas como requisito para retirar los contenedores del puerto.",
        ],
      },
      {
        heading: "Exportaciones",
        paragraphs: [
          "Por otro lado, en las exportaciones, el exportador generalmente no sabe qué contenedor se le entregará, ya que la línea marítima asigna esta información más tarde. Por ello, es recomendable asociar el certificado TAP tan pronto como se tenga el número y la marca del contenedor, preferentemente antes del retiro del mismo. De esta manera, el seguro estará vigente desde ese momento y cubrirá el contenedor hasta que la carga consolidada regrese al puerto. Al igual que en las importaciones, esta cobertura libera al exportador de cualquier responsabilidad ante un siniestro, ya que estará cubierto desde que se asocia el certificado.",
        ],
      },
      {
        heading: "Resumen",
        paragraphs: [
          "Importaciones: Asociar el certificado TAP antes del retiro del contenedor para una cobertura completa de 90 días.",
          "Exportaciones: Asociar el certificado TAP tan pronto como se conozca el contenedor asignado, idealmente antes del retiro, para asegurar la cobertura completa hasta la devolución del contenedor.",
          "Este proceso asegura que tanto el importador como el exportador estén cubiertos en caso de siniestros y libera de responsabilidades adicionales durante el transporte.",
        ],
      },
    ],
  },
  APC: {
    title: "Administrative Processing Center",
    subtitle: "APC",
    contactLines: [
      "recepcion@gestion-online.com.ar",
      "Avenida Leandro N. Alem 584 Piso 2",
      "5032-5900",
    ],
    brand: "APC",
    logoSrc: "/logos/apc.svg",
    opciones: ["cancelacion_cuenta_corriente"],
    fieldsByOpcion: {
      cancelacion_cuenta_corriente: ["cuitCancelarFacturas"],
    },
    hideCotizacion: true,
    knowBoxSections: [
      {
        paragraphs: [
          "Queremos recordarte cómo funciona la gestión de las facturas en cuenta corriente para facilitar el proceso.",
        ],
      },
      {
        heading: "Cierre y cálculo de períodos:",
        paragraphs: [
          "Las facturas emitidas en cuenta corriente se agrupan en períodos quincenales basados en el mes calendario (no desde la fecha de emisión de la factura).",
          "Al finalizar la primera quincena del mes, se contabilizan las facturas emitidas durante ese período.",
          "De la misma manera, al concluir la segunda quincena del mes, se contabilizan las facturas correspondientes a esa etapa.",
        ],
      },
      {
        heading: "Plazo de pago:",
        paragraphs: [
          "Una vez cerrado el período quincenal, dispones de un plazo de 5 días hábiles para realizar la cancelación de las facturas correspondientes.",
        ],
      },
      {
        heading: "Revisión de cuenta corriente:",
        paragraphs: [
          "Si no se registra el pago dentro del plazo establecido, la cuenta corriente pasará a estado de revisión y suspensión temporal hasta regularizar la situación.",
        ],
      },
      {
        heading: "Cómo realizar el pago:",
        paragraphs: [
          "La cancelación de las facturas en cuenta corriente debe gestionarse directamente a través de nuestra plataforma web. Esto asegura un proceso ágil, seguro y trazable.",
          "Si tenes alguna consulta o necesitas asistencia con la gestión de tus pagos, no dudes en contactarnos al siguiente correo: recepcion@gestion-online.com.ar",
        ],
      },
    ],
  },
  APM: {
    title: "Terminal 4",
    subtitle: "APM",
    contactLines: [
      "recepcion@gestion-online.com.ar",
      "Avenida Leandro N. Alem 584 Piso 2",
      "5032-5900",
    ],
    brand: "APM",
    logoSrc: "/logos/apm.svg",
    opciones: ["exportacion", "importacion", "drafts_generados"],
    fieldsByOpcion: {
      exportacion: ["bl", "nroContenedor", "cuitFacturar"],
      importacion: ["bl", "nroContenedor", "cuitFacturar"],
      drafts_generados: [],
    },
    knowBoxParagraphs: [
      "Te contamos que los pagos de Terminal 4 realizados a través de nuestra plataforma no incluyen retenciones.",
      "Es importante saber que solo se pueden abonar drafts creados directamente en nuestro sistema. Si el draft fue generado desde el Puerto Digital, no podrá ser procesado ni en APC ni con nosotros.",
      "Si generaste un draft desde la web de APM y querés abonarlo con nosotros, podés eliminarlo directamente desde su sistema y luego generarlo nuevamente en nuestra plataforma.",
      "Por último, si planeás abonar con cheque, no dudes en consultarnos para saber a partir de qué monto debe estar certificado. ¡Estamos para ayudarte!",
    ],
  },
  DEFAULT: {
    title: "Gestión Online",
    subtitle: "Consultas",
    contactLines: [],
    brand: "GO",
  },
};

const OPCION_LABELS: Record<FormOpcion, string> = {
  exportacion: "Exportación",
  importacion: "Importación",
  demora: "Demora",
  cancelacion_cuenta_corriente: "Cancelación de cuenta corriente",
  comprar_certificados: "Comprar certificados",
  certificados_asociados: "Certificados asociados",
  certificados_disponibles: "Certificados disponibles",
  drafts_generados: "Drafts generados",
};

function sentidoCargaDesdeOpcion(op: FormOpcion | ""): string {
  if (op === "importacion") return "IMPO";
  if (op === "exportacion") return "EXPO";
  if (op === "demora") return "DEMORAS";
  return "—";
}

export function ConsultaContratantePanel({ contratanteParam }: { contratanteParam: string }) {
  const sigla = contratanteParam.trim().toUpperCase();
  const contratante = contratantesConfig[sigla] ?? contratantesConfig.DEFAULT;

  const [bl, setBl] = useState("");
  const [searched, setSearched] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const [opcion, setOpcion] = useState<FormOpcion | "">("");
  const [cuitFacturar, setCuitFacturar] = useState("");
  const [certFlete, setCertFlete] = useState<"" | "si" | "no">("");
  const [impresionBL, setImpresionBL] = useState("");
  const [nroContenedor, setNroContenedor] = useState("");
  const [fecha, setFecha] = useState("");
  const [cuitCancelarFacturas, setCuitCancelarFacturas] = useState("");
  const [cantidadCertificados, setCantidadCertificados] = useState("");
  const [exitoConsultaEn, setExitoConsultaEn] = useState<Date | null>(null);
  const [busquedaExitoTick, setBusquedaExitoTick] = useState(0);
  /** Conceptos del BL; en producción: asignar desde la respuesta del backend. */
  const [conceptosConsulta, setConceptosConsulta] = useState<GastoConcepto[]>([]);
  const [conceptosDialogOpen, setConceptosDialogOpen] = useState(false);
  const [conceptosDialogFiltro, setConceptosDialogFiltro] =
    useState<FiltroConceptosModal>("todos");
  /** Tras agregar al carrito se oculta el detalle de gastos hasta una nueva búsqueda exitosa. */
  const [gastosOcultosTrasCarrito, setGastosOcultosTrasCarrito] = useState(false);
  /** Cartel turquesa en el formulario; visible 5 s (sin cambiar de página). */
  const [cartelCarritoEnFormulario, setCartelCarritoEnFormulario] = useState(false);
  const cartelCarritoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openConceptosModal = (filtro: FiltroConceptosModal) => {
    setConceptosDialogFiltro(filtro);
    setConceptosDialogOpen(true);
  };

  const conceptosFiltradosModal = useMemo(() => {
    if (conceptosDialogFiltro === "todos") return conceptosConsulta;
    return conceptosConsulta.filter((c) => c.tipo === conceptosDialogFiltro);
  }, [conceptosConsulta, conceptosDialogFiltro]);

  useEffect(() => {
    if (busquedaExitoTick === 0) return;
    requestAnimationFrame(() => {
      document
        .getElementById("consulta-resultados")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      flashSectionSpotlightAfterScroll("consulta-resultados");
    });
  }, [busquedaExitoTick]);

  useEffect(() => {
    return () => {
      if (cartelCarritoTimerRef.current) clearTimeout(cartelCarritoTimerRef.current);
    };
  }, []);

  const handleAgregarAlCarrito = () => {
    dispatchCartAdded();
    setConceptosDialogOpen(false);
    setGastosOcultosTrasCarrito(true);
    setCartelCarritoEnFormulario(true);
    if (cartelCarritoTimerRef.current) clearTimeout(cartelCarritoTimerRef.current);
    cartelCarritoTimerRef.current = setTimeout(() => {
      setCartelCarritoEnFormulario(false);
      cartelCarritoTimerRef.current = null;
    }, 5000);
  };

  const totalUSD = totalesPorMoneda(conceptosConsulta).usd;

  const cuitFacturacionDisplay =
    cuitFacturar.trim() || mockResultadoComún.cuitFacturacionFallback;
  const armadorNetoUsd = sumarConceptosPorTipoYMoneda(conceptosConsulta, "Armador", "USD");
  const agenciaNetoUsd = sumarConceptosPorTipoYMoneda(conceptosConsulta, "Agencia", "USD");

  const mostrarSubtotalesDosColumnas =
    conceptosConsulta.some((c) => c.tipo === "Armador") &&
    conceptosConsulta.some((c) => c.tipo === "Agencia");

  const opcionesDisponibles = contratante.opciones ?? ALL_OPCIONES;
  const fieldsActivos: FieldKey[] = opcion
    ? contratante.fieldsByOpcion?.[opcion] ?? DEFAULT_FIELDS_BY_OPCION[opcion]
    : [];
  const mostrarCampo = (key: FieldKey) => fieldsActivos.includes(key);

  const fieldValues: Record<FieldKey, string> = {
    cuitFacturar,
    bl,
    impresionBL,
    certFlete,
    nroContenedor,
    fecha,
    cuitCancelarFacturas,
    cantidadCertificados,
  };
  const canSearch =
    !!opcion &&
    fieldsActivos.every((k) => (fieldValues[k] ?? "").toString().trim() !== "");

  const handleSearch = () => {
    if (!canSearch) return;
    const invalid = bl.toLowerCase().includes("xxx");
    setSearched(true);
    setNoResults(invalid);
    if (invalid) {
      setExitoConsultaEn(null);
      setConceptosConsulta([]);
      return;
    }
    setGastosOcultosTrasCarrito(false);
    setExitoConsultaEn(new Date());
    setBusquedaExitoTick((t) => t + 1);
    // Backend: setConceptosConsulta(data.conceptos) a partir de ConsultaGastosApiResponse
    setConceptosConsulta(getMockConceptosConsulta());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Formulario de consultas</h1>
            <p className="text-sm text-muted-foreground">
              Seleccioná una opción y completá los datos para buscar
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Layout ZIM: info + formulario */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-2xl p-1",
                      contratante.logoBg ?? "bg-white shadow-sm",
                    )}
                  >
                    {contratante.logoSrc ? (
                      <img
                        src={contratante.logoSrc}
                        alt={contratante.subtitle}
                        className="h-12 w-12 object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">{contratante.brand}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold tracking-wide text-foreground uppercase">
                      {contratante.title}
                    </p>
                  </div>
                </div>
              </div>
              {contratante.contactLines.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {contratante.contactLines.map((l) => (
                    <p key={l} className="text-right">
                      {l}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Info izquierda */}
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground">¿Cómo funciona el formulario?</h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
                Este formulario te permitirá realizar consultas relacionadas con nuestros servicios.
                Por favor, seleccioná una opción para comenzar.
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                Para obtener una cotización del importe a abonar, elegí el tipo de servicio,
                completá los campos solicitados y hacé clic en el botón de &quot;Buscar&quot;.
              </p>

              <div className="my-6 h-px w-full bg-border" />

              <h3 className="text-lg font-bold text-foreground">Cosas que tenés que saber</h3>
              {contratante.knowBoxSections ? (
                <div className="mt-2 space-y-5">
                  {contratante.knowBoxSections.map((section, i) => (
                    <div key={i}>
                      {section.heading && (
                        <h4 className="text-base font-semibold text-foreground">
                          {section.heading}
                        </h4>
                      )}
                      {section.paragraphs.map((p, j) => (
                        <p
                          key={j}
                          className="mt-2 text-sm text-muted-foreground max-w-3xl"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                (contratante.knowBoxParagraphs ?? [
                  "Para exportaciones, debés ajustar el CUIT a facturar antes de generar la consulta. Por favor, realizá esta modificación previamente. ¡Gracias!",
                  "Recordá que, si vas a abonar con cheque, este debe estar certificado si supera los USD 5.000. Lo mismo aplica para los Echeq. Si tenés dudas sobre cómo hacerlo, te recomendamos consultarlo directamente con tu banco. ¡Estamos para ayudarte!",
                ]).map((p, i) => (
                  <p key={i} className="mt-3 text-sm text-muted-foreground max-w-3xl">
                    {p}
                  </p>
                ))
              )}
            </CardContent>
          </Card>

          {/* Formulario derecha */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formulario de consultas</CardTitle>
              <CardDescription>
                Seleccioná una opción para desplegar los campos correspondientes a cada tipo de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Opción</p>
                <Select value={opcion} onValueChange={(v) => setOpcion(v as FormOpcion)}>
                  <SelectTrigger className="h-11 border border-transparent bg-secondary/50">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesDisponibles.map((op) => (
                      <SelectItem key={op} value={op}>
                        {OPCION_LABELS[op]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mostrarCampo("cuitFacturar") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">CUIT a facturar</p>
                  <Input
                    placeholder="Cuit a facturar"
                    value={cuitFacturar}
                    onChange={(e) => setCuitFacturar(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              {mostrarCampo("bl") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Número completo del BL</p>
                  <Input
                    placeholder="Número completo del BL"
                    value={bl}
                    onChange={(e) => setBl(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              {mostrarCampo("impresionBL") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Impresión del BL</p>
                  <Select value={impresionBL} onValueChange={setImpresionBL}>
                    <SelectTrigger className="h-11 border border-transparent bg-secondary/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retiro_3_originales">
                        Retiro de 3 originales + 1 ATA en APC
                      </SelectItem>
                      <SelectItem value="express_retiro_ata">
                        Express Release + Retiro de ATA en APC
                      </SelectItem>
                      <SelectItem value="express_sin_impresion">
                        Express Release - Sin impresión de ATA
                      </SelectItem>
                      <SelectItem value="express_destino_pendiente">
                        Express release - Liberación en destino pendiente
                      </SelectItem>
                      <SelectItem value="reemplazo_express">
                        Reemplazo de Express Release por originales
                      </SelectItem>
                      <SelectItem value="canje">Canje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mostrarCampo("certFlete") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">¿Certificado de flete?</p>
                  <Select value={certFlete} onValueChange={(v) => setCertFlete(v as typeof certFlete)}>
                    <SelectTrigger className="h-11 border border-transparent bg-secondary/50">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mostrarCampo("nroContenedor") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Número de contenedor</p>
                  <Input
                    placeholder="Número de contenedor"
                    value={nroContenedor}
                    onChange={(e) => setNroContenedor(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              {mostrarCampo("fecha") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Fecha</p>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              {mostrarCampo("cuitCancelarFacturas") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Cuit para cancelar facturas
                  </p>
                  <Input
                    placeholder="Cuit"
                    value={cuitCancelarFacturas}
                    onChange={(e) => setCuitCancelarFacturas(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              {mostrarCampo("cantidadCertificados") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Cantidad de certificados
                  </p>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Cantidad"
                    value={cantidadCertificados}
                    onChange={(e) => setCantidadCertificados(e.target.value)}
                    className="h-11 border border-transparent bg-secondary/50"
                  />
                </div>
              )}

              <Button onClick={handleSearch} className="h-11 w-full" disabled={!canSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>

              {searched && noResults && (
                <div
                  role="alert"
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-rose-950/30 dark:bg-rose-600 dark:shadow-rose-950/45"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                  <span>No existe información para tu búsqueda</span>
                </div>
              )}

              {searched && !noResults && exitoConsultaEn && !gastosOcultosTrasCarrito && (
                <div
                  role="status"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-emerald-950/25 dark:bg-emerald-500 dark:shadow-emerald-950/40"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                  <span>
                    Consulta realizada con éxito{" "}
                    <span className="font-medium opacity-95">
                      {exitoConsultaEn.toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </span>
                  </span>
                </div>
              )}

              {cartelCarritoEnFormulario && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-full border border-teal-500/40 bg-teal-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md dark:bg-teal-600"
                >
                  Agregado correctamente al carrito
                </div>
              )}

              {!contratante.hideCotizacion && !gastosOcultosTrasCarrito && (
                <CotizacionDialog
                  contratanteSigla={contratante.subtitle}
                  contratanteTitle={contratante.title}
                />
              )}

              <Button asChild variant="ghost" className="h-9 px-0 text-primary hover:underline justify-start">
                <Link href="/dashboard#nuestros-contratantes">Seleccionar otro contratante</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results — estructura alineada a “Revisá los datos” (web actual) */}
        {searched && !noResults && !gastosOcultosTrasCarrito && (
          <section id="consulta-resultados" className="scroll-mt-24 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Revisá los datos
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground max-w-3xl">
                <li>Podés verificar los conceptos y descargar el presupuesto.</li>
                <li>
                  El detalle no incluye los gastos administrativos de APC; se muestran al pagar en el
                  carrito.
                </li>
                <li>Podés ver los conceptos del Armador y de la Agencia.</li>
                <li>
                  Si querés incluir retenciones, deben estar cargadas y confirmadas antes de generar
                  la transacción.
                </li>
                <li>
                  <span className="font-medium text-foreground">Leyenda de observaciones:</span>{" "}
                  verificá que la información enviada por la agencia sea correcta.
                </li>
              </ul>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <Card className="border-border bg-card overflow-hidden">
                  <CardHeader className="space-y-1 pb-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Ship className="h-6 w-6 text-primary" aria-hidden />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Tu item</CardTitle>
                          <CardDescription>
                            Contratante: {contratante.subtitle || contratante.brand || "—"}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto shrink-0 px-0 text-primary hover:bg-transparent hover:underline sm:text-right"
                        onClick={() => openConceptosModal("todos")}
                      >
                        Ver todos los conceptos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[minmax(0,140px)_1fr]">
                      <dt className="text-muted-foreground">Item</dt>
                      <dd className="font-semibold text-foreground break-all">
                        {bl.trim() ? bl.toUpperCase() : "—"}
                      </dd>
                      <dt className="text-muted-foreground">Facturación</dt>
                      <dd className="text-foreground">
                        <span className="font-mono tabular-nums">{cuitFacturacionDisplay}</span>
                        <span className="text-muted-foreground"> · </span>
                        <span>{mockResultadoComún.razonSocialFacturacion}</span>
                      </dd>
                      <dt className="text-muted-foreground">Tipo de factura</dt>
                      <dd className="font-medium text-foreground">
                        {mockResultadoComún.tipoFactura}
                      </dd>
                      <dt className="text-muted-foreground">Sentido de la carga</dt>
                      <dd className="font-medium text-foreground">
                        {sentidoCargaDesdeOpcion(opcion)}
                        {opcion && (
                          <span className="ml-2 font-normal text-muted-foreground">
                            ({OPCION_LABELS[opcion]})
                          </span>
                        )}
                      </dd>
                      <dt className="text-muted-foreground">Buque</dt>
                      <dd className="font-medium text-foreground">{mockResultadoComún.buque}</dd>
                    </dl>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                      <Button variant="outline" size="sm" type="button">
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                        Descargar presupuesto
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Subtotales</h3>
                  <div
                    className={cn(
                      "grid gap-4",
                      mostrarSubtotalesDosColumnas ? "md:grid-cols-2" : "grid-cols-1",
                    )}
                  >
                  <Card className="min-w-0 border-border bg-card">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">Armador</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 text-primary hover:bg-transparent hover:underline"
                          onClick={() => openConceptosModal("Armador")}
                        >
                          Ver conceptos armador
                        </Button>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Neto USD</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {armadorNetoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Iva</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {(0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Percepción</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {(0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold text-foreground">
                          <span>Total usd</span>
                          <span className="font-mono tabular-nums">
                            {armadorNetoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card min-w-0">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">Agencia</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 text-primary hover:bg-transparent hover:underline"
                          onClick={() => openConceptosModal("Agencia")}
                        >
                          Ver conceptos agencia
                        </Button>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Neto USD</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {agenciaNetoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Iva</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {(0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Percepción</span>
                          <span className="font-mono tabular-nums text-foreground">
                            {(0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold text-foreground">
                          <span>Total usd</span>
                          <span className="font-mono tabular-nums">
                            {agenciaNetoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                </div>
              </div>

              <aside className="lg:sticky lg:top-24 space-y-4">
                <Card className="border-2 border-primary/40 bg-card shadow-md ring-1 ring-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total</CardTitle>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      * El siguiente detalle no incluye los gastos administrativos de APC; la tarifa
                      se detalla al confirmar el pago en el carrito.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground">usd</p>
                      <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                        {totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div
                      className="overflow-hidden rounded-xl border-2 border-primary/50 bg-primary/[0.07] shadow-[0_6px_24px_-6px_rgba(0,0,0,0.28)] dark:bg-primary/10"
                      role="note"
                      aria-label="Información importante de la agencia"
                    >
                      <div className="flex items-center justify-center gap-2 border-b-2 border-primary/30 bg-primary px-3 py-2.5 text-center">
                        <AlertCircle
                          className="h-4 w-4 shrink-0 text-primary-foreground opacity-95"
                          aria-hidden
                        />
                        <span className="text-sm font-bold uppercase tracking-wide text-primary-foreground">
                          Observaciones
                        </span>
                      </div>
                      <p className="px-3 py-3 text-sm font-medium leading-relaxed text-foreground">
                        {mockResultadoComún.observaciones}
                      </p>
                    </div>
                    <Button
                      onClick={handleAgregarAlCarrito}
                      disabled={!searched || noResults}
                      size="lg"
                      className="h-12 w-full gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      Agregar al carrito
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <Dialog
              open={conceptosDialogOpen}
              onOpenChange={(open) => {
                setConceptosDialogOpen(open);
                if (!open) setConceptosDialogFiltro("todos");
              }}
            >
              <DialogContent className="flex max-h-[min(90vh,780px)] w-full max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden border-2 border-primary/45 bg-card p-0 shadow-2xl shadow-black/20 ring-2 ring-primary/25 ring-offset-2 ring-offset-background dark:border-primary/50 dark:shadow-black/50 dark:ring-primary/35 sm:max-w-6xl lg:max-w-7xl">
                <DialogHeader className="space-y-2 border-b border-border px-6 py-4 text-left">
                  <DialogTitle>Detalle de gastos</DialogTitle>
                  <DialogDescription className="space-y-2 text-left">
                    <span className="block">
                      BL{" "}
                      <span className="font-mono font-medium text-foreground">
                        {bl.trim() ? bl.toUpperCase() : "—"}
                      </span>
                      {conceptosDialogFiltro !== "todos" && (
                        <>
                          {" "}
                          · Conceptos{" "}
                          <span className="font-medium text-foreground">
                            {conceptosDialogFiltro}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="block text-muted-foreground">
                      Conceptos transmitidos por la agencia.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-auto px-6 py-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="whitespace-nowrap font-semibold text-foreground">
                          CUIT
                        </TableHead>
                        <TableHead className="min-w-[140px] font-semibold text-foreground">
                          RAZÓN SOCIAL
                        </TableHead>
                        <TableHead className="whitespace-nowrap font-semibold text-foreground">
                          CONCEPTO
                        </TableHead>
                        <TableHead className="min-w-[130px] font-semibold text-foreground">
                          COMPROBANTE
                        </TableHead>
                        <TableHead className="whitespace-nowrap font-semibold text-foreground">
                          CONTENEDOR
                        </TableHead>
                        <TableHead className="min-w-[200px] font-semibold text-foreground">
                          DESCRIPCIÓN
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right font-semibold text-foreground">
                          NETO
                        </TableHead>
                        <TableHead className="whitespace-nowrap font-semibold text-foreground">
                          FECHA
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conceptosFiltradosModal.map((g) => (
                        <TableRow key={g.id} className="border-border">
                          <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                            {g.cuit}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{g.razonSocial}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-sm font-medium text-foreground">
                            {g.codigoConcepto}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {g.comprobante}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                            {g.contenedor}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{g.descripcion}</TableCell>
                          <TableCell className="whitespace-nowrap text-right font-mono text-sm text-foreground">
                            {g.neto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatFechaConcepto(g.fecha)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="border-t border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
                  Mostrando {conceptosFiltradosModal.length} de {conceptosConsulta.length}{" "}
                  concepto{conceptosConsulta.length === 1 ? "" : "s"}
                </div>
              </DialogContent>
            </Dialog>
          </section>
        )}
      </div>
    </div>
  );
}
