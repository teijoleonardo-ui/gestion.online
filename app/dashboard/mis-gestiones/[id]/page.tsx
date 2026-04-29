"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Bell,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTransaccionById } from "../data";

const estadoStyles: Record<
  string,
  {
    badge: string;
    icon: React.ElementType;
    iconWrap: string;
    iconColor: string;
    cardBg: string;
    hint: string;
  }
> = {
  Pagado: {
    badge: "bg-primary/20 text-primary",
    icon: CheckCircle2,
    iconWrap: "bg-primary/15",
    iconColor: "text-primary",
    cardBg: "bg-primary/5 hover:bg-primary/10",
    hint: "La transacción se registró correctamente.",
  },
  Pendiente: {
    badge: "bg-chart-3/20 text-chart-3",
    icon: Clock,
    iconWrap: "bg-chart-3/15",
    iconColor: "text-chart-3",
    cardBg: "bg-chart-3/5 hover:bg-chart-3/10",
    hint: "Aguardando la aplicación del pago.",
  },
  Rechazado: {
    badge: "bg-destructive/20 text-destructive",
    icon: Clock,
    iconWrap: "bg-destructive/15",
    iconColor: "text-destructive",
    cardBg: "bg-destructive/5 hover:bg-destructive/10",
    hint: "Revisá los datos y volvé a generar la transacción.",
  },
  "En proceso": {
    badge: "bg-chart-2/20 text-chart-2",
    icon: Clock,
    iconWrap: "bg-chart-2/15",
    iconColor: "text-chart-2",
    cardBg: "bg-chart-2/5 hover:bg-chart-2/10",
    hint: "La transacción se está procesando.",
  },
};

