"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Loader2,
  Trash2,
  CalendarDays,
  Building2,
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CONTRATANTES } from "@/lib/contratantes";
import {
  extractRetencionFromPDF,
  type ExtractedRetencion,
  type TipoRetencionValue,
} from "@/lib/extractRetencion";

// ─── Catálogos ────────────────────────────────────────────────────────────────
const TIPOS_RETENCION: { value: TipoRetencionValue; label: string }[] = [
  { value: "iva", label: "IVA" },
  { value: "ganancias", label: "GANANCIAS" },
  { value: "ibb_caba", label: "IBB CABA" },
  { value: "ibb_arba", label: "IBB ARBA" },
  { value: "suss", label: "SUSS" },
];

// Schema interno del formulario (lo que produce la extracción de pdf.js).
type ExtractedData = ExtractedRetencion;

/** Asegura que el número de retención tenga exactamente 10 dígitos. */
function padNumero(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "").slice(0, 10);
  return digits ? digits.padStart(10, "0") : "";
}

// ─── Hook para el backend: registro de retenciones ya cargadas ────────────────
// Stub local que persiste durante la vida del tab. Cuando se enchufe el
// backend, reemplazar por:
//
//   GET  /api/retenciones/exists?numero={numero}   → { exists: boolean }
//   POST /api/retenciones                          → 201 Created
//                                                  | 409 Conflict { numero }
//
// En el 409 se usa el `numero` para mostrar el cartel rojo de duplicado.
const SUBMITTED_NUMEROS = new Set<string>();

async function checkNumeroDuplicado(numero: string): Promise<boolean> {
  // TODO: reemplazar por `fetch("/api/retenciones/exists?numero=" + numero)`.
  return SUBMITTED_NUMEROS.has(numero);
}

async function registrarRetencion(
  numero: string,
  _payload: ExtractedData,
  _file: File,
): Promise<void> {
  // TODO: reemplazar por `fetch("/api/retenciones", { method: "POST", body: fd })`.
  await new Promise((r) => setTimeout(r, 900));
  SUBMITTED_NUMEROS.add(numero);
}

// ─── Vista: Info + estados ────────────────────────────────────────────────────
const ESTADOS = [
  {
    id: "pendiente",
    label: "Pendientes",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    desc: "En revisión por nuestro equipo antes de ser aceptadas o rechazadas.",
  },
  {
    id: "confirmada",
    label: "Confirmadas",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    desc: "Listas para aplicarse al próximo pago. Deben estar vigentes.",
  },
  {
    id: "rechazada",
    label: "Rechazadas",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    desc: "Difieren con el comprobante cargado. Cuentan con el motivo del rechazo.",
  },
  {
    id: "aplicada",
    label: "Aplicadas",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    desc: "Ya fueron incluidas en el pago de una transacción.",
  },
] as const;

