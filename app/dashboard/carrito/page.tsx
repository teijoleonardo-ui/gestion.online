"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  CreditCard,
  Mail,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
  Building,
  Ship,
  Info,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ─── Modelo ──────────────────────────────────────────────────────────
// El carrito replica la estructura que aparece en la sección
// "Abonar Gastos y Generar Boleta de Transacción Web" del instructivo:
// se muestran los gastos transmitidos agrupados por BL (con conceptos
// de Armador y Agencia), las observaciones de la agencia a verificar,
// y las retenciones previamente confirmadas se descuentan del total.
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
};

type ObservacionAgencia = {
  bl: string;
  texto: string;
};

type RetencionAplicada = {
  id: string;
  bl: string;
  tipo: string; // IVA / GANANCIAS / IBB CABA ...
  moneda: Moneda;
  importe: number;
};

// ─── Mock data ───────────────────────────────────────────────────────
// Dos BLs (uno de ZIM, otro de ONE) para mostrar el agrupamiento real.
const initialItems: CartItem[] = [
  { id: 1, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "THC Destino", tipo: "Armador", moneda: "USD", importe: 350 },
  { id: 2, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "BL Fee", tipo: "Armador", moneda: "USD", importe: 75 },
  { id: 3, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "Gate In", tipo: "Agencia", moneda: "USD", importe: 120 },
  { id: 4, bl: "ZIMUABC1234567", contratanteSigla: "ZIM", concepto: "Verificación", tipo: "Agencia", moneda: "ARS", importe: 45000 },
  { id: 5, bl: "ONEYXYZ7654321", contratanteSigla: "ONE", concepto: "Documentación", tipo: "Armador", moneda: "USD", importe: 90 },
  { id: 6, bl: "ONEYXYZ7654321", contratanteSigla: "ONE", concepto: "Derecho de Importación", tipo: "Agencia", moneda: "USD", importe: 200 },
];

const observacionesAgencia: ObservacionAgencia[] = [
  {
    bl: "ZIMUABC1234567",
    texto:
      "Contenedor arribado el 18/04. Se emite libre deuda al momento del pago. Verificar que el CUIT a facturar sea correcto antes de generar la transacción.",
  },
];

const retencionesConfirmadas: RetencionAplicada[] = [
  { id: "RET-001", bl: "ZIMUABC1234567", tipo: "IVA", moneda: "USD", importe: 21.5 },
  { id: "RET-002", bl: "ONEYXYZ7654321", tipo: "GANANCIAS", moneda: "USD", importe: 8.7 },
];

const agendas = [
  { value: "facturacion@empresa.com", label: "facturacion@empresa.com", agendada: true },
  { value: "pagos@empresa.com", label: "pagos@empresa.com", agendada: true },
];

type MedioPagoOption = {
  value: string;
  label: string;
  /** Requiere tener la cuenta agendada previamente (VEP / DEBIN). */
  requiereAgenda?: boolean;
};

const mediosPago: MedioPagoOption[] = [
  { value: "vep", label: "VEP · Interbanking", requiereAgenda: true },
  { value: "debin", label: "DEBIN", requiereAgenda: true },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "echeq", label: "Echeq" },
];

// ─── Helpers ─────────────────────────────────────────────────────────
const fmtMoneda = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildTransactionNumber() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `TRX-${ymd}-${rnd}`;
}