export default function MisGestionesDetallePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const trx = useMemo(() => (Number.isFinite(id) ? getTransaccionById(id) : null), [id]);
  const rows = trx?.comprobantesRows ?? [];
  const tipos = useMemo(() => Array.from(new Set(rows.map((r) => r.tipo))), [rows]);
  const [activeTipo, setActiveTipo] = useState<string>(() => tipos[0] ?? "Recibo");
  const filteredRows = useMemo(
    () => rows.filter((r) => r.tipo === activeTipo),
    [rows, activeTipo],
  );

  if (!trx) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Detalle</h1>
              <p className="text-sm text-muted-foreground">Transacción no encontrada</p>
            </div>
            <Button asChild variant="secondary" className="bg-secondary/50">
              <Link href="/dashboard/mis-gestiones">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
        </header>
      </div>
    );
  }

  const style = estadoStyles[trx.estado] ?? estadoStyles["En proceso"];
  const EstadoIcon = style.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transacción
            </p>
            <h1 className="truncate font-mono text-lg font-semibold text-foreground">{trx.nro}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={style.badge}>
              {trx.estado}
            </Badge>
            <Button asChild variant="secondary" className="bg-secondary/50">
              <Link href="/dashboard/mis-gestiones">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-6 p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Columna principal */}
        <div className="min-w-0 space-y-4">
          {/* Seguimiento + Boleta compactos, estilo dashboard */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Seguimiento */}
            <div className={cn(
              "rounded-2xl border border-white/5 p-4 transition-colors",
              style.cardBg,
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  style.iconWrap,
                )}>
                  <EstadoIcon className={cn("h-5 w-5", style.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Seguimiento
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{trx.estado}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{style.hint}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fecha</p>
                  <p className="truncate font-medium text-foreground">{trx.fecha}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">BL</p>
                  <p className="truncate font-mono font-medium text-foreground" title={trx.bl}>
                    {trx.bl}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pago</p>
                  <p className="truncate font-medium text-foreground" title={trx.medioPago}>
                    {trx.medioPago}
                  </p>
                </div>
              </div>
            </div>

            {/* Boleta */}
            <button
              type="button"
              onClick={() => {
                // Placeholder: reemplazar por descarga real cuando exista API.
              }}
              className="group flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-primary/5 p-4 text-left transition-all hover:border-white/10 hover:bg-primary/10"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Boleta
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">Descargar boleta</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Comprobante principal de la transacción
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 text-[11px] font-medium text-muted-foreground group-hover:text-primary">
                <FileText className="h-3.5 w-3.5" />
                PDF
              </div>
            </button>
          </div>

          {/* Qué tenés que saber · compacto */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Qué tenés que saber</CardTitle>
              <CardDescription className="text-xs">
                Recomendaciones para evitar demoras
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-2.5">
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-inset ring-blue-600/40 dark:ring-blue-500/35"
                  aria-hidden
                >
                  <Info className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                </span>
                <p>
                  Recordá que la transacción solo podrá ser cobrada utilizando el medio de pago que
                  seleccionaste al momento de registrarla.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-inset ring-amber-600/40 dark:ring-amber-500/35"
                  aria-hidden
                >
                  <Bell className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                </span>
                <p>
                  Cuando esté en estado &quot;Finalizada&quot;, podés acercarte a APC de lunes a
                  viernes entre las 10:30 y las 16:30 hs para retirar o presentar la documentación.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-inset ring-indigo-600/40 dark:ring-indigo-500/35"
                  aria-hidden
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-400" />
                </span>
                <p>
                  Es obligatorio traer la boleta de transacción web impresa para completar el
                  proceso.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-600/40 dark:ring-emerald-500/35"
                  aria-hidden
                >
                  <Info className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                </span>
                <p>
                  Si la transacción está &quot;Finalizada&quot;, consultá tus comprobantes abajo.
                  Podés descargarlos en PDF individual o todos juntos en un ZIP.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="mt-6 space-y-4 lg:mt-0">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen</CardTitle>
              <CardDescription>Totales de la transacción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Importe total</span>
                <span className="font-mono font-semibold text-foreground">
                  USD {trx.totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Retenciones</span>
                <span className="font-mono text-foreground">0,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cuenta corriente</span>
                <span className="font-mono text-foreground">0,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contado</span>
                <span className="font-mono text-foreground">0,00</span>
              </div>
              <div className="mt-3 rounded-xl bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">A pagar</span>
                  <span className="font-mono font-semibold text-foreground">0,00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comprobantes full width */}
        <Card className="mt-6 border-border bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Comprobantes</CardTitle>
                <CardDescription>
                  Encontrá y descargá tus comprobantes sin perder tiempo
                </CardDescription>
              </div>
              <Button
                variant="default"
                className="h-9 gap-2 font-semibold shadow-sm"
                disabled={rows.length === 0}
                onClick={() => {
                  // Placeholder: descarga masiva (ZIP) cuando exista API.
                }}
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                Descargar todos los comprobantes ({rows.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total de comprobantes ({rows.length})
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {tipos.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setActiveTipo(tipo)}
                        className={cn(
                          "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                          activeTipo === tipo
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-secondary/20 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="max-w-full">
                    <table className="w-full table-fixed text-[11px]">
                      <colgroup>
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "6%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "11%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "13%" }} />
                      </colgroup>
                      <thead className="bg-secondary/20 text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2.5 text-left">TRANSACCIÓN</th>
                          <th className="px-3 py-2.5 text-left">COMPROBANTE</th>
                          <th className="px-3 py-2.5 text-left">FACTURADO A</th>
                          <th className="px-3 py-2.5 text-left">MONEDA</th>
                          <th className="px-3 py-2.5 text-right">IMPORTE</th>
                          <th className="px-3 py-2.5 text-right">COTIZACIÓN</th>
                          <th className="px-3 py-2.5 text-left">ITEM</th>
                          <th className="px-3 py-2.5 text-left">CONTENEDOR</th>
                          <th className="px-3 py-2.5 text-right">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredRows.map((r) => (
                          <tr key={r.id} className="bg-card align-top">
                            <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                              <span className="block truncate">{r.transaccion}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="min-w-0">
                                <div className="truncate text-[12px] font-semibold text-foreground">
                                  {r.comprobante}
                                </div>
                                <div className="truncate text-[11px] text-muted-foreground">{r.tipo}</div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              <span className="block truncate" title={r.facturadoA}>
                                {r.facturadoA}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                              {r.moneda}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-foreground whitespace-nowrap">
                              {r.importe.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                              {r.cotizacion === null
                                ? "-"
                                : r.cotizacion.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                              <span className="block truncate" title={r.item}>
                                {r.item}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                              <span className="block truncate" title={r.contenedor}>
                                {r.contenedor}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {r.estado === "Disponible" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto inline-flex h-7 items-center gap-1.5 px-2 text-[11px] font-medium text-muted-foreground hover:text-primary"
                                  onClick={() => {
                                    // Placeholder: descarga individual (PDF) cuando exista API.
                                  }}
                                >
                                  Descargar
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredRows.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                              No hay comprobantes para este tipo.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-secondary/20 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay comprobantes disponibles para esta transacción.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

