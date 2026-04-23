"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSearch,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildArcaPublicUrl } from "@/services/constancia-arca";

// ─── Contrato del backend interno ────────────────────────────────────
// Cuando exista el backend real para el estado interno de la carta:
//   GET /api/carta-garantia/:cuit
//   → 200 { estado: "vigente"|"no_presentada", desde?, hasta? }
//   → 404 { error: "not_found" }
type ResultadoInterno =
  | { kind: "vigente"; desde: string; hasta: string }
  | { kind: "no_presentada" }
  | { kind: "no_existe" };

async function mockConsultarCartaGarantia(
  cuit: string
): Promise<ResultadoInterno> {
  await new Promise((r) => setTimeout(r, 450));
  // CUITs de demo para previsualizar los tres estados.
  if (cuit === "20405404967") return { kind: "no_existe" };
  if (cuit.endsWith("0")) return { kind: "no_presentada" };
  return { kind: "vigente", desde: "2026", hasta: "2027" };
}

const isCuitValido = (v: string) => /^\d{11}$/.test(v);

// ─── Componente principal ────────────────────────────────────────────
export function CartaGarantiaSection() {
  const [cuit, setCuit] = useState("");
  const [loading, setLoading] = useState(false);
  const [consulta, setConsulta] = useState<{
    cuit: string;
    resultado: ResultadoInterno;
  } | null>(null);

  const canSearch = isCuitValido(cuit) && !loading;

  const handleConsultar = async () => {
    if (!canSearch) return;
    setLoading(true);
    const resultado = await mockConsultarCartaGarantia(cuit);
    setConsulta({ cuit, resultado });
    setLoading(false);
  };

  const handleCuitChange = (v: string) => {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 11);
    setCuit(onlyDigits);
  };

  const arcaUrl = useMemo(
    () => (consulta ? buildArcaPublicUrl(consulta.cuit) : null),
    [consulta]
  );

  return (
    <Card className="border-white/5 bg-card">
      <CardContent className="p-6">
        {/* Header + input */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Carta de Garantía</h4>
              <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                Si la consulta indica que la carta se encuentra vigente, podrás
                operar sin problemas. Sin carta presentada no podrás abonar
                hasta su entrega física en APC.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Av. Leandro N. Alem 584 Piso 2 (CABA)
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:items-end">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ingresá el CUIT (11 dígitos)"
                value={cuit}
                onChange={(e) => handleCuitChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConsultar();
                }}
                maxLength={11}
                className="h-10 w-56 rounded-xl border border-white/10 bg-secondary/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Button
                size="sm"
                className="h-10 px-4"
                onClick={handleConsultar}
                disabled={!canSearch}
              >
                {loading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                )}
                Consultar
              </Button>
            </div>
            <a
              href="http://www.apconline.com.ar/carta.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Download className="h-3 w-3" />
              Descargar modelo
            </a>
          </div>
        </div>

        {/* 2 columnas: resultado interno + constancia ARCA */}
        {consulta && arcaUrl && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ResultadoInternoCard consulta={consulta} />
            <ConstanciaArcaCard cuit={consulta.cuit} url={arcaUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Columna izquierda: resultado interno ────────────────────────────
function ResultadoInternoCard({
  consulta,
}: {
  consulta: { cuit: string; resultado: ResultadoInterno };
}) {
  const { resultado, cuit } = consulta;

  if (resultado.kind === "vigente") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <p className="text-sm text-foreground">
            Estado:{" "}
            <span className="text-base font-bold text-emerald-400">VIGENTE</span>
          </p>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p>
            Válida para los años{" "}
            <span className="font-semibold text-foreground">{resultado.desde}</span>{" "}
            y{" "}
            <span className="font-semibold text-foreground">{resultado.hasta}</span>.
          </p>
          <p>
            Solo en caso de modificaciones se informará con la debida anticipación.
          </p>
          <p>Esta carta aplica para todos los contratantes disponibles en nuestra plataforma.</p>
          <p>No es necesario realizar una reconfirmación adicional.</p>
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground/70">
          CUIT consultado: {cuit}
        </p>
      </div>
    );
  }

  if (resultado.kind === "no_presentada") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <p className="text-sm text-foreground">
            Estado:{" "}
            <span className="text-base font-bold text-amber-400">NO PRESENTADA</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          No podrás abonar hasta que la carta sea entregada de manera física en
          APC y recibida correctamente.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Dirección: Av. Leandro N. Alem 584 Piso 2 (CABA).
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground/70">
          CUIT consultado: {cuit}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-rose-400" />
        <p className="text-sm text-foreground">
          Estado:{" "}
          <span className="text-base font-bold text-rose-400">NO EXISTE</span>
        </p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        El cliente{" "}
        <span className="font-mono font-semibold text-foreground">{cuit}</span>{" "}
        no existe en nuestra base de datos. Por favor revisá la información
        ingresada. En caso de que sea correcta, enviános un mail a{" "}
        <a
          href="mailto:recepcion@gestion-online.com.ar"
          className="font-medium text-primary hover:underline"
        >
          recepcion@gestion-online.com.ar
        </a>{" "}
        pidiendo el alta del mismo.
      </p>
    </div>
  );
}

// ─── Columna derecha: constancia ARCA (iframe) ───────────────────────
// El backend tiene que resolver la integración con ARCA.
// Opciones documentadas en `services/constancia-arca.ts`:
//   1) Web Service oficial `ws_sr_constancia_inscripcion` vía WSAA.
//   2) Afip SDK / Arca SDK (REST con Bearer token).
// Cuando esté listo, reemplazar el iframe por una tarjeta que consuma
// `fetchConstanciaArca(cuit)` y muestre razón social, domicilio,
// actividad, estado e impuestos.
function ConstanciaArcaCard({ cuit, url }: { cuit: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-background/40">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-secondary/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Constancia ARCA
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              CUIT {cuit}
            </p>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-secondary/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir en ARCA
        </a>
      </div>

      <iframe
        src={url}
        title="Constancia ARCA"
        className="h-[600px] w-full bg-white"
      />
    </div>
  );
}
