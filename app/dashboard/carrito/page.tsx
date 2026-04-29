"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  CreditCard,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
  Building,
  Ship,
  Info,
  ShieldCheck,
  FileText,
  ArrowLeft,
  ChevronDown,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DASHBOARD_TARGET_SECTION_STORAGE_KEY } from "@/lib/section-spotlight";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CONTRATANTES } from "@/lib/contratantes";

// ─── Modelo ──────────────────────────────────────────────────────────
// Alineado a "Abonar Gastos y Generar Boleta de Transacción Web":
// https://www.gestion-online.com.ar/v3/Guias/Guia-para-operar-en-la-web/
type TipoCargo = "Armador" | "Agencia";
type Moneda = "USD" | "ARS";

type CartItem = {
  id: number;
  bl: string;
  contratanteSigla: string;
  concepto: string;
  tipo: TipoCargo;
  moneda: Moneda;
  importe: number;
  /** ISO 8601: instante en que el concepto se agregó al carrito (vigencia +30 min desde el más antiguo del contratante). */
  addedAt: string;
};

type ObservacionAgencia = {
  bl: string;
  texto: string;
};

type RetencionAplicada = {
  id: string;
  bl: string;
  tipo: string;
  moneda: Moneda;
  importe: number;
};

/** Datos de cabecera del desplegable por BL (en producción vendrán del backend por BL). */
type BlDetalleFacturacion = {
  /** Referencia de ítem mostrada en columna “Item” (puede diferir del n° de BL). */
  itemRef: string;
  cuit: string;
  razonSocial: string;
  /** Cotización ARS por USD aplicada al BL. */
  cotizacion: number;
  tipoComprobante: string;
};

const FACTURACION_APC_DEFAULT: Omit<BlDetalleFacturacion, "itemRef"> = {
  cuit: "30707121706",
  razonSocial: "ADMINISTRATIVE PROCESSING CENTER SA",
  cotizacion: 1207.5,
  tipoComprobante: "FACTURA RECIBO",
};

/** Mock por BL; si no hay entrada se usa `bl` como `itemRef` y el resto APC por defecto. */
const mockDetalleFacturacionPorBl: Record<string, BlDetalleFacturacion> = {
  ONEYXYZ7654321: {
    itemRef: "ONEYAPC123456",
    ...FACTURACION_APC_DEFAULT,
  },
  ONEYHAMG21045801: {
    itemRef: "ONEYAPC210458",
    ...FACTURACION_APC_DEFAULT,
    cotizacion: 1208.2,
  },
  ONEYCAIG01615400: {
    itemRef: "ONEYAPC016154",
    ...FACTURACION_APC_DEFAULT,
    cotizacion: 1206.9,
  },
  ZIMUABC1234567: {
    itemRef: "ZIMAPC1234567",
    cuit: "30707121706",
    razonSocial: "ADMINISTRATIVE PROCESSING CENTER SA",
    cotizacion: 1195.0,
    tipoComprobante: "FACTURA RECIBO",
  },
};

function detalleFacturacionParaBl(bl: string): BlDetalleFacturacion {
  return (
    mockDetalleFacturacionPorBl[bl] ?? {
      itemRef: bl,
      ...FACTURACION_APC_DEFAULT,
    }
  );
}

const VIGENCIA_CARRITO_MS = 30 * 60 * 1000;

const initialItemsRaw: Omit<CartItem, "addedAt">[] = [
  { id: 1, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "THC Destino", tipo: "Armador", moneda: "USD", importe: 350 },
  { id: 2, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "BL Fee", tipo: "Armador", moneda: "USD", importe: 75 },
  { id: 3, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "Gate In", tipo: "Agencia", moneda: "USD", importe: 120 },
  { id: 4, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "Verificación", tipo: "Agencia", moneda: "ARS", importe: 45000 },
  /* ONE — 3 BLs de ejemplo para probar checkout compacto */
  { id: 5, bl: "ONEYXYZ7654321", contratanteSigla: "ONE", concepto: "Documentación", tipo: "Armador", moneda: "USD", importe: 90 },
  { id: 6, bl: "ONEYXYZ7654321", contratanteSigla: "ONE", concepto: "Derecho de Importación", tipo: "Agencia", moneda: "USD", importe: 200 },
  { id: 7, bl: "ONEYHAMG21045801", contratanteSigla: "ONE", concepto: "THC Destino", tipo: "Armador", moneda: "USD", importe: 175 },
  { id: 8, bl: "ONEYHAMG21045801", contratanteSigla: "ONE", concepto: "Handling", tipo: "Agencia", moneda: "USD", importe: 88 },
  { id: 9, bl: "ONEYCAIG01615400", contratanteSigla: "ONE", concepto: "BL Fee", tipo: "Armador", moneda: "USD", importe: 72 },
  { id: 10, bl: "ONEYCAIG01615400", contratanteSigla: "ONE", concepto: "Gate Out", tipo: "Agencia", moneda: "USD", importe: 110 },
];

