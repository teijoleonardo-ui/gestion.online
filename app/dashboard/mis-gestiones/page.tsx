"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import { Search, Download, Clock, CheckCircle2, XCircle, Filter, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { mockTransacciones } from "./data";

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

  const filtered = mockTransacciones.filter((t) => {
    const matchesSearch =
      t.nro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mis Gestiones</h1>
            <p className="text-sm text-muted-foreground">
              Historial de transacciones y comprobantes
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Search & Filters */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por Nro. de Transacción o BL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 border border-transparent bg-secondary/50 pl-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[180px] border border-transparent bg-secondary/50">
                  <Filter className="mr-2 h-4 w-4" />
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
                  "cursor-pointer border transition-colors duration-200",
                  filtered ? cn(cfg.filterBg, cfg.filterBorder) : cn("bg-card", cfg.cardBorder),
                  cfg.hoverBg,
                  cfg.hoverBorder,
                )}
                onClick={() => setStatusFilter(filtered ? "all" : status)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{status}</p>
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        cfg.iconWrap,
                      )}
                    >
                      <Icon className="h-5 w-5" />
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
                          <Button asChild variant="secondary" size="sm" className="h-9 bg-secondary/50">
                            <Link href={`/dashboard/mis-gestiones/${t.id}`}>
                              Ver detalle
                              <ChevronRight className="ml-1.5 h-4 w-4" />
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
