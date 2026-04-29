"use client";
 
/**
 * EstadosYBusqueda — reemplaza los dos cards anteriores en uno solo.
 *
 * CAMBIOS EN page.tsx:
 * 1. Eliminá el import de BusquedaEstados
 * 2. Agregá el import:
 *      import { EstadosYBusqueda } from "@/components/EstadosYBusqueda";
 * 3. Reemplazá TODO este bloque (líneas ~395–439):
 *
 *      {/* ── Detalle de estados ── *\/}
 *      <Card className="border-border bg-card">
 *        ...
 *      </Card>
 *
 *      {/* ── Búsqueda por estados ── *\/}
 *      <BusquedaEstados />
 *
 *    Por esto:
 *
 *      <EstadosYBusqueda />
 */
 
import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronDown,
  Loader2,
  MousePointerClick,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
type EstadoId = "pendiente" | "confirmada" | "rechazada" | "aplicada";
 
interface Retencion {
  numero: string;
  fecha: string;
  cuitEmisor: string;
  contratante: string;
  tipo: string;
  estado: EstadoId;
  pedido: string;
  importe: string;
  transaccion: string;
  vencimiento: string;
  observacion?: string;
  motivoRechazo?: string;
}
 
// ─── Config de estados ────────────────────────────────────────────────────────
const ESTADOS_CONFIG = [
  {
    id: "pendiente" as EstadoId,
    label: "Pendientes",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    borderActive: "border-amber-400",
    ringActive: "ring-1 ring-amber-400/40",
    hoverBg: "hover:bg-amber-500/15 dark:hover:bg-amber-500/10",
    activeBg: "bg-amber-500/20 dark:bg-amber-500/15",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    modalBorder: "border-amber-500/30",
    modalHeader: "bg-amber-500/10",
    desc: "En revisión por nuestro equipo antes de ser aceptadas o rechazadas.",
  },
  {
    id: "confirmada" as EstadoId,
    label: "Confirmadas",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    borderActive: "border-emerald-400",
    ringActive: "ring-1 ring-emerald-400/40",
    hoverBg: "hover:bg-emerald-500/15 dark:hover:bg-emerald-500/10",
    activeBg: "bg-emerald-500/20 dark:bg-emerald-500/15",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    modalBorder: "border-emerald-500/30",
    modalHeader: "bg-emerald-500/10",
    desc: "Listas para aplicarse al próximo pago. Deben estar vigentes.",
  },
  {
    id: "rechazada" as EstadoId,
    label: "Rechazadas",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    borderActive: "border-rose-400",
    ringActive: "ring-1 ring-rose-400/40",
    hoverBg: "hover:bg-rose-500/15 dark:hover:bg-rose-500/10",
    activeBg: "bg-rose-500/20 dark:bg-rose-500/15",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    modalBorder: "border-rose-500/30",
    modalHeader: "bg-rose-500/10",
    desc: "Difieren con el comprobante cargado. Cuentan con el motivo del rechazo.",
  },
  {
    id: "aplicada" as EstadoId,
    label: "Aplicadas",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    borderActive: "border-blue-400",
    ringActive: "ring-1 ring-blue-400/40",
    hoverBg: "hover:bg-blue-500/15 dark:hover:bg-blue-500/10",
    activeBg: "bg-blue-500/20 dark:bg-blue-500/15",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    modalBorder: "border-blue-500/30",
    modalHeader: "bg-blue-500/10",
    desc: "Ya fueron incluidas en el pago de una transacción.",
  },
] as const;
 
// ─── Mock — reemplazar por fetch real ─────────────────────────────────────────
// GET /api/retenciones?estado={estado}
const MOCK_TIPOS = ["IVA", "GANANCIAS", "SUSS", "IBB CABA"] as const;
const MOCK_CUITS = ["30-71234567-8", "20-30123456-7", "27-98765432-1", "20-11223344-5"] as const;
const MOCK_CONTRATANTES = ["Agencia Ejemplo S.A.", "Otra Agencia S.R.L."] as const;

/** 30 filas para previsualizar lista + scroll al elegir “Aplicadas”. */
const MOCK_APLICADAS: Retencion[] = Array.from({ length: 30 }, (_, i) => {
  const d = 1 + (i % 28);
  const m = 1 + ((i * 3) % 12);
  const y = 2024 + (i % 2);
  const fecha = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  const entero = 1200 + i * 173;
  const cents = (i * 37) % 100;
  const importe = `${entero.toLocaleString("es-AR")},${String(cents).padStart(2, "0")}`;
  return {
    numero: String(9900000000 + i).padStart(10, "0"),
    fecha,
    cuitEmisor: MOCK_CUITS[i % MOCK_CUITS.length],
    contratante: MOCK_CONTRATANTES[i % 2],
    tipo: MOCK_TIPOS[i % MOCK_TIPOS.length],
    estado: "aplicada",
    pedido: String(38470 + i),
    importe,
    transaccion: String(1629000 + i * 11),
    vencimiento: `2026-${String(((m + i) % 12) + 1).padStart(2, "0")}-15`,
    observacion: i % 7 === 0 ? `Liquidación ${i + 1} · pago consolidado` : undefined,
  };
});

