"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import { Search, Download, Clock, CheckCircle2, XCircle, Filter, ChevronRight, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { mockTransacciones } from "./data";

/** Fechas mock en formato DD/MM/YYYY (ej. "10/04/2025"). */
function parseTransaccionFecha(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Valor de `<input type="date">` (YYYY-MM-DD). */
function parseDateInputValue(s: string): Date | null {
  if (!s.trim()) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

/** Igual criterio que retenciones (EstadosYBusqueda): borde teñido + hover con tinte del estado. */
const estadoVisual: Record<
  string,
  {
    icon: ElementType;
    iconWrap: string;
    badge: string;
    cardBorder: string;
    hoverBg: string;
    hoverBorder: string;
    filterBg: string;
    filterBorder: string;
  }
> = {
  Pagado: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    badge: "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
    cardBorder: "border-emerald-500/25",
    hoverBg: "hover:bg-emerald-500/15 dark:hover:bg-emerald-500/10",
    hoverBorder: "hover:border-emerald-500/45 dark:hover:border-emerald-500/35",
    filterBg: "bg-emerald-500/[0.22] dark:bg-emerald-500/15",
    filterBorder: "border-emerald-600 dark:border-emerald-500",
  },
  Pendiente: {
    icon: Clock,
    iconWrap: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    badge: "border-transparent bg-amber-500/15 text-amber-900 dark:text-amber-200",
    cardBorder: "border-amber-500/25",
    hoverBg: "hover:bg-amber-500/15 dark:hover:bg-amber-500/10",
    hoverBorder: "hover:border-amber-500/45 dark:hover:border-amber-500/35",
    filterBg: "bg-amber-500/[0.22] dark:bg-amber-500/15",
    filterBorder: "border-amber-600 dark:border-amber-500",
  },
  "En proceso": {
    icon: Clock,
    iconWrap: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    badge: "border-transparent bg-blue-500/15 text-blue-900 dark:text-blue-200",
    cardBorder: "border-blue-500/25",
    hoverBg: "hover:bg-blue-500/15 dark:hover:bg-blue-500/10",
    hoverBorder: "hover:border-blue-500/45 dark:hover:border-blue-500/35",
    filterBg: "bg-blue-500/[0.22] dark:bg-blue-500/15",
    filterBorder: "border-blue-600 dark:border-blue-500",
  },
  Rechazado: {
    icon: XCircle,
    iconWrap: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    badge: "border-transparent bg-rose-500/15 text-rose-900 dark:text-rose-200",
    cardBorder: "border-rose-500/25",
    hoverBg: "hover:bg-rose-500/15 dark:hover:bg-rose-500/10",
    hoverBorder: "hover:border-rose-500/45 dark:hover:border-rose-500/35",
    filterBg: "bg-rose-500/[0.22] dark:bg-rose-500/15",
    filterBorder: "border-rose-600 dark:border-rose-500",
  },
};

export default function MisGestionesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fechaFiltro, setFechaFiltro] = useState("");

  const filtered = mockTransacciones.filter((t) => {
    const matchesSearch =
      t.nro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.estado === statusFilter;

    let matchesDate = true;
    if (fechaFiltro) {
      const picked = parseDateInputValue(fechaFiltro);
      const tx = parseTransaccionFecha(t.fecha);
      if (picked && tx) {
        matchesDate = startOfLocalDay(tx) === startOfLocalDay(picked);
      } else {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 min-h-[3.5rem] items-center px-dash sm:h-16">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mis Gestiones</h1>
            <p className="text-sm text-muted-foreground">
              Historial de transacciones y comprobantes
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-dash py-dash">
        <div className="flex w-full justify-start">
          <Card id="mis-gestiones-intro" className="w-fit max-w-full gap-0 border-border bg-card py-0">
            <CardContent className="px-6 py-6 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0 max-w-3xl space-y-2">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
                      Tus gestiones y comprobantes
                    </h2>
                    <p className="text-sm leading-snug text-muted-foreground">
                      Buscá por número de transacción o BL y filtrá por estado para abrir el detalle de cada
                      operación.
                    </p>
                  </div>
                  <div className="flex gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-4 py-3 dark:border-white/10 dark:bg-muted/20">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
                    <p className="text-xs leading-snug text-muted-foreground sm:text-[13px] sm:leading-snug">
                      Cuando un movimiento figure como confirmado, podés descargar los{" "}
                      <span className="font-semibold text-foreground">comprobantes</span> desde la vista detalle.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="gap-0 border-border bg-card py-0">
          <CardContent className="px-4 py-3 sm:px-5 sm:py-3">
            <div className="flex flex-col gap-1.5 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="relative w-full min-w-0 max-w-full sm:max-w-[min(100%,22rem)] lg:flex-1 lg:max-w-md xl:max-w-lg">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Nro. de Transacción o BL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border border-transparent bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:min-w-0 lg:flex-1 lg:justify-end">
                <div className="w-full sm:w-auto sm:min-w-[11rem] sm:max-w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 w-full border border-transparent bg-secondary/50">
                      <Filter className="mr-2 h-4 w-4 shrink-0" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pagado">Pagado</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En proceso">En proceso</SelectItem>
                      <SelectItem value="Rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full min-w-0 gap-0.5 sm:w-auto sm:min-w-[10.5rem]">
                  <Label
                    htmlFor="mis-gestiones-fecha"
                    className="text-[10px] font-semibold uppercase leading-none tracking-wide text-muted-foreground"
                  >
                    Fecha
                  </Label>
                  <Input
                    id="mis-gestiones-fecha"
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                    className="h-10 border border-transparent bg-secondary/50 px-2 text-sm text-foreground focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {["Pagado", "Pendiente", "En proceso", "Rechazado"].map((status) => {
            const count = mockTransacciones.filter((t) => t.estado === status).length;
            const cfg = estadoVisual[status];
            const Icon = cfg.icon;
            const filtered = statusFilter === status;
            return (
              <Card
                key={status}
                className={cn(
                  "cursor-pointer gap-0 border py-0 transition-colors duration-200",
                  filtered ? cn(cfg.filterBg, cfg.filterBorder) : cn("bg-card", cfg.cardBorder),
                  cfg.hoverBg,
                  cfg.hoverBorder,
                )}
                onClick={() => setStatusFilter(filtered ? "all" : status)}
              >
                <CardContent className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm leading-none text-muted-foreground">{status}</p>
                      <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
                        {count}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        cfg.iconWrap,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Transactions table */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Nro. Transacción</TableHead>
                  <TableHead>BL</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Medio de pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total USD</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const cfg = estadoVisual[t.estado];
                  return (
                    <TableRow key={t.id} className="border-border">
                      <TableCell className="font-mono text-sm font-medium text-foreground">
                        {t.nro}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {t.bl}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.fecha}</TableCell>
                      <TableCell className="text-muted-foreground">{t.medioPago}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cfg.badge}>
                          {t.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {t.totalUSD.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              // Placeholder: se puede reemplazar por descarga real (PDF/ZIP) cuando exista API.
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar boleta
                          </Button>
                          <Button asChild variant="default" className="h-9 gap-2 font-semibold shadow-sm">
                            <Link href={`/dashboard/mis-gestiones/${t.id}`}>
                              Ver detalle
                              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No se encontraron transacciones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
