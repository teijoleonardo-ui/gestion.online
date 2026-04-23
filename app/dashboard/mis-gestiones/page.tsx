"use client";

import { useState } from "react";
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
import { mockTransacciones } from "./data";

const estadoConfig: Record<string, { icon: React.ElementType; className: string }> = {
  Pagado: { icon: CheckCircle2, className: "bg-primary/20 text-primary" },
  Pendiente: { icon: Clock, className: "bg-chart-3/20 text-chart-3" },
  Rechazado: { icon: XCircle, className: "bg-destructive/20 text-destructive" },
  "En proceso": { icon: Clock, className: "bg-chart-2/20 text-chart-2" },
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
                  className="h-12 bg-secondary/50 border-0 pl-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 w-full sm:w-[180px] bg-secondary/50 border-0">
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
            const config = estadoConfig[status];
            const Icon = config.icon;
            return (
              <Card
                key={status}
                className={`border-border bg-card cursor-pointer transition-all hover:border-primary/30 ${
                  statusFilter === status ? "border-primary" : ""
                }`}
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{status}</p>
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.className}`}>
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
                  const config = estadoConfig[t.estado];
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
                        <Badge variant="secondary" className={config.className}>
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