// ─── Página ──────────────────────────────────────────────────────────
export default function CarritoPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [medioPago, setMedioPago] = useState("");
  const [agendaMail, setAgendaMail] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [exito, setExito] = useState<{
    nroTransaccion: string;
    email: string;
  } | null>(null);

  // Agrupar por BL preservando orden de aparición.
  const grupos = useMemo(() => {
    const map = new Map<string, { bl: string; contratanteSigla: string; items: CartItem[] }>();
    for (const it of items) {
      if (!map.has(it.bl)) {
        map.set(it.bl, { bl: it.bl, contratanteSigla: it.contratanteSigla, items: [] });
      }
      map.get(it.bl)!.items.push(it);
    }
    return Array.from(map.values());
  }, [items]);

  const blsEnCarrito = useMemo(() => new Set(items.map((i) => i.bl)), [items]);

  const retencionesAplicables = useMemo(
    () => retencionesConfirmadas.filter((r) => blsEnCarrito.has(r.bl)),
    [blsEnCarrito]
  );

  const totalUSD = items.filter((i) => i.moneda === "USD").reduce((s, i) => s + i.importe, 0);
  const totalARS = items.filter((i) => i.moneda === "ARS").reduce((s, i) => s + i.importe, 0);

  const retencionUSD = retencionesAplicables
    .filter((r) => r.moneda === "USD")
    .reduce((s, r) => s + r.importe, 0);
  const retencionARS = retencionesAplicables
    .filter((r) => r.moneda === "ARS")
    .reduce((s, r) => s + r.importe, 0);

  const netoUSD = Math.max(0, totalUSD - retencionUSD);
  const netoARS = Math.max(0, totalARS - retencionARS);

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemoveBL = (bl: string) => {
    setItems((prev) => prev.filter((i) => i.bl !== bl));
  };

  const medioSeleccionado = mediosPago.find((m) => m.value === medioPago);
  const puedeGenerar = !!medioPago && !!agendaMail && items.length > 0;

  const handleGenerar = async () => {
    setGenerando(true);
    // TODO backend: POST /api/transacciones con { items, medioPago, mailAgenda }.
    // Debería devolver { nroTransaccion } y disparar envío de mail con la
    // BOLETA DE TRANSACCION WEB al email de la agenda.
    await new Promise((r) => setTimeout(r, 900));
    setGenerando(false);
    setConfirmOpen(false);
    setExito({ nroTransaccion: buildTransactionNumber(), email: agendaMail });
    setItems([]);
  };

  // ─── Estado: éxito ────────────────────────────────────────────────
  if (exito) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Transacción generada</h1>
              <p className="text-sm text-muted-foreground">
                Tu Boleta de Transacción Web está lista
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  ¡Boleta de Transacción Web generada!
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Enviamos una copia a{" "}
                  <span className="font-semibold text-foreground">{exito.email}</span>. También
                  podés descargarla desde <span className="font-semibold">Mis Gestiones</span>.
                </p>
              </div>

              <div className="w-full rounded-xl border border-border bg-card p-4 text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Nº de transacción
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {exito.nroTransaccion}
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    // TODO backend: GET /api/transacciones/:nro/boleta.pdf
                  }}
                >
                  <Download className="h-4 w-4" />
                  Descargar Boleta
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => router.push("/dashboard/mis-gestiones")}
                >
                  <FileText className="h-4 w-4" />
                  Ir a Mis Gestiones
                </Button>
              </div>

              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Estado: carrito vacío ────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6 bg-background p-10">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Tu carrito esta vacio</h2>
          <p className="mt-2 text-muted-foreground">
            Consulta un BL y agrega gastos al carrito para pagar.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/consulta-bl")} size="lg">
          Consultar BL
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ─── Estado: carrito con items ────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Carrito</h1>
            <p className="text-sm text-muted-foreground">
              Verificá la información y generá tu Boleta de Transacción Web
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {grupos.length} {grupos.length === 1 ? "BL" : "BLs"}
            </Badge>
            <Badge variant="secondary" className="bg-secondary text-foreground">
              {items.length} items
            </Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Grupos por BL */}
        {grupos.map((grupo) => {
          const obs = observacionesAgencia.find((o) => o.bl === grupo.bl);
          const subtotalUSD = grupo.items
            .filter((i) => i.moneda === "USD")
            .reduce((s, i) => s + i.importe, 0);
          const subtotalARS = grupo.items
            .filter((i) => i.moneda === "ARS")
            .reduce((s, i) => s + i.importe, 0);

          return (
            <Card key={grupo.bl} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Ship className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="font-mono">{grupo.bl}</span>
                        <Badge variant="outline" className="border-border text-xs">
                          {grupo.contratanteSigla}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Detalle de gastos transmitidos por la agencia
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveBL(grupo.bl)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Quitar BL
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-0">
                {obs && (
                  <div className="mx-6 flex items-start gap-3 rounded-lg border border-chart-3/30 bg-chart-3/10 p-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">
                        Leyenda de observaciones
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{obs.texto}</p>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Concepto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead className="w-12" />
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
                        <TableCell className="text-muted-foreground">{item.moneda}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">
                          {fmtMoneda(item.importe)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-6 py-3 text-sm">
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
            </Card>
          );
        })}

        {/* Avisos (APC y retenciones) */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">Gastos administrativos de APC</p>
              <p className="mt-0.5 text-muted-foreground">
                El detalle no incluye los gastos administrativos de APC. Se facturan por separado.
              </p>
            </div>
          </div>

          {retencionesAplicables.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Retenciones</p>
                <p className="mt-0.5 text-muted-foreground">
                  Si vas a aplicar retenciones, cargalas previamente en{" "}
                  <Link
                    href="/dashboard/retenciones"
                    className="font-medium text-primary hover:underline"
                  >
                    Retenciones
                  </Link>{" "}
                  y esperá a que estén confirmadas antes de generar la transacción.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {retencionesAplicables.length} retenci
                  {retencionesAplicables.length === 1 ? "ón" : "ones"} confirmada
                  {retencionesAplicables.length === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Se descuentan automáticamente del total a pagar.
                </p>
                <ul className="mt-2 space-y-1">
                  {retencionesAplicables.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between font-mono text-xs text-foreground"
                    >
                      <span>
                        {r.tipo} · {r.bl}
                      </span>
                      <span>
                        - {r.moneda} {fmtMoneda(r.importe)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Resumen */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resumen de la transacción</p>
                <p className="text-xs text-muted-foreground">
                  {items.length} items · {grupos.length} {grupos.length === 1 ? "BL" : "BLs"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              {totalUSD > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal USD</span>
                  <span className="font-mono text-foreground">USD {fmtMoneda(totalUSD)}</span>
                </div>
              )}
              {totalARS > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal ARS</span>
                  <span className="font-mono text-foreground">ARS {fmtMoneda(totalARS)}</span>
                </div>
              )}
              {retencionUSD > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Retenciones USD</span>
                  <span className="font-mono">- USD {fmtMoneda(retencionUSD)}</span>
                </div>
              )}
              {retencionARS > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Retenciones ARS</span>
                  <span className="font-mono">- ARS {fmtMoneda(retencionARS)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 border-t border-primary/20 pt-3">
              {netoUSD > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total a pagar USD</span>
                  <span className="font-mono text-2xl font-bold text-foreground">
                    USD {fmtMoneda(netoUSD)}
                  </span>
                </div>
              )}
              {netoARS > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total a pagar ARS</span>
                  <span className="font-mono text-2xl font-bold text-foreground">
                    ARS {fmtMoneda(netoARS)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuración de pago */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Configuración de pago</CardTitle>
            <CardDescription>
              Elegí el medio de pago y el correo de la agenda al que llegará la Boleta de Transacción Web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Medio de pago
                </label>
                <Select value={medioPago} onValueChange={setMedioPago}>
                  <SelectTrigger className="h-12 bg-secondary/50 border-0">
                    <SelectValue placeholder="Seleccioná un medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediosPago.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                        {m.requiereAgenda ? " · requiere agenda" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {medioSeleccionado?.requiereAgenda && (
                  <p className="text-xs text-muted-foreground">
                    Los medios automáticos (VEP / DEBIN) requieren tener la cuenta agendada
                    previamente.{" "}
                    <Link
                      href="/dashboard/agendas"
                      className="font-medium text-primary hover:underline"
                    >
                      Ir a Agendas
                    </Link>
                    .
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Mail de agenda de notificaciones
                </label>
                <Select value={agendaMail} onValueChange={setAgendaMail}>
                  <SelectTrigger className="h-12 bg-secondary/50 border-0">
                    <SelectValue placeholder="Seleccioná un correo" />
                  </SelectTrigger>
                  <SelectContent>
                    {agendas.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A este correo llegará la Boleta de Transacción Web y las novedades del pago.
                </p>
              </div>
            </div>

            {(!medioPago || !agendaMail) && (
              <div className="flex items-center gap-3 rounded-lg bg-chart-3/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-chart-3" />
                <p className="text-sm text-foreground">
                  Seleccioná medio de pago y mail de agenda para continuar.
                </p>
              </div>
            )}

            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!puedeGenerar}
              className="w-full h-12"
              size="lg"
            >
              Generar Anticipada
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={(o) => !generando && setConfirmOpen(o)}>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Transacción Web</DialogTitle>
            <DialogDescription>
              Vas a generar una Anticipada con los siguientes datos. Una vez generada, la Boleta
              llegará al mail de la agenda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border border-border bg-background/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">BLs incluidos</span>
              <span className="font-semibold text-foreground">{grupos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="font-semibold text-foreground">{items.length}</span>
            </div>
            {netoUSD > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total USD</span>
                <span className="font-mono font-semibold text-foreground">
                  USD {fmtMoneda(netoUSD)}
                </span>
              </div>
            )}
            {netoARS > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total ARS</span>
                <span className="font-mono font-semibold text-foreground">
                  ARS {fmtMoneda(netoARS)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Medio de pago</span>
              <span className="font-semibold text-foreground">
                {medioSeleccionado?.label ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notificar a</span>
              <span className="font-semibold text-foreground truncate max-w-[55%]">
                {agendaMail}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={generando}
            >
              Volver
            </Button>
            <Button onClick={handleGenerar} disabled={generando}>
              {generando ? "Generando..." : "Confirmar y generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