const MOCK_DATA: Retencion[] = [
  { numero: "0000012345", fecha: "10/04/2025", cuitEmisor: "30-71234567-8", contratante: "Agencia Ejemplo S.A.", tipo: "IVA", estado: "pendiente", pedido: "38994", importe: "2.940,00", transaccion: "1634920", vencimiento: "2026-06-30" },
  { numero: "0000067890", fecha: "22/03/2025", cuitEmisor: "20-30123456-7", contratante: "Otra Agencia S.R.L.", tipo: "GANANCIAS", estado: "confirmada", pedido: "38812", importe: "1.250,00", transaccion: "1634100", vencimiento: "2026-03-31" },
  { numero: "0000054321", fecha: "05/03/2025", cuitEmisor: "30-55443322-1", contratante: "Agencia Ejemplo S.A.", tipo: "IVA", estado: "confirmada", pedido: "38750", importe: "3.800,00", transaccion: "1633450", vencimiento: "2026-03-31" },
  { numero: "0000078456", fecha: "18/03/2025", cuitEmisor: "27-11223344-9", contratante: "Otra Agencia S.R.L.", tipo: "IBB CABA", estado: "confirmada", pedido: "38799", importe: "980,00", transaccion: "1633890", vencimiento: "2026-04-30" },
  { numero: "0000011111", fecha: "15/02/2025", cuitEmisor: "27-98765432-1", contratante: "Agencia Ejemplo S.A.", tipo: "IBB CABA", estado: "rechazada", pedido: "38600", importe: "560,00", transaccion: "1632100", vencimiento: "2026-02-28", motivoRechazo: "El CUIT emisor no coincide con el comprobante cargado." },
  ...MOCK_APLICADAS,
];
 
async function fetchRetenciones(estado: EstadoId): Promise<Retencion[]> {
  await new Promise((r) => setTimeout(r, 450));
  return MOCK_DATA.filter((r) => r.estado === estado);
}
 