/** Asigna `addedAt` por contratante (misma hora para todos los ítems de un carrito). */
function seedCartItemsWithAddedAt(rows: Omit<CartItem, "addedAt">[]): CartItem[] {
  const t0 = Date.now();
  const tiempoPorSigla = new Map<string, number>();
  for (const it of rows) {
    if (!tiempoPorSigla.has(it.contratanteSigla)) {
      tiempoPorSigla.set(it.contratanteSigla, t0 + tiempoPorSigla.size * 60_000);
    }
  }
  return rows.map((it) => ({
    ...it,
    addedAt: new Date(tiempoPorSigla.get(it.contratanteSigla)!).toISOString(),
  }));
}

function vigenteHastaDesdeItems(items: CartItem[]): Date {
  const ts = items
    .map((i) => new Date(i.addedAt).getTime())
    .filter((n) => !Number.isNaN(n));
  const base = ts.length ? Math.min(...ts) : Date.now();
  return new Date(base + VIGENCIA_CARRITO_MS);
}

function formatoHoraVigencia(d: Date): string {
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

const observacionesAgencia: ObservacionAgencia[] = [
  {
    bl: "ZIMUABC1234567",
    texto:
      "Contenedor arribado el 18/04. Se emite libre deuda al momento del pago. Verificar que el CUIT a facturar sea correcto antes de generar la transacción.",
  },
  {
    bl: "ONEYHAMG21045801",
    texto: "Coordinar retiro de documentación con la agencia. BL disponible para operación.",
  },
];

const retencionesConfirmadas: RetencionAplicada[] = [
  { id: "RET-001", bl: "ZIMUABC1234567", tipo: "IVA", moneda: "USD", importe: 21.5 },
  { id: "RET-002", bl: "ONEYXYZ7654321", tipo: "GANANCIAS", moneda: "USD", importe: 8.7 },
  { id: "RET-003", bl: "ONEYCAIG01615400", tipo: "IVA", moneda: "USD", importe: 12.25 },
];

const agendas = [
  { value: "facturacion@empresa.com", label: "facturacion@empresa.com", agendada: true },
  { value: "pagos@empresa.com", label: "pagos@empresa.com", agendada: true },
];

/** Agendas de pagos automáticos (mock; en producción depende del medio de pago). */
const agendasPagosAutomaticos = [
  { value: "auto-vep-principal", label: "VEP · Cuenta corriente principal" },
  { value: "auto-debin-proveedores", label: "DEBIN · Pagos a proveedores" },
];

const AGENDA_AUTOMATICA_NO_APLICA = "na";

/** Tarifa administrativa APC al contado (ARS). En producción viene del backend. */
const TARIFA_SERVICIO_APC_CONTADO_ARS = 4685.73;
/** Ejemplo: tarifa APC en cuenta corriente (ARS). En producción viene del backend. */
const TARIFA_SERVICIO_APC_CTA_CTE_ARS = 0;

type MedioPagoOption = {
  value: string;
  label: string;
  requiereAgenda?: boolean;
};

const mediosPago: MedioPagoOption[] = [
  { value: "vep", label: "VEP · Interbanking", requiereAgenda: true },
  { value: "debin", label: "DEBIN", requiereAgenda: true },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "echeq", label: "Echeq" },
];

const fmtMoneda = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CarritoPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>(() => seedCartItemsWithAddedAt(initialItemsRaw));
  const [checkoutSigla, setCheckoutSigla] = useState<string | null>(null);
  const [expandedBl, setExpandedBl] = useState<string | null>(null);
  /** En checkout, bloque informativo APC/retenciones plegado por defecto para ahorrar altura. */
  const [checkoutInfoOpen, setCheckoutInfoOpen] = useState(false);
  const [medioPago, setMedioPago] = useState("");
  const [agendaPagoAutomatico, setAgendaPagoAutomatico] = useState("");
  const [agendaMail, setAgendaMail] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [boletaProcesoOpen, setBoletaProcesoOpen] = useState(false);
  const [ultimaOperacionContratante, setUltimaOperacionContratante] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setExpandedBl(null);
    if (!checkoutSigla) setCheckoutInfoOpen(false);
  }, [checkoutSigla]);

  const medioSeleccionado = mediosPago.find((m) => m.value === medioPago);

  /** Medios sin agenda automática usan marcador interno para no bloquear el flujo. */
  useEffect(() => {
    if (!medioPago) {
      setAgendaPagoAutomatico("");
      return;
    }
    if (!medioSeleccionado?.requiereAgenda) {
      setAgendaPagoAutomatico(AGENDA_AUTOMATICA_NO_APLICA);
    } else {
      setAgendaPagoAutomatico((prev) =>
        prev === AGENDA_AUTOMATICA_NO_APLICA ? "" : prev,
      );
    }
  }, [medioPago, medioSeleccionado?.requiereAgenda]);

  const carritosPorContratante = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    for (const it of items) {
      if (!map.has(it.contratanteSigla)) map.set(it.contratanteSigla, []);
      map.get(it.contratanteSigla)!.push(it);
    }
    return Array.from(map.entries()).map(([sigla, its]) => {
      const bls = new Set(its.map((i) => i.bl));
      const c = CONTRATANTES.find((x) => x.sigla === sigla);
      return {
        sigla,
        nombre: c?.nombre ?? sigla,
        logoSrc: c?.logoSrc,
        items: its,
        blCount: bls.size,
      };
    });
  }, [items]);

  const itemsCheckout = useMemo(
    () =>
      checkoutSigla ? items.filter((i) => i.contratanteSigla === checkoutSigla) : [],
    [items, checkoutSigla],
  );

  const gruposBlCheckout = useMemo(() => {
    const map = new Map<string, { bl: string; contratanteSigla: string; items: CartItem[] }>();
    for (const it of itemsCheckout) {
      if (!map.has(it.bl)) {
        map.set(it.bl, { bl: it.bl, contratanteSigla: it.contratanteSigla, items: [] });
      }
      map.get(it.bl)!.items.push(it);
    }
    return Array.from(map.values());
  }, [itemsCheckout]);

  const blsCheckout = useMemo(() => new Set(itemsCheckout.map((i) => i.bl)), [itemsCheckout]);

  const retencionesCheckout = useMemo(
    () => retencionesConfirmadas.filter((r) => blsCheckout.has(r.bl)),
    [blsCheckout],
  );

  const totalUSD = itemsCheckout
    .filter((i) => i.moneda === "USD")
    .reduce((s, i) => s + i.importe, 0);
  const totalARS = itemsCheckout
    .filter((i) => i.moneda === "ARS")
    .reduce((s, i) => s + i.importe, 0);

  const retencionUSD = retencionesCheckout
    .filter((r) => r.moneda === "USD")
    .reduce((s, r) => s + r.importe, 0);
  const retencionARS = retencionesCheckout
    .filter((r) => r.moneda === "ARS")
    .reduce((s, r) => s + r.importe, 0);

  const netoUSD = Math.max(0, totalUSD - retencionUSD);
  const netoARSConceptos = Math.max(0, totalARS - retencionARS);
  const netoARSConApc =
    netoARSConceptos +
    TARIFA_SERVICIO_APC_CONTADO_ARS +
    TARIFA_SERVICIO_APC_CTA_CTE_ARS;

  const handleRemoveBL = (bl: string) => {
    setItems((prev) => prev.filter((i) => i.bl !== bl));
  };

  const agendaAutomaticaOk =
    !!agendaPagoAutomatico &&
    (agendaPagoAutomatico === AGENDA_AUTOMATICA_NO_APLICA ||
      agendasPagosAutomaticos.some((a) => a.value === agendaPagoAutomatico));

  const puedeGenerar =
    !!checkoutSigla &&
    !!medioPago &&
    agendaAutomaticaOk &&
    !!agendaMail &&
    itemsCheckout.length > 0;

  const handleGenerar = async () => {
    if (!checkoutSigla) return;
    setGenerando(true);
    await new Promise((r) => setTimeout(r, 900));
    const nombre = CONTRATANTES.find((c) => c.sigla === checkoutSigla)?.nombre ?? checkoutSigla;
    setUltimaOperacionContratante(nombre);
    setItems((prev) => prev.filter((i) => i.contratanteSigla !== checkoutSigla));
    setCheckoutSigla(null);
    setMedioPago("");
    setAgendaPagoAutomatico("");
    setAgendaMail("");
    setGenerando(false);
    setConfirmOpen(false);
    setBoletaProcesoOpen(true);
  };

  const carritoVacio = items.length === 0;
  const checkoutNombre = checkoutSigla
    ? CONTRATANTES.find((c) => c.sigla === checkoutSigla)?.nombre ?? checkoutSigla
    : null;

  const totalBlsEnLista = carritosPorContratante.reduce((s, c) => s + c.blCount, 0);

  return (
    <div
      className={cn(
        "bg-background",
        carritoVacio ? "min-h-screen" : "flex min-h-0 w-full min-w-0 flex-1 flex-col",
      )}
    >
      {carritoVacio ? (
        <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-6 bg-background p-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Tu carrito esta vacio</h2>
            <p className="mt-2 text-muted-foreground">
              Elegí un contratante en el inicio, consultá tu BL y agregá gastos al carrito para pagar.
            </p>
          </div>
          <Button
            onClick={() => {
              try {
                sessionStorage.setItem(DASHBOARD_TARGET_SECTION_STORAGE_KEY, "nuestros-contratantes");
              } catch {
                /* ignore */
              }
              router.push("/dashboard");
            }}
            size="lg"
          >
            Elegir contratante
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-background/90 backdrop-blur-xl">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-2",
                checkoutSigla ? "h-11 px-3 py-1" : "h-16 gap-3 px-6 py-0",
              )}
            >
              <div className="min-w-0">
                <h1
                  className={cn(
                    "font-semibold text-foreground",
                    checkoutSigla ? "text-sm leading-tight" : "text-lg",
                  )}
                >
                  Carrito
                </h1>
                <p
                  className={cn(
                    "text-muted-foreground",
                    checkoutSigla
                      ? "line-clamp-1 text-[11px] leading-tight"
                      : "text-sm",
                  )}
                >
                  {checkoutSigla
                    ? `Confirma y pagá · ${checkoutNombre}`
                    : "Elegí Ir a pagar por contratante. Cada uno genera su propia transacción."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {checkoutSigla && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCheckoutSigla(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al carrito
                  </Button>
                )}
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {checkoutSigla ? gruposBlCheckout.length : totalBlsEnLista}{" "}
                  {(checkoutSigla ? gruposBlCheckout.length : totalBlsEnLista) === 1 ? "BL" : "BLs"}
                </Badge>
                <Badge variant="secondary" className="bg-secondary text-foreground">
                  {checkoutSigla ? itemsCheckout.length : items.length} items
                </Badge>
              </div>
            </div>
          </header>

          <div
            className={cn(
              "mx-auto w-full min-w-0 flex-1",
              checkoutSigla
                ? "max-w-6xl px-2 py-1 sm:px-3 sm:py-2"
                : "max-w-5xl space-y-6 p-6",
            )}
          >
            {!checkoutSigla ? (
              <>
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/8 p-4 text-sm text-foreground dark:bg-amber-500/10">
                  <p>
                    <span className="font-semibold">Importante:</span> Tus carritos tienen una
                    vigencia de 30 minutos desde su creación. Si no realizas el pago dentro de ese
                    tiempo, los items serán removidos automáticamente. ¡Asegurate de completar tu
                    pago a tiempo para no perderlos!
                  </p>
                </div>

                {carritosPorContratante.map((carrito) => {
                  const vigenteHasta = vigenteHastaDesdeItems(carrito.items);
                  return (
                    <Card
                      key={carrito.sigla}
                      className="border-border bg-card shadow-[var(--shadow-card)]"
                    >
                      <CardContent className="flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white p-1 ring-1 ring-black/5 dark:bg-white/95 dark:ring-white/10 sm:h-10 sm:w-10 sm:rounded-lg sm:p-1.5">
                            {carrito.logoSrc ? (
                              <img
                                src={carrito.logoSrc}
                                alt=""
                                className="max-h-[22px] max-w-[88%] object-contain sm:max-h-[26px]"
                              />
                            ) : (
                              <Building className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                            )}
                          </div>
                          <div className="min-w-0 leading-none">
                            <p className="text-sm font-semibold leading-tight text-foreground sm:text-[15px]">
                              {carrito.nombre}
                            </p>
                            <p className="mt-px text-[11px] leading-tight text-muted-foreground sm:text-xs">
                              {carrito.blCount} {carrito.blCount === 1 ? "BL" : "BLs"} ·{" "}
                              {carrito.items.length}{" "}
                              {carrito.items.length === 1 ? "concepto" : "conceptos"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-stretch gap-px sm:items-end sm:text-right">
                          <Button
                            className="h-7 shrink-0 gap-1 px-3 text-[11px] sm:h-8 sm:min-w-[126px] sm:text-sm"
                            onClick={() => setCheckoutSigla(carrito.sigla)}
                          >
                            Ir a pagar
                            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Button>
                          <p className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
                            <span className="font-medium text-foreground">Vigente hasta:</span>{" "}
                            <span className="tabular-nums">{formatoHoraVigencia(vigenteHasta)}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="grid min-h-0 w-full min-w-0 gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(248px,288px)] lg:items-start lg:gap-3">
                <div className="min-h-0 min-w-0 space-y-1">
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold leading-tight tracking-tight text-foreground sm:text-base">
                      Confirma y pagá
                    </h2>

                    <Card className="border-border bg-card/80 shadow-[var(--shadow-card)] backdrop-blur-sm">
                      <CardContent className="p-0 sm:px-0">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full px-1.5 sm:px-2.5"
                        >
                          <AccordionItem value="retenciones" className="border-border">
                            <AccordionTrigger className="group -mx-1 rounded-md px-1.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out hover:translate-x-1 hover:bg-muted/45 hover:no-underline data-[state=open]:bg-muted/35 data-[state=open]:text-foreground sm:text-sm [&>svg]:size-3.5">
                              <span className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
                                Retenciones
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1.5 text-[11px] leading-snug text-muted-foreground sm:pb-2 sm:text-sm">
                              <p>
                                Si querés incluir retenciones en el pago, las mismas deben ser cargadas
                                en la web <strong className="text-foreground">ANTES</strong> de generar
                                tu transacción. Aguardá que sean{" "}
                                <strong className="text-foreground">CONFIRMADAS</strong> por personal de
                                APC y recién entonces generá la transacción. Podés gestionarlas en{" "}
                                <Link
                                  href="/dashboard/retenciones"
                                  className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                  Retenciones
                                </Link>
                                .
                              </p>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="horarios" className="border-border">
                            <AccordionTrigger className="group -mx-1 rounded-md px-1.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out hover:translate-x-1 hover:bg-muted/45 hover:no-underline data-[state=open]:bg-muted/35 data-[state=open]:text-foreground sm:text-sm [&>svg]:size-3.5">
                              <span className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
                                Horarios de atención
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1.5 sm:pb-2">
                              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-foreground">Presencial</p>
                                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                    De 10:30 a 16:30
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-foreground">Web</p>
                                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                    De 9:00 a 17:30
                                  </p>
                                </div>
                              </div>
                              <p className="mt-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                                <strong className="text-foreground">Recordá:</strong> estamos para
                                asistirte dentro de estos horarios.
                              </p>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="reglas" className="border-border">
                            <AccordionTrigger className="group -mx-1 rounded-md px-1.5 py-1.5 text-xs font-semibold transition-all duration-200 ease-out hover:translate-x-1 hover:bg-muted/45 hover:no-underline data-[state=open]:bg-muted/35 data-[state=open]:text-foreground sm:text-sm [&>svg]:size-3.5">
                              <span className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4" />
                                Reglas básicas
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1.5 sm:pb-2">
                              <ul className="list-inside list-disc space-y-2 text-[11px] leading-snug text-muted-foreground marker:text-primary sm:text-sm sm:leading-relaxed">
                                <li>
                                  Tené en cuenta que las transacciones tendrán vigencia solo por el día.
                                  Si no se aplica el medio de pago dentro de ese tiempo, la transacción se
                                  anulará automáticamente al finalizar el horario operativo.
                                </li>
                                <li>
                                  Si realizaste una transferencia a proveedores, te pedimos que nos
                                  envíes, antes de las{" "}
                                  <strong className="text-foreground">18:00 horas</strong>, los
                                  siguientes documentos al correo{" "}
                                  <a
                                    href="mailto:recepcion@gestion-online.com.ar"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                  >
                                    recepcion@gestion-online.com.ar
                                  </a>
                                  :
                                  <ol className="mt-1.5 list-inside list-decimal space-y-0.5 pl-0.5 text-[11px] sm:text-xs">
                                    <li>La boleta de transacción web del día.</li>
                                    <li>El comprobante bancario de la transferencia.</li>
                                  </ol>
                                </li>
                              </ul>
                              <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs sm:text-sm">
                                Es importante cumplir con este plazo para garantizar la gestión sin
                                demoras.
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>

                  <Collapsible open={checkoutInfoOpen} onOpenChange={setCheckoutInfoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-between gap-2 border-border text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary sm:text-xs"
                      >
                        Tarifa APC y retenciones
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            checkoutInfoOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
                        <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="text-xs sm:text-sm">
                            <p className="font-semibold text-foreground">Tarifa de servicio APC</p>
                            <p className="mt-0.5 text-muted-foreground">
                              La tarifa de APC al contado se suma en el resumen. Pueden ver el mismo en el{" "}
                              <span className="font-medium text-foreground">&quot;Detalle del importe&quot;</span>.
                            </p>
                          </div>
                        </div>

                        {retencionesCheckout.length === 0 ? (
                          <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="text-xs sm:text-sm">
                              <p className="font-semibold text-foreground">Retenciones</p>
                              <p className="mt-0.5 text-muted-foreground">
                                Cargalas en{" "}
                                <Link
                                  href="/dashboard/retenciones"
                                  className="font-medium text-primary hover:underline"
                                >
                                  Retenciones
                                </Link>{" "}
                                y esperá confirmación de APC antes de generar la transacción.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 transition-colors hover:border-emerald-500/50">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                            <div className="text-xs sm:text-sm">
                              <p className="font-semibold text-foreground">
                                {retencionesCheckout.length} retenci
                                {retencionesCheckout.length === 1 ? "ón" : "ones"} confirmada
                                {retencionesCheckout.length === 1 ? "" : "s"}
                              </p>
                              <p className="mt-0.5 text-muted-foreground">
                                Se descuentan del total a pagar.
                              </p>
                              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1">
                                {retencionesCheckout.map((r) => (
                                  <li
                                    key={r.id}
                                    className="flex items-center justify-between gap-2 font-mono text-[11px] text-foreground"
                                  >
                                    <span className="min-w-0 truncate">
                                      {r.tipo} · {r.bl}
                                    </span>
                                    <span className="shrink-0">
                                      - {r.moneda} {fmtMoneda(r.importe)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="mx-auto w-full max-w-lg space-y-1 sm:max-w-xl lg:max-w-2xl">
                    <div className="flex items-baseline justify-between gap-2 border-b border-border pb-0.5 pt-0 px-px">
                      <h3 className="text-[11px] font-semibold text-foreground sm:text-xs">Tus BLs</h3>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        Cantidad ({gruposBlCheckout.length})
                      </span>
                    </div>

                {gruposBlCheckout.map((grupo) => {
                  const obs = observacionesAgencia.find((o) => o.bl === grupo.bl);
                  const detalleBl = detalleFacturacionParaBl(grupo.bl);
                  const subtotalUSD = grupo.items
                    .filter((i) => i.moneda === "USD")
                    .reduce((s, i) => s + i.importe, 0);
                  const subtotalARS = grupo.items
                    .filter((i) => i.moneda === "ARS")
                    .reduce((s, i) => s + i.importe, 0);
                  const subtotalARSMostrado =
                    subtotalARS > 0 ? subtotalARS : subtotalUSD > 0 ? subtotalUSD * detalleBl.cotizacion : 0;
                  const open = expandedBl === grupo.bl;

                  return (
                    <Card
                      key={grupo.bl}
                      className="overflow-hidden border-border bg-card py-0 transition-colors hover:border-primary/55"
                    >
                      <Collapsible
                        open={open}
                        onOpenChange={(next) => setExpandedBl(next ? grupo.bl : null)}
                      >
                        <CardHeader className="space-y-0 px-2 py-1 sm:px-2.5 sm:py-1.5">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 sm:h-7 sm:w-7">
                                <Ship className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" />
                              </div>
                              <CardTitle className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold leading-none sm:text-sm">
                                <span className="font-mono tracking-tight">{grupo.bl}</span>
                                <Badge variant="outline" className="border-border px-1 py-0 text-[9px] sm:px-1.5 sm:text-[10px]">
                                  {grupo.contratanteSigla}
                                </Badge>
                              </CardTitle>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
                              <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                                {subtotalUSD > 0 && (
                                  <span className="rounded bg-secondary/70 px-1.5 py-0.5 font-mono text-foreground">
                                    USD {fmtMoneda(subtotalUSD)}
                                  </span>
                                )}
                                {subtotalARS > 0 && (
                                  <span className="rounded bg-secondary/70 px-1.5 py-0.5 font-mono text-foreground">
                                    ARS {fmtMoneda(subtotalARS)}
                                  </span>
                                )}
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-7 gap-0.5 px-1.5 text-[10px] sm:h-7 sm:px-2 sm:text-xs">
                                  {open ? "Ocultar" : "Detalle"}
                                  <ChevronDown
                                    className={cn(
                                      "h-3.5 w-3.5 transition-transform",
                                      open && "rotate-180",
                                    )}
                                  />
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-1.5 text-muted-foreground hover:text-destructive sm:h-7 sm:px-2"
                                onClick={() => handleRemoveBL(grupo.bl)}
                                title="Quitar BL"
                              >
                                <Trash2 className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Quitar</span>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CollapsibleContent>
                          <CardContent className="space-y-2 border-t border-border p-0 pt-0">
                            {obs && (
                              <div className="mx-2 mt-2 flex items-start gap-1.5 rounded-md border border-rose-500/30 bg-rose-500/8 px-2 py-1.5 sm:mx-2.5 dark:bg-rose-500/10">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                                <div className="text-xs leading-snug">
                                  <p className="font-semibold text-foreground">Observaciones</p>
                                  <p className="mt-0.5 text-muted-foreground">{obs.texto}</p>
                                </div>
                              </div>
                            )}

                            <div className="grid gap-3 border-b border-border px-2 py-2 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-3 sm:px-3">
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold text-foreground">Item</p>
                                <p className="mt-0.5 font-mono text-xs leading-tight text-foreground">
                                  {detalleBl.itemRef}
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold text-foreground">Importes</p>
                                <div className="mt-0.5 space-y-px font-mono text-xs tabular-nums leading-tight text-foreground">
                                  {subtotalUSD > 0 && <div>USD {fmtMoneda(subtotalUSD)}</div>}
                                  {subtotalARSMostrado > 0 && (
                                    <div>ARS {fmtMoneda(subtotalARSMostrado)}</div>
                                  )}
                                </div>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold text-foreground">
                                  Tipo de comprobante
                                </p>
                                <p className="mt-0.5 text-xs leading-tight text-foreground">
                                  {detalleBl.tipoComprobante}
                                </p>
                              </div>
                              <div className="flex flex-col sm:col-span-4">
                                <p className="text-[11px] font-semibold text-foreground">Facturación</p>
                                <p className="mt-0.5 font-mono text-xs tabular-nums leading-tight text-foreground">
                                  {detalleBl.cuit}
                                </p>
                                <p
                                  title={detalleBl.razonSocial}
                                  className="line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:line-clamp-1 sm:text-xs"
                                >
                                  {detalleBl.razonSocial}
                                </p>
                              </div>
                              <div className="flex flex-col sm:col-span-2 sm:justify-start">
                                <p className="text-[11px] font-semibold text-foreground">Cotización</p>
                                <p className="mt-0.5 font-mono text-xs tabular-nums leading-tight text-foreground">
                                  {fmtMoneda(detalleBl.cotizacion)}
                                </p>
                              </div>
                            </div>

                            <Table className="border-t-0 text-[11px] [&_td]:py-1 [&_th]:py-1.5 sm:text-xs [&_th]:py-2 sm:[&_td]:py-1.5">
                              <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                  <TableHead>Concepto</TableHead>
                                  <TableHead>Tipo</TableHead>
                                  <TableHead>Moneda</TableHead>
                                  <TableHead className="text-right">Importe</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {grupo.items.map((item) => (
                                  <TableRow key={item.id} className="border-border">
                                    <TableCell className="font-medium text-foreground">
                                      {item.concepto}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={
                                          item.tipo === "Armador"
                                            ? "bg-primary/20 text-primary"
                                            : "bg-chart-2/20 text-chart-2"
                                        }
                                      >
                                        {item.tipo}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {item.moneda}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-foreground">
                                      {fmtMoneda(item.importe)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-3 py-1.5 text-xs sm:px-4 sm:text-sm">
                              <span className="text-muted-foreground">Subtotal BL:</span>
                              {subtotalUSD > 0 && (
                                <span className="font-mono font-semibold text-foreground">
                                  USD {fmtMoneda(subtotalUSD)}
                                </span>
                              )}
                              {subtotalARS > 0 && (
                                <span className="font-mono font-semibold text-foreground">
                                  ARS {fmtMoneda(subtotalARS)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
                  </div>
                </div>

                <aside className="min-h-0 min-w-0 space-y-1.5 lg:sticky lg:top-11 lg:self-start">
                  <Card className="border-primary/30 bg-primary/5 shadow-[var(--shadow-card)]">
                    <CardContent className="space-y-1.5 p-2.5 sm:p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
                            Detalle del importe
                          </p>
                          <p className="mt-px text-[10px] text-muted-foreground sm:text-[11px]">
                            {itemsCheckout.length} conceptos - {gruposBlCheckout.length}{" "}
                            {gruposBlCheckout.length === 1 ? "BL" : "BLs"}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 sm:h-9 sm:w-9">
                          <CreditCard className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                        </div>
                      </div>

                      <div className="space-y-0.5 text-[11px] sm:text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground">ARS</span>
                          <span className="shrink-0 font-mono tabular-nums text-foreground">
                            ARS{" "}
                            {fmtMoneda(
                              retencionARS > 0 ? totalARS : netoARSConceptos,
                            )}
                          </span>
                        </div>
                        {retencionARS > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground">Retenciones</span>
                            <span className="shrink-0 font-mono tabular-nums text-foreground">
                              - ARS {fmtMoneda(retencionARS)}
                            </span>
                          </div>
                        )}
                        {retencionARS > 0 && (
                          <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-1.5 text-xs font-semibold text-foreground sm:text-sm">
                            <span>Total ARS (conceptos)</span>
                            <span className="shrink-0 font-mono tabular-nums">
                              ARS {fmtMoneda(netoARSConceptos)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground">USD</span>
                          <span className="shrink-0 font-mono tabular-nums text-foreground">
                            USD {fmtMoneda(totalUSD)}
                          </span>
                        </div>
                        {retencionUSD > 0 && (
                          <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-1.5">
                            <span className="text-foreground">Retenciones</span>
                            <span className="shrink-0 font-mono tabular-nums text-foreground">
                              - USD {fmtMoneda(retencionUSD)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground">Tarifa de servicio al contado</span>
                          <span className="shrink-0 font-mono tabular-nums text-foreground">
                            ARS {fmtMoneda(TARIFA_SERVICIO_APC_CONTADO_ARS)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground">Tarifa de servicio cuenta corriente</span>
                          <span className="shrink-0 font-mono tabular-nums text-foreground">
                            ARS {fmtMoneda(TARIFA_SERVICIO_APC_CTA_CTE_ARS)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-primary/20 pt-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-foreground sm:text-base">Total ARS</span>
                          <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-foreground sm:text-lg">
                            ARS {fmtMoneda(netoARSConApc)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-xl border-2 border-red-500/45 bg-card p-2.5 shadow-sm dark:border-red-500/35 sm:p-3">
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">Pagá con</h3>
                        <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px] sm:leading-relaxed">
                          * Para que se desplieguen las opciones de las agendas de pagos automáticos,
                          primero tenés que seleccionar el medio de pago. En caso de que no cuentes con
                          ninguna, podés dirigirte al módulo de agendas y darla de alta.
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-xs font-medium text-foreground sm:text-sm">Medio de pago</label>
                        <Select
                          value={medioPago || undefined}
                          onValueChange={(v) => {
                            setMedioPago(v);
                          }}
                        >
                          <SelectTrigger className="h-9 w-full border border-input bg-background text-sm">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {mediosPago.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-xs font-medium text-foreground sm:text-sm">
                          Agendas de pagos automáticos
                        </label>
                        <Select
                          value={
                            !medioPago
                              ? undefined
                              : medioSeleccionado?.requiereAgenda
                                ? agendaPagoAutomatico || undefined
                                : AGENDA_AUTOMATICA_NO_APLICA
                          }
                          onValueChange={setAgendaPagoAutomatico}
                          disabled={
                            !medioPago || !medioSeleccionado?.requiereAgenda
                          }
                        >
                          <SelectTrigger className="h-9 w-full border border-input bg-background text-sm disabled:opacity-70">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {medioSeleccionado?.requiereAgenda ? (
                              agendasPagosAutomaticos.map((a) => (
                                <SelectItem key={a.value} value={a.value}>
                                  {a.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value={AGENDA_AUTOMATICA_NO_APLICA}>
                                No aplica para este medio
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 border-t border-border pt-2.5">
                      <div>
                        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">
                          ¿Dónde te notificamos?
                        </h3>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-xs font-medium text-foreground sm:text-sm">
                          Notificaciones por mail
                        </label>
                        <Select
                          value={agendaMail || undefined}
                          onValueChange={setAgendaMail}
                        >
                          <SelectTrigger className="h-9 w-full border border-input bg-background text-sm">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {agendas.map((a) => (
                              <SelectItem key={a.value} value={a.value}>
                                {a.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] leading-snug text-muted-foreground sm:text-[11px] sm:leading-snug">
                          * Si al hacer clic en &quot;Seleccionar&quot; no aparece ninguna agenda, no te
                          preocupés. Solo necesitás ir al módulo de agendas y crear una antes de
                          continuar. ¡Es rápido y fácil!
                        </p>
                        <Link
                          href="/dashboard/agendas"
                          className="inline-block text-xs font-medium text-pink-600 underline-offset-4 hover:text-pink-700 hover:underline sm:text-sm dark:text-pink-400 dark:hover:text-pink-300"
                        >
                          Ir a agendas
                        </Link>
                      </div>
                    </div>

                    {!puedeGenerar && itemsCheckout.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-500/12 px-2 py-1.5 dark:bg-amber-500/15 sm:px-2.5 sm:py-1.5">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-500" />
                        <p className="text-xs leading-snug text-foreground">
                          Completá medio de pago
                          {medioSeleccionado?.requiereAgenda
                            ? ", agenda de pagos automáticos"
                            : ""}{" "}
                          y notificaciones por mail para continuar.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => setConfirmOpen(true)}
                      disabled={!puedeGenerar}
                      className="mt-2.5 h-10 w-full bg-pink-600 text-sm font-semibold text-white hover:bg-pink-700 dark:bg-pink-600 dark:hover:bg-pink-500 sm:h-11 sm:text-base"
                      size="lg"
                    >
                      Generar anticipada
                    </Button>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={(o) => !generando && setConfirmOpen(o)}>
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar transacción</DialogTitle>
            <DialogDescription>
              Vas a solicitar la <span className="font-medium text-foreground">Anticipada</span> para{" "}
              <span className="font-medium text-foreground">{checkoutNombre}</span>. El sistema puede
              tardar en generar la Boleta de Transacción Web; cuando esté lista, la recibirás por mail
              y podrás verla en Mis Gestiones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border border-border bg-background/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">BLs incluidos</span>
              <span className="font-semibold text-foreground">{gruposBlCheckout.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conceptos</span>
              <span className="font-semibold text-foreground">{itemsCheckout.length}</span>
            </div>
            {netoUSD > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total USD</span>
                <span className="font-mono font-semibold text-foreground">
                  USD {fmtMoneda(netoUSD)}
                </span>
              </div>
            )}
            {(netoARSConceptos > 0 ||
              TARIFA_SERVICIO_APC_CONTADO_ARS > 0 ||
              TARIFA_SERVICIO_APC_CTA_CTE_ARS > 0) && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total ARS (incl. APC)</span>
                <span className="font-mono font-semibold text-foreground">
                  ARS {fmtMoneda(netoARSConApc)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Medio de pago</span>
              <span className="font-semibold text-foreground">
                {medioSeleccionado?.label ?? "—"}
              </span>
            </div>
            {medioSeleccionado?.requiereAgenda &&
              agendaPagoAutomatico &&
              agendaPagoAutomatico !== AGENDA_AUTOMATICA_NO_APLICA && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Agenda pago automático</span>
                  <span className="max-w-[55%] text-right font-semibold text-foreground">
                    {agendasPagosAutomaticos.find((a) => a.value === agendaPagoAutomatico)
                      ?.label ?? "—"}
                  </span>
                </div>
              )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notificar a</span>
              <span className="max-w-[55%] truncate font-semibold text-foreground">
                {agendaMail}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={generando}>
              Volver
            </Button>
            <Button onClick={handleGenerar} disabled={generando}>
              {generando ? "Enviando..." : "Confirmar y generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={boletaProcesoOpen} onOpenChange={setBoletaProcesoOpen}>
        <DialogContent className="border-white/10 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitud registrada</DialogTitle>
            <DialogDescription className="text-left text-sm leading-relaxed text-muted-foreground">
              {ultimaOperacionContratante && (
                <span className="mb-2 block font-medium text-foreground">
                  Operación · {ultimaOperacionContratante}
                </span>
              )}
              La Boleta de Transacción Web no está disponible al instante: el sistema la genera
              después de crear la operación. Te notificaremos al mail de tu agenda cuando esté lista.
              Podés seguir el estado en{" "}
              <span className="font-medium text-foreground">Mis Gestiones</span>, según la{" "}
              <a
                href="https://www.gestion-online.com.ar/v3/Guias/Guia-para-operar-en-la-web/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                guía oficial
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setBoletaProcesoOpen(false)}>
              Cerrar
            </Button>
            <Button
              className="gap-2"
              onClick={() => {
                setBoletaProcesoOpen(false);
                router.push("/dashboard/mis-gestiones");
              }}
            >
              <FileText className="h-4 w-4" />
              Ir a Mis Gestiones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