export default function RetencionesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Mensaje informativo (ej. PDF escaneado / extracción parcial). */
  const [extractionInfo, setExtractionInfo] = useState<string | null>(null);
  /** Número ya cargado detectado (muestra cartel rojo y bloquea envío). */
  const [duplicado, setDuplicado] = useState<string | null>(null);
  /** Número que se acaba de confirmar (para el cartel verde). */
  const [enviadoNumero, setEnviadoNumero] = useState<string | null>(null);

  const [form, setForm] = useState<ExtractedData>({
    fecha: "",
    cuitEmisor: "",
    contratante: "",
    numero: "",
    tipo: "",
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Revocar object URLs al desmontar / cambiar archivo
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setExtracting(false);
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
    setExtractionInfo(null);
    setDuplicado(null);
    setEnviadoNumero(null);
    setForm({
      fecha: "",
      cuitEmisor: "",
      contratante: "",
      numero: "",
      tipo: "",
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (picked: File | null) => {
    if (!picked) return;

    const isPdf =
      picked.type === "application/pdf" ||
      picked.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("El archivo debe ser un PDF.");
      return;
    }
    if (picked.size > 10 * 1024 * 1024) {
      setError("El archivo supera el tamaño máximo de 10 MB.");
      return;
    }

    setError(null);
    setExtractionInfo(null);
    setDuplicado(null);
    setEnviadoNumero(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(picked);
    setFile(picked);
    setPreviewUrl(url);
    setExtracting(true);
    setForm({ fecha: "", cuitEmisor: "", contratante: "", numero: "", tipo: "" });

    try {
      const result = await extractRetencionFromPDF(picked);
      if (result.ok) {
        setForm(result.data);
        // Mismo criterio que el componente original: si llenó menos de la mitad
        // de los campos clave, avisamos al usuario de que complete el resto.
        if (result.filled < 3) {
          setExtractionInfo(
            "Sólo pudimos leer algunos datos del PDF. Revisá y completá los campos faltantes antes de confirmar.",
          );
        }
        // Chequeo inmediato de duplicados: si el PDF trae un número que ya
        // fue enviado, avisamos antes de que el usuario intente confirmar.
        if (result.data.numero) {
          const yaExiste = await checkNumeroDuplicado(result.data.numero);
          if (yaExiste) setDuplicado(result.data.numero);
        }
      } else if (result.reason === "scanned") {
        setExtractionInfo(
          "El PDF parece ser una imagen escaneada: no pudimos leer el texto. Completá los campos manualmente.",
        );
      } else {
        setError("No pudimos leer el PDF. Completá los campos manualmente.");
      }
    } catch {
      setError("No pudimos leer el PDF. Completá los campos manualmente.");
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    handleFile(picked);
  };

  const canSubmit =
    !!file &&
    !extracting &&
    !duplicado &&
    !!form.fecha &&
    !!form.cuitEmisor &&
    !!form.contratante &&
    !!form.numero &&
    !!form.tipo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // Revalidamos contra el "backend" por si el número cambió a mano.
      const yaExiste = await checkNumeroDuplicado(form.numero);
      if (yaExiste) {
        setDuplicado(form.numero);
        return;
      }
      await registrarRetencion(form.numero, form, file!);
      setEnviadoNumero(form.numero);
      setSubmitted(true);
    } catch {
      setError("No pudimos enviar la retención. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Retenciones</h1>
            <p className="text-sm text-muted-foreground">
              Cargá tus certificados y esperá la validación del equipo de APC
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* ── Hero ── */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Gestión online
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">
                    Cargá tu retención
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Arrastrá el PDF y verificá la información extraída antes de confirmar.
                  </p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                    <Info className="mt-[1px] h-3 w-3 shrink-0 text-amber-400" />
                    <span>
                      Si incluirás retenciones en el pago, cargalas antes de generar la
                      transacción y esperá que APC las{" "}
                      <span className="font-semibold text-foreground">confirme</span>.
                    </span>
                  </p>
                </div>
              </div>
              {(file || submitted) && !submitting && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAll}
                  className="border-white/10 bg-secondary/30 hover:bg-secondary/50"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Cargar otra retención
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Estado enviado (éxito) ── */}
        {submitted && enviadoNumero && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Pedido de retención{" "}
                    <span className="font-mono text-emerald-400">
                      {enviadoNumero}
                    </span>{" "}
                    cargado correctamente
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nuestro equipo va a verificar la información del comprobante. Vas a recibir una notificación cuando quede{" "}
                    <span className="font-semibold text-emerald-400">Confirmada</span> o{" "}
                    <span className="font-semibold text-rose-400">Rechazada</span>. Podés seguir su estado desde{" "}
                    <span className="font-semibold text-foreground">Mis Gestiones</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Retención duplicada (ya está cargada) ── */}
        {duplicado && !submitted && (
          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
                  <XCircle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    El pedido de retención{" "}
                    <span className="font-mono text-rose-400">{duplicado}</span>{" "}
                    ya se encuentra cargado
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Debe aguardar a que nuestro equipo lo{" "}
                    <span className="font-semibold text-emerald-400">acepte</span> o lo{" "}
                    <span className="font-semibold text-rose-400">rechace</span>. Podés seguir su estado desde{" "}
                    <span className="font-semibold text-foreground">Mis Gestiones</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Detalle de estados ── */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-muted-foreground" />
              ¿Qué tenés que saber?
            </CardTitle>
            <CardDescription>
              Las retenciones tienen un vencimiento según cada impuesto, y se aplican únicamente sobre gastos y facturas de <span className="font-semibold text-foreground">Agencia</span>, no de Armador. Al llegar al <span className="font-semibold text-foreground">carrito</span>, vas a poder verificar las retenciones que serán incluidas en el pago y que se <span className="font-semibold text-emerald-400">descuentan del total a pagar</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ESTADOS.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "rounded-xl border bg-secondary/20 p-3 transition-colors",
                      s.border
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg",
                          s.bg
                        )}
                      >
                        <Icon className={cn("h-4 w-4", s.color)} />
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Dropzone + Preview  |  Formulario ── */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Columna izquierda: dropzone / preview */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-muted-foreground" />
                Comprobante
              </CardTitle>
              <CardDescription>
                Arrastrá el PDF o seleccionálo desde tu equipo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
                    dragging
                      ? "border-emerald-500/60 bg-emerald-500/5"
                      : "border-white/10 bg-secondary/20 hover:border-emerald-500/40 hover:bg-secondary/30"
                  )}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <Upload className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Arrastrá tu PDF acá
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    o hacé clic para <span className="font-medium text-emerald-400">explorar tus archivos</span>
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    PDF · hasta 10 MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={onInputChange}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-secondary/20 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <FileText className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(0)} KB
                          {extracting && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Leyendo datos
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {!submitted && !submitting && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={resetAll}
                        title="Eliminar archivo"
                        aria-label="Eliminar archivo"
                        className="h-9 w-9 shrink-0 rounded-lg border border-white/5 bg-rose-500/5 text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-secondary/20">
                      <iframe
                        src={previewUrl}
                        title={file.name}
                        className="h-[520px] w-full bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna derecha: formulario */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Verificá la información
              </CardTitle>
              <CardDescription>
                Los datos se completan automáticamente leyendo el PDF. Revisá que el{" "}
                <span className="font-medium text-foreground">CUIT emisor</span>, el{" "}
                <span className="font-medium text-foreground">contratante</span> y el{" "}
                <span className="font-medium text-foreground">tipo</span> sean correctos antes de confirmar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fecha" className="text-xs font-medium text-foreground">
                      Fecha del comprobante
                    </Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      <Input
                        id="fecha"
                        type="date"
                        value={form.fecha}
                        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                        disabled={!file || extracting || submitting || submitted}
                        className="h-10 bg-secondary/40 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cuit" className="text-xs font-medium text-foreground">
                      CUIT emisor
                    </Label>
                    <Input
                      id="cuit"
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      autoComplete="off"
                      placeholder="11 dígitos, sin guiones"
                      value={form.cuitEmisor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cuitEmisor: e.target.value.replace(/\D/g, "").slice(0, 11),
                        })
                      }
                      disabled={!file || extracting || submitting || submitted}
                      className="h-10 bg-secondary/40 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contratante" className="text-xs font-medium text-foreground">
                    Contratante
                  </Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Select
                      value={form.contratante}
                      onValueChange={(v) => setForm({ ...form, contratante: v })}
                      disabled={!file || extracting || submitting || submitted}
                    >
                      <SelectTrigger id="contratante" className="h-10 bg-secondary/40 pl-10">
                        <SelectValue placeholder="Seleccioná el contratante" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRATANTES.map((c) => (
                          <SelectItem key={c.id} value={c.sigla.toLowerCase()}>
                            {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="numero" className="text-xs font-medium text-foreground">
                      Número de retención{" "}
                      <span className="font-normal text-muted-foreground">
                        (10 dígitos)
                      </span>
                    </Label>
                    <Input
                      id="numero"
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="off"
                      placeholder="10 dígitos"
                      value={form.numero}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          numero: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      onBlur={() =>
                        setForm((prev) => ({ ...prev, numero: padNumero(prev.numero) }))
                      }
                      disabled={!file || extracting || submitting || submitted}
                      className="h-10 bg-secondary/40 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tipo" className="text-xs font-medium text-foreground">
                      Tipo de retención
                    </Label>
                    <Select
                      value={form.tipo}
                      onValueChange={(v) =>
                        setForm({ ...form, tipo: v as TipoRetencionValue })
                      }
                      disabled={!file || extracting || submitting || submitted}
                    >
                      <SelectTrigger id="tipo" className="h-10 bg-secondary/40">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_RETENCION.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {extractionInfo && !error && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3"
                  >
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <p className="text-sm font-medium leading-snug text-amber-50">
                      {extractionInfo}
                    </p>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3"
                  >
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    <p className="text-sm font-medium leading-snug text-rose-50">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-secondary/30 text-muted-foreground"
                  >
                    {submitted
                      ? "En revisión"
                      : extracting
                      ? "Leyendo PDF…"
                      : file
                      ? "Listo para confirmar"
                      : "Esperando comprobante"}
                  </Badge>
                  <Button
                    type="submit"
                    disabled={!canSubmit || submitting || submitted}
                    className="min-w-40"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Enviado
                      </>
                    ) : (
                      <>
                        Confirmar retención
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