// ─── Componente ───────────────────────────────────────────────────────────────
export function EstadosYBusqueda() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadoModal, setEstadoModal] = useState<EstadoId | null>(null);
  const [resultados, setResultados] = useState<Retencion[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [filaAbierta, setFilaAbierta] = useState<string | null>(null);
 
  const cfgModal = estadoModal ? ESTADOS_CONFIG.find((e) => e.id === estadoModal) : null;
 
  // Cerrar con Escape
  useEffect(() => {
    if (!modalAbierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalAbierto]);
 
  const cerrarModal = () => {
    setModalAbierto(false);
    setEstadoModal(null);
    setResultados(null);
    setFilaAbierta(null);
  };
 
  const handleSeleccionar = async (id: EstadoId) => {
    setEstadoModal(id);
    setResultados(null);
    setFilaAbierta(null);
    setCargando(true);
    setModalAbierto(true);
    try {
      const data = await fetchRetenciones(id);
      setResultados(data);
    } finally {
      setCargando(false);
    }
  };
 
  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" />
            ¿Qué tenés que saber?
          </CardTitle>
          <CardDescription>
            Las retenciones tienen un vencimiento según cada impuesto, y se aplican únicamente sobre gastos y facturas de{" "}
            <span className="font-semibold text-foreground">Agencia</span>, no de Armador. Al llegar al{" "}
            <span className="font-semibold text-foreground">carrito</span>, vas a poder verificar las retenciones que serán incluidas en el pago y que se{" "}
            <span className="font-semibold text-emerald-400">descuentan del total a pagar</span>.
          </CardDescription>
          <div
            className={cn(
              "mt-3 flex items-center gap-3 rounded-xl border-2 border-dashed px-3.5 py-3 shadow-sm",
              "border-amber-500/45 bg-gradient-to-r from-amber-500/18 via-amber-500/12 to-orange-500/10",
              "dark:border-amber-400/35 dark:from-amber-500/14 dark:via-amber-500/10 dark:to-amber-600/8",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                "bg-amber-500/35 text-amber-900 dark:bg-amber-500/25 dark:text-amber-100",
              )}
              aria-hidden
            >
              <MousePointerClick className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <p className="text-xs font-semibold leading-snug text-amber-950 dark:text-amber-50">
              Hacé clic en un estado para ver tus retenciones.
              <span className="mt-0.5 block text-[11px] font-normal text-amber-900/85 dark:text-amber-100/80">
                Elegí uno de los cuatro recuadros de abajo.
              </span>
            </p>
          </div>
        </CardHeader>
 
        <CardContent className="space-y-4">
          {/* ── Tarjetas de estado como filtros ── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ESTADOS_CONFIG.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSeleccionar(s.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border bg-card p-3 text-left transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    s.border,
                    s.hoverBg,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg)}>
                      <Icon className={cn("h-4 w-4", s.color)} />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
 
      {/* ── Modal ── */}
      {modalAbierto && cfgModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={cerrarModal}
            aria-hidden
          />
 
          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={cn(
                "flex w-full max-w-2xl flex-col rounded-2xl border bg-card shadow-2xl",
                "max-h-[80vh]",
                cfgModal.modalBorder,
              )}
              role="dialog"
              aria-modal="true"
            >
              {/* Header del modal */}
              <div className={cn("flex shrink-0 items-center justify-between rounded-t-2xl px-5 py-4", cfgModal.modalHeader)}>
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cfgModal.bg)}>
                    <cfgModal.icon className={cn("h-4 w-4", cfgModal.color)} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Retenciones {cfgModal.label.toLowerCase()}
                    </h2>
                    {resultados !== null && !cargando && (
                      <p className="text-xs text-muted-foreground">
                        {resultados.length === 0
                          ? "Sin resultados"
                          : `${resultados.length} retención${resultados.length !== 1 ? "es" : ""}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
 
              {/* Contenido scrolleable */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
                {cargando ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className={cn("h-6 w-6 animate-spin", cfgModal.color)} />
                  </div>
                ) : resultados === null ? null : resultados.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/10 px-4 py-3 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    No encontramos retenciones con ese estado.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resultados.map((r) => {
                      const cfg = ESTADOS_CONFIG.find((e) => e.id === r.estado)!;
                      const Icon = cfg.icon;
                      const expandida = filaAbierta === r.numero;
                      return (
                        <div
                          key={r.numero}
                          className={cn(
                            "overflow-hidden rounded-lg border bg-secondary/20",
                            cfg.border,
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setFilaAbierta(expandida ? null : r.numero)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/40"
                          >
                            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", cfg.bg)}>
                              <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                            </span>
 
                            <span className="w-28 shrink-0 font-mono text-xs font-semibold text-foreground">
                              #{r.numero}
                            </span>
 
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                              <span>{r.fecha}</span>
                              <ChevronRight className="h-3 w-3 shrink-0 opacity-30" />
                              <span className="font-mono">{r.cuitEmisor}</span>
                              <ChevronRight className="h-3 w-3 shrink-0 opacity-30" />
                              <span className="truncate">{r.contratante}</span>
                              <ChevronRight className="h-3 w-3 shrink-0 opacity-30" />
                              <span className="font-medium text-foreground/70">{r.tipo}</span>
                            </div>
 
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                expandida && "rotate-180",
                              )}
                              aria-hidden
                            />
 
                            <Badge variant="outline" className={cn("ml-0 shrink-0 text-[10px] sm:ml-1", cfg.badge)}>
                              {cfg.label.slice(0, -1)}
                            </Badge>
                          </button>
 
                          {expandida && (
                            <div className="border-t border-border/60 bg-muted/20">
                              <div className="px-3 py-2.5 text-xs text-muted-foreground">
                                <dl className="grid gap-2 sm:grid-cols-2">
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Pedido</dt>
                                    <dd className="font-mono text-foreground">{r.pedido}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Número de retención</dt>
                                    <dd className="font-mono text-foreground">#{r.numero}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">CUIT emisor</dt>
                                    <dd className="font-mono text-foreground">{r.cuitEmisor}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Importe</dt>
                                    <dd className="font-medium text-foreground">$ {r.importe}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Transacción</dt>
                                    <dd className="font-mono text-foreground">{r.transaccion}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Fecha de la retención</dt>
                                    <dd className="text-foreground">{r.fecha}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Vencimiento</dt>
                                    <dd className="text-foreground">{r.vencimiento}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Estado</dt>
                                    <dd className="text-foreground">{cfg.label.slice(0, -1)}</dd>
                                  </div>
                                  {r.observacion && (
                                    <div className="sm:col-span-2">
                                      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Observación</dt>
                                      <dd className="text-foreground">{r.observacion}</dd>
                                    </div>
                                  )}
                                </dl>
                                {r.motivoRechazo && (
                                  <div className="mt-3 rounded-md border border-rose-500/25 bg-rose-500/10 px-2.5 py-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                                      Motivo del rechazo
                                    </p>
                                    <p className="mt-1 text-[11px] leading-relaxed text-rose-950 dark:text-rose-100">
                                      {r.motivoRechazo}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}