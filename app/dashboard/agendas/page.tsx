"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  CreditCard,
  FileText,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DebinCuenta, InterbankingCuenta } from "@/lib/agendas-storage";
import {
  loadDebinAgendas,
  loadInterbankingAgendas,
  saveDebinAgendas,
  saveInterbankingAgendas,
} from "@/lib/agendas-storage";

type Agenda = { id: number; email: string; verified: boolean };

const DEFAULT_INTERBANKING_SEED: InterbankingCuenta[] = [
  { id: 1, cuit: "30-71234567-9", nombre: "Cuenta principal", activo: true },
];

const DEFAULT_DEBIN_SEED: DebinCuenta[] = [
  { id: 1, modalidad: "CBU", dato: "0110012340012345678901", nombre: "CBU pagos", activo: true },
];

function AgendasContent() {
  const [agendas, setAgendas] = useState<Agenda[]>([
    { id: 1, email: "facturacion@empresa.com", verified: true },
    { id: 2, email: "pagos@empresa.com", verified: false },
    { id: 3, email: "tesoreria@empresa.com", verified: true },
    { id: 4, email: "contabilidad@empresa.com", verified: false },
    { id: 5, email: "notificaciones@empresa.com", verified: true },
  ]);

  const [interbanking, setInterbanking] =
    useState<InterbankingCuenta[]>(DEFAULT_INTERBANKING_SEED);

  const [debin, setDebin] = useState<DebinCuenta[]>(DEFAULT_DEBIN_SEED);

  /** Evita sobrescribir localStorage antes de leer datos guardados (primer paint). */
  const [agendasStorageReady, setAgendasStorageReady] = useState(false);

  const [nuevoEmail, setNuevoEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailRegistradoOk, setEmailRegistradoOk] = useState(false);
  const [activeTab, setActiveTab] = useState<"notificaciones" | "interbanking" | "debin">(
    "notificaciones",
  );

  // Permite abrir una pestaña específica desde otros accesos (p.ej. dashboard → Medios de pago).
  // Acepta ?tab=notificaciones | interbanking | debin
  const searchParams = useSearchParams();
  useEffect(() => {
    const requested = searchParams?.get("tab");
    if (requested === "notificaciones" || requested === "interbanking" || requested === "debin") {
      setActiveTab(requested);
    }
  }, [searchParams]);

  useEffect(() => {
    const ib = loadInterbankingAgendas();
    const db = loadDebinAgendas();
    if (ib.length > 0) setInterbanking(ib);
    if (db.length > 0) setDebin(db);
    setAgendasStorageReady(true);
  }, []);

  useEffect(() => {
    if (!agendasStorageReady) return;
    saveInterbankingAgendas(interbanking);
  }, [agendasStorageReady, interbanking]);

  useEffect(() => {
    if (!agendasStorageReady) return;
    saveDebinAgendas(debin);
  }, [agendasStorageReady, debin]);

  const listNotifRef = useRef<HTMLDivElement | null>(null);
  const listIbRef = useRef<HTMLDivElement | null>(null);
  const listDebinRef = useRef<HTMLDivElement | null>(null);

  const scrollToAgenda = () => {
    const el =
      activeTab === "notificaciones"
        ? listNotifRef.current
        : activeTab === "interbanking"
          ? listIbRef.current
          : listDebinRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddAgenda = () => {
    const trimmed = nuevoEmail.trim();
    if (!trimmed) {
      setEmailRegistradoOk(false);
      setEmailError("Ingresa un correo electronico");
      return;
    }
    if (!trimmed.includes("@")) {
      setEmailRegistradoOk(false);
      setEmailError("Ingresa un correo valido");
      return;
    }
    const normalized = trimmed.toLowerCase();
    if (agendas.some((a) => a.email.toLowerCase() === normalized)) {
      setEmailRegistradoOk(false);
      setEmailError("Este correo ya está agendado");
      return;
    }
    setAgendas((prev) => [...prev, { id: Date.now(), email: trimmed, verified: false }]);
    setNuevoEmail("");
    setEmailError("");
    setEmailRegistradoOk(true);
  };

  const [nuevoCuit, setNuevoCuit] = useState("");
  const [nuevoNombreCuenta, setNuevoNombreCuenta] = useState("");
  const [interbankingError, setInterbankingError] = useState("");

  const handleAddInterbanking = () => {
    if (!nuevoCuit.trim()) {
      setInterbankingError("Ingresá el CUIT de tu cuenta interbanking");
      return;
    }
    if (!nuevoNombreCuenta.trim()) {
      setInterbankingError("Ingresá un nombre para agendar tu cuenta");
      return;
    }
    setInterbanking((prev) => [
      ...prev,
      { id: Date.now(), cuit: nuevoCuit.trim(), nombre: nuevoNombreCuenta.trim(), activo: true },
    ]);
    setNuevoCuit("");
    setNuevoNombreCuenta("");
    setInterbankingError("");
    setTimeout(scrollToAgenda, 0);
  };

  const [debinModalidad, setDebinModalidad] = useState<DebinCuenta["modalidad"]>("CBU");
  const [debinDato, setDebinDato] = useState("");
  const [debinNombre, setDebinNombre] = useState("");
  const [debinError, setDebinError] = useState("");

  const handleAddDebin = () => {
    if (!debinDato.trim()) {
      setDebinError(`Ingresá ${debinModalidad === "CBU" ? "tu CBU" : "tu Alias"}`);
      return;
    }
    if (!debinNombre.trim()) {
      setDebinError("Ingresá un nombre para agendar tu cuenta");
      return;
    }
    setDebin((prev) => [
      ...prev,
      { id: Date.now(), modalidad: debinModalidad, dato: debinDato.trim(), nombre: debinNombre.trim(), activo: true },
    ]);
    setDebinDato("");
    setDebinNombre("");
    setDebinError("");
    setTimeout(scrollToAgenda, 0);
  };

  const counts = useMemo(
    () => ({
      notificaciones: agendas.length,
      interbanking: interbanking.length,
      debin: debin.length,
    }),
    [agendas.length, interbanking.length, debin.length],
  );

  const tabTriggerClass = cn(
    "h-10 cursor-pointer rounded-lg border-2 border-border/70 bg-secondary/50 px-2 text-xs font-medium text-muted-foreground shadow-sm",
    "transition-all hover:border-emerald-500 hover:bg-secondary hover:text-foreground sm:text-sm",
    "dark:hover:border-emerald-400",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "data-[state=active]:border-primary data-[state=active]:bg-primary/15 data-[state=active]:text-foreground",
    "data-[state=active]:font-semibold data-[state=active]:shadow-md dark:data-[state=active]:bg-primary/20",
  );

  /** Borde verde al hover (misma línea que CTAs tipo Agregar). */
  const actionHoverGreenBorder = cn(
    "border-2 border-transparent transition-colors",
    "hover:border-emerald-500 dark:hover:border-emerald-400",
  );

  /** ~3 filas visibles; el resto con scroll (misma altura en las 3 agendas). */
  const agendaListScrollBox = cn(
    "max-h-[13.5rem] overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-muted/20 p-2",
    "[scrollbar-gutter:stable] sm:max-h-[14rem]",
  );

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 min-h-[3.5rem] items-center px-dash sm:h-16">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Agendas</h1>
            <p className="text-sm text-muted-foreground">
              Gestioná notificaciones y medios de pago
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-dash py-dash">
        {/* Hero + Tabs (como capturas) */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:ring-emerald-400/25">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Gestión online
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">Gestioná tus agendas</h2>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-xl border border-border bg-muted/40 p-1.5 shadow-sm sm:w-[min(100%,28rem)]">
                  <TabsTrigger value="notificaciones" className={tabTriggerClass}>
                    Notificaciones
                  </TabsTrigger>
                  <TabsTrigger value="interbanking" className={tabTriggerClass}>
                    Interbanking
                  </TabsTrigger>
                  <TabsTrigger value="debin" className={tabTriggerClass}>
                    Debin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Contenido por tab (2 columnas como capturas) */}
        <Tabs value={activeTab} className="w-full">
          {/* Notificaciones */}
          <TabsContent value="notificaciones" className="mt-0">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Datos a tener en cuenta</CardTitle>
                  <CardDescription>
                    Para que podamos notificarte sobre el seguimiento de tus transacciones, es importante que tengas registrado al menos un correo en nuestra plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-sm font-semibold text-foreground">¿Por qué es importante?</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <Bell className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Recibirás avisos en tiempo real sobre el estado de tus movimientos.</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Evitarás demoras y podrás gestionar todo de manera más ágil y segura.</p>
                    </div>
                  </div>
                  <p className="text-xs">
                    Cuando registres tu correo, te enviaremos un link de validación, que deberás confirmar para activarlo.
                  </p>
                  <p className="text-xs">
                    No es necesario que tengas solo un correo registrado, pero al momento de gestionar un carrito, solo podrás seleccionar una opción de todas las agendas disponibles.
                  </p>
                  <p className="text-xs">
                    Si aún no lo hiciste, te recomendamos registrar tu correo cuanto antes para aprovechar estos beneficios.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Dar de alta tu agenda de notificaciones</CardTitle>
                  <CardDescription>Cargá tu mail</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="agenda-email-notif" className="text-xs font-semibold text-foreground sm:text-sm">
                      Mail
                    </Label>
                    <Input
                      id="agenda-email-notif"
                      type="email"
                      placeholder="Ingresar tu mail"
                      value={nuevoEmail}
                      onChange={(e) => {
                        setNuevoEmail(e.target.value);
                        setEmailError("");
                        setEmailRegistradoOk(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAgenda()}
                      className="h-11 border border-transparent bg-secondary/50"
                    />
                  </div>
                  {emailError && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                  <Button onClick={handleAddAgenda} className="h-11 w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className={cn("h-9 bg-secondary/50", actionHoverGreenBorder)}
                      onClick={scrollToAgenda}
                    >
                      Ver agenda
                    </Button>
                  </div>
                  {emailRegistradoOk && (
                    <div
                      role="status"
                      className="ml-auto flex max-w-lg items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-snug text-emerald-950 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-50"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                        aria-hidden
                      />
                      <span>
                        ¡Genial! Tu correo se ha registrado correctamente. Ahora, el siguiente paso es activar tu
                        cuenta. Revisá tu bandeja de entrada, ya que te hemos enviado un correo con las instrucciones
                        para la activación 😊
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div ref={listNotifRef} className="mt-6">
              <div className={agendaListScrollBox}>
                <div className="space-y-2 pr-0.5">
                  {agendas.map((a) => (
                    <Card key={a.id} className="border-border bg-card gap-0 py-0 shadow-sm">
                      <CardContent className="flex items-center justify-between px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              a.verified ? "bg-primary/10" : "bg-chart-3/10"
                            }`}
                          >
                            {a.verified ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Clock className="h-4 w-4 text-chart-3" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{a.email}</p>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "mt-0.5 py-0 text-[10px] font-medium",
                                a.verified ? "bg-primary/20 text-primary" : "bg-chart-3/20 text-chart-3",
                              )}
                            >
                              {a.verified ? "Verificada" : "Pendiente de verificación"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setAgendas((prev) => prev.filter((x) => x.id !== a.id))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {agendas.length === 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6 text-center text-sm text-muted-foreground">
                        No tenés agendas de notificación cargadas.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Interbanking */}
          <TabsContent value="interbanking" className="mt-0">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Datos a tener en cuenta</CardTitle>
                  <CardDescription>
                    Las transferencias realizadas vía INTERBANKING pero confeccionadas como pago a proveedores no son consideradas un VEP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-sm font-semibold text-foreground">Requisitos para operar</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>Estar adherido al servicio BtoB.</li>
                    <li>Dar de alta la comunidad de APC.</li>
                  </ul>
                  <p className="text-sm font-semibold text-foreground">¿No sabés cómo?</p>
                  <Button
                    asChild
                    variant="secondary"
                    className={cn("h-9 bg-secondary/50", actionHoverGreenBorder)}
                  >
                    <a
                      href="/instructivo-ib-vep.pdf"
                      download="instructivo-ib-vep.pdf"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Descargá el instructivo
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Dar de alta tu agenda de interbanking</CardTitle>
                  <CardDescription>Completá los datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ib-cuit" className="text-xs font-semibold text-foreground sm:text-sm">
                      Cuit
                    </Label>
                    <Input
                      id="ib-cuit"
                      placeholder="Cuit de tu cuenta interbanking"
                      value={nuevoCuit}
                      onChange={(e) => {
                        setNuevoCuit(e.target.value);
                        setInterbankingError("");
                      }}
                      className="h-11 border border-transparent bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ib-nombre" className="text-xs font-semibold text-foreground sm:text-sm">
                      Nombre para agendar tu cuenta
                    </Label>
                    <Input
                      id="ib-nombre"
                      placeholder="Ingresar nombre"
                      value={nuevoNombreCuenta}
                      onChange={(e) => {
                        setNuevoNombreCuenta(e.target.value);
                        setInterbankingError("");
                      }}
                      className="h-11 border border-transparent bg-secondary/50"
                    />
                  </div>
                  {interbankingError && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {interbankingError}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    * Una vez que lo hayas registrado, podrás seleccionarlo como tu medio de pago al momento de realizar tu transacción.
                  </p>
                  <Button onClick={handleAddInterbanking} className="h-11 w-full">
                    Agregar
                  </Button>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className={cn("h-9 bg-secondary/50", actionHoverGreenBorder)}
                      onClick={scrollToAgenda}
                    >
                      Ver agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={listIbRef} className="mt-6">
              <div className={agendaListScrollBox}>
                <div className="space-y-2 pr-0.5">
                  {interbanking.map((c) => (
                    <Card key={c.id} className="border-border bg-card gap-0 py-0 shadow-sm">
                      <CardContent className="flex items-center justify-between px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{c.nombre}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">CUIT {c.cuit}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge variant="secondary" className="bg-primary/20 py-0 text-[10px] font-medium text-primary">
                            Activo
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setInterbanking((prev) => prev.filter((x) => x.id !== c.id))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {interbanking.length === 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6 text-center text-sm text-muted-foreground">
                        No tenés cuentas de interbanking registradas.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Debin */}
          <TabsContent value="debin" className="mt-0">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Datos a tener en cuenta</CardTitle>
                  <CardDescription>
                    Si querés utilizar DEBIN como medio de pago, primero es necesario que des de alta una agenda con un CBU o ALIAS en nuestra plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-sm font-semibold text-foreground">¿Cómo funciona el DEBIN?</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <CreditCard className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Registrás tu CBU o ALIAS en la agenda de medios de pago.</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <FileText className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Al momento de pagar, seleccionás DEBIN como método de pago.</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Desde nuestra plataforma, generamos el débito automático en tu cuenta bancaria.</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-secondary/20 p-3">
                      <Bell className="mt-0.5 h-4 w-4 text-primary" />
                      <p>Te informaremos a qué transacción corresponde para que puedas aceptarlo y completar el pago.</p>
                    </div>
                  </div>
                  <p className="text-xs">
                    Este proceso es rápido, seguro y fácil, permitiéndote gestionar tus pagos sin complicaciones.
                  </p>
                  <p className="text-xs">
                    Si aún no registraste tu CBU o ALIAS, te recomendamos hacerlo cuanto antes para poder utilizar este medio de pago sin inconvenientes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Dar de alta tu agenda de debin</CardTitle>
                  <CardDescription>Completá los datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground sm:text-sm">
                      Modalidad de alta
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={debinModalidad === "CBU" ? "default" : "secondary"}
                        className={cn(debinModalidad === "CBU" ? "" : "bg-secondary/50", actionHoverGreenBorder)}
                        onClick={() => setDebinModalidad("CBU")}
                      >
                        CBU
                      </Button>
                      <Button
                        type="button"
                        variant={debinModalidad === "ALIAS" ? "default" : "secondary"}
                        className={cn(debinModalidad === "ALIAS" ? "" : "bg-secondary/50", actionHoverGreenBorder)}
                        onClick={() => setDebinModalidad("ALIAS")}
                      >
                        Alias
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="debin-dato" className="text-xs font-semibold text-foreground sm:text-sm">
                      Datos bancarios
                    </Label>
                    <Input
                      id="debin-dato"
                      placeholder={debinModalidad === "CBU" ? "Ingresa CBU" : "Ingresa Alias"}
                      value={debinDato}
                      onChange={(e) => {
                        setDebinDato(e.target.value);
                        setDebinError("");
                      }}
                      className="h-11 border border-transparent bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="debin-nombre" className="text-xs font-semibold text-foreground sm:text-sm">
                      Nombre para agendar tu cuenta
                    </Label>
                    <Input
                      id="debin-nombre"
                      placeholder="Ingresar nombre"
                      value={debinNombre}
                      onChange={(e) => {
                        setDebinNombre(e.target.value);
                        setDebinError("");
                      }}
                      className="h-11 border border-transparent bg-secondary/50"
                    />
                  </div>
                  {debinError && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {debinError}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    * Una vez que lo hayas registrado, podrás seleccionarlo como tu medio de pago al momento de realizar tu transacción.
                  </p>
                  <Button onClick={handleAddDebin} className="h-11 w-full">
                    Agregar
                  </Button>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      className={cn("h-9 bg-secondary/50", actionHoverGreenBorder)}
                      onClick={scrollToAgenda}
                    >
                      Ver agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={listDebinRef} className="mt-6">
              <div className={agendaListScrollBox}>
                <div className="space-y-2 pr-0.5">
                  {debin.map((c) => (
                    <Card key={c.id} className="border-border bg-card gap-0 py-0 shadow-sm">
                      <CardContent className="flex items-center justify-between px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{c.nombre}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              {c.modalidad} {c.dato}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge variant="secondary" className="bg-primary/20 py-0 text-[10px] font-medium text-primary">
                            Activo
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDebin((prev) => prev.filter((x) => x.id !== c.id))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {debin.length === 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6 text-center text-sm text-muted-foreground">
                        No tenés CBU/Alias registrados.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AgendasPage() {
  return (
    <Suspense fallback={null}>
      <AgendasContent />
    </Suspense>
  );
}
