"use client";

import { useEffect, useState } from "react";
import { DollarSign, Euro, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchCotizacion,
  formatCotizacion,
  type Cotizacion,
} from "@/services/cotizacion";

type Status = "idle" | "loading" | "success" | "not_found" | "error";

export function CotizacionDialog({
  contratanteSigla,
  contratanteTitle,
}: {
  contratanteSigla: string;
  contratanteTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Cotizacion | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus("loading");
    fetchCotizacion(contratanteSigla).then((r) => {
      if (cancelled) return;
      if (r.success && r.data) {
        setData(r.data);
        setStatus("success");
      } else if (r.error === "not_found") {
        setStatus("not_found");
      } else {
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, contratanteSigla]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-left transition-colors hover:border-emerald-500/30 hover:bg-secondary/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/70">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">
              Cotización del día
            </p>
            <p className="text-[11px] text-muted-foreground">
              Ver tipo de cambio asignado por la agencia
            </p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="border-white/10 bg-card p-0 sm:max-w-md">
        {/* Encabezado con gradiente */}
        <div className="relative overflow-hidden rounded-t-lg border-b border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/30">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-bold text-foreground">
                  Cotización del día
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  Tipo de cambio asignado por la agencia
                  {contratanteTitle ? ` ${contratanteTitle}` : ""}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 pt-5">
          {status === "loading" && (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs text-muted-foreground">
                Obteniendo cotización...
              </span>
            </div>
          )}

          {status === "success" && data && <CotizacionView data={data} />}

          {status === "not_found" && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <AlertCircle className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No hay cotización cargada
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  La agencia aún no publicó una cotización para el día de hoy.
                  Intentá nuevamente en unos minutos.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No se pudo obtener la cotización
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Ocurrió un error temporal. Por favor probá nuevamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CotizacionView({ data }: { data: Cotizacion }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <CurrencyCard
        label="USD"
        icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
        value={formatCotizacion(data.usd)}
        accent="emerald"
      />
      <CurrencyCard
        label="EUR"
        icon={<Euro className="h-4 w-4 text-blue-400" />}
        value={formatCotizacion(data.eur)}
        accent="blue"
      />
    </div>
  );
}

function CurrencyCard({
  label,
  icon,
  value,
  accent,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  accent: "emerald" | "blue";
}) {
  const cardCls =
    accent === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : "border-blue-500/20 bg-blue-500/5";
  const badgeCls =
    accent === "emerald"
      ? "bg-emerald-500/20 ring-emerald-400/30 text-emerald-400"
      : "bg-blue-500/20 ring-blue-400/30 text-blue-400";

  return (
    <div className={`rounded-xl border p-4 ${cardCls}`}>
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${badgeCls}`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-2.5 text-3xl font-bold text-foreground">${value}</p>
    </div>
  );
}
