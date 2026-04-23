"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Download, AlertCircle, Ship } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CotizacionDialog } from "@/components/cotizacion/cotizacion-dialog";

const mockGastos = [
  { id: 1, concepto: "THC Destino", tipo: "Armador", moneda: "USD", importe: 350.0 },
  { id: 2, concepto: "BL Fee", tipo: "Armador", moneda: "USD", importe: 75.0 },
  { id: 3, concepto: "Gate In", tipo: "Agencia", moneda: "USD", importe: 120.0 },
  { id: 4, concepto: "Verificación", tipo: "Agencia", moneda: "ARS", importe: 45000.0 },
  { id: 5, concepto: "Derecho de Importación", tipo: "Agencia", moneda: "USD", importe: 200.0 },
];

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
    logoBg: "bg-sky-500/35",
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

export default function ConsultaBLPage() {
  return (
    <Suspense fallback={null}>
      <ConsultaBLContent />
    </Suspense>
  );
}

function ConsultaBLContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contratanteParam = (searchParams?.get("contratante") ?? "").toUpperCase();
  const contratante = contratantesConfig[contratanteParam] ?? contratantesConfig.DEFAULT;

  const [bl, setBl] = useState("");
  const [searched, setSearched] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [opcion, setOpcion] = useState<FormOpcion | "">("");
  const [cuitFacturar, setCuitFacturar] = useState("");
  const [certFlete, setCertFlete] = useState<"" | "si" | "no">("");
  const [impresionBL, setImpresionBL] = useState("");
  const [nroContenedor, setNroContenedor] = useState("");
  const [fecha, setFecha] = useState("");
  const [cuitCancelarFacturas, setCuitCancelarFacturas] = useState("");
  const [cantidadCertificados, setCantidadCertificados] = useState("");

  const toggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === mockGastos.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockGastos.map((g) => g.id));
    }
  };

  const totalUSD = mockGastos.filter((g) => g.moneda === "USD").reduce((s, g) => s + g.importe, 0);
  const totalARS = mockGastos.filter((g) => g.moneda === "ARS").reduce((s, g) => s + g.importe, 0);

  const selectedTotal = mockGastos
    .filter((g) => selectedItems.includes(g.id) && g.moneda === "USD")
    .reduce((s, g) => s + g.importe, 0);

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
    setSearched(true);
    setNoResults(bl.toLowerCase().includes("xxx"));
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl p-1 shadow-sm ${
                      contratante.logoBg ?? "bg-white"
                    }`}
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
                  <SelectTrigger className="h-11 bg-secondary/50 border-0">
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
                    className="h-11 bg-secondary/50 border-0"
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
                    className="h-11 bg-secondary/50 border-0"
                  />
                </div>
              )}

              {mostrarCampo("impresionBL") && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Impresión del BL</p>
                  <Select value={impresionBL} onValueChange={setImpresionBL}>
                    <SelectTrigger className="h-11 bg-secondary/50 border-0">
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
                    <SelectTrigger className="h-11 bg-secondary/50 border-0">
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
                    className="h-11 bg-secondary/50 border-0"
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
                    className="h-11 bg-secondary/50 border-0"
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
                    className="h-11 bg-secondary/50 border-0"
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
                    className="h-11 bg-secondary/50 border-0"
                  />
                </div>
              )}

              <Button onClick={handleSearch} className="h-11 w-full" disabled={!canSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>

              {!contratante.hideCotizacion && (
                <CotizacionDialog
                  contratanteSigla={contratante.subtitle}
                  contratanteTitle={contratante.title}
                />
              )}

              <Button asChild variant="ghost" className="h-9 px-0 text-primary hover:underline justify-start">
                <Link href="/dashboard">Seleccionar otro contratante</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* No results */}
        {searched && noResults && (
          <Card className="border-chart-3/30 bg-chart-3/10">
            <CardContent className="flex items-center gap-4 p-5">
              <AlertCircle className="h-6 w-6 text-chart-3" />
              <div>
                <p className="font-medium text-foreground">No existe información para tu búsqueda</p>
                <p className="text-sm text-muted-foreground">
                  Verifica el BL ingresado o comunicate con la agencia.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {searched && !noResults && (
          <>
            {/* BL Info */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Ship className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">BL: {bl.toUpperCase()}</CardTitle>
                      <CardDescription>
                        Contratante: {contratante.subtitle || "—"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Presupuesto
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Gastos table */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Detalle de gastos</CardTitle>
                    <CardDescription>
                      Selecciona los gastos que deseas agregar al carrito
                    </CardDescription>
                  </div>
                  {selectedItems.length > 0 && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {selectedItems.length} seleccionados
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === mockGastos.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGastos.map((g) => (
                      <TableRow
                        key={g.id}
                        className={`border-border cursor-pointer transition-colors ${
                          selectedItems.includes(g.id) ? "bg-primary/5" : ""
                        }`}
                        onClick={() => toggleItem(g.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(g.id)}
                            onCheckedChange={() => toggleItem(g.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {g.concepto}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              g.tipo === "Armador"
                                ? "bg-primary/20 text-primary"
                                : "bg-chart-2/20 text-chart-2"
                            }
                          >
                            {g.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{g.moneda}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">
                          {g.importe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="rounded-lg bg-secondary/50 px-4 py-2">
                        <p className="text-xs text-muted-foreground">Total USD</p>
                        <p className="text-lg font-bold text-foreground">
                          USD {totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 px-4 py-2">
                        <p className="text-xs text-muted-foreground">Total ARS</p>
                        <p className="text-lg font-bold text-foreground">
                          ARS {totalARS.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push("/dashboard/carrito")}
                      disabled={selectedItems.length === 0}
                      size="lg"
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Agregar al carrito
                      {selectedItems.length > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-primary-foreground/20 text-primary-foreground">
                          USD {selectedTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
