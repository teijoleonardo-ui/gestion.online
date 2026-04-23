"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Agenda = { id: number; email: string; verified: boolean };
type InterbankingCuenta = { id: number; cuit: string; nombre: string; activo: boolean };
type DebinCuenta = { id: number; modalidad: "CBU" | "ALIAS"; dato: string; nombre: string; activo: boolean };

export default function AgendasPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([
    { id: 1, email: "facturacion@empresa.com", verified: true },
    { id: 2, email: "pagos@empresa.com", verified: false },
  ]);

  const [interbanking, setInterbanking] = useState<InterbankingCuenta[]>([
    { id: 1, cuit: "30-71234567-9", nombre: "Cuenta principal", activo: true },
  ]);

  const [debin, setDebin] = useState<DebinCuenta[]>([
    { id: 1, modalidad: "CBU", dato: "0110012340012345678901", nombre: "CBU pagos", activo: true },
  ]);

  const [nuevoEmail, setNuevoEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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

  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollToAgenda = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddAgenda = () => {
    if (!nuevoEmail) {
      setEmailError("Ingresa un correo electronico");
      return;
    }
    if (!nuevoEmail.includes("@")) {
      setEmailError("Ingresa un correo valido");
      return;
    }
    setAgendas((prev) => [
      ...prev,
      { id: Date.now(), email: nuevoEmail, verified: false },
    ]);
    setNuevoEmail("");
    setEmailError("");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Agendas</h1>
            <p className="text-sm text-muted-foreground">
              Gestioná notificaciones y medios de pago
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Hero + Tabs (como capturas) */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/40">
                  <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Gestión online
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">Gestioná tus agendas</h2>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-secondary/50 sm:w-[420px]">
                  <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
                  <TabsTrigger value="interbanking">Interbanking</TabsTrigger>
                  <TabsTrigger value="debin">Debin</TabsTrigger>
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
                  <Input
                    type="email"
                    placeholder="Ingresar tu mail"
                    value={nuevoEmail}
                    onChange={(e) => {
                      setNuevoEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAgenda()}
                    className="h-11 bg-secondary/50 border-0"
                  />
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
                    <Button variant="secondary" className="h-9 bg-secondary/50" onClick={scrollToAgenda}>
                      Ver agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={listRef} className="mt-6 space-y-3">
              {agendas.map((a) => (
                <Card key={a.id} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          a.verified ? "bg-primary/10" : "bg-chart-3/10"
                        }`}
                      >
                        {a.verified ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                          <Clock className="h-6 w-6 text-chart-3" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{a.email}</p>
                        <Badge
                          variant="secondary"
                          className={
                            a.verified ? "bg-primary/20 text-primary" : "bg-chart-3/20 text-chart-3"
                          }
                        >
                          {a.verified ? "Verificada" : "Pendiente de verificación"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setAgendas((prev) => prev.filter((x) => x.id !== a.id))}
                    >
                      <Trash2 className="h-4 w-4" />
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
                    className="h-9 bg-secondary/50"
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
                  <Input
                    placeholder="CUIT de tu cuenta interbanking"
                    value={nuevoCuit}
                    onChange={(e) => {
                      setNuevoCuit(e.target.value);
                      setInterbankingError("");
                    }}
                    className="h-11 bg-secondary/50 border-0"
                  />
                  <Input
                    placeholder="Nombre para agendar tu cuenta"
                    value={nuevoNombreCuenta}
                    onChange={(e) => {
                      setNuevoNombreCuenta(e.target.value);
                      setInterbankingError("");
                    }}
                    className="h-11 bg-secondary/50 border-0"
                  />
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
                    <Button variant="secondary" className="h-9 bg-secondary/50" onClick={scrollToAgenda}>
                      Ver agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={listRef} className="mt-6 space-y-3">
              {interbanking.map((c) => (
                <Card key={c.id} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.nombre}</p>
                        <p className="font-mono text-sm text-muted-foreground">CUIT {c.cuit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Activo
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setInterbanking((prev) => prev.filter((x) => x.id !== c.id))}
                      >
                        <Trash2 className="h-4 w-4" />
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={debinModalidad === "CBU" ? "default" : "secondary"}
                      className={debinModalidad === "CBU" ? "" : "bg-secondary/50"}
                      onClick={() => setDebinModalidad("CBU")}
                    >
                      CBU
                    </Button>
                    <Button
                      type="button"
                      variant={debinModalidad === "ALIAS" ? "default" : "secondary"}
                      className={debinModalidad === "ALIAS" ? "" : "bg-secondary/50"}
                      onClick={() => setDebinModalidad("ALIAS")}
                    >
                      Alias
                    </Button>
                  </div>
                  <Input
                    placeholder={debinModalidad === "CBU" ? "Ingresar CBU" : "Ingresar Alias"}
                    value={debinDato}
                    onChange={(e) => {
                      setDebinDato(e.target.value);
                      setDebinError("");
                    }}
                    className="h-11 bg-secondary/50 border-0"
                  />
                  <Input
                    placeholder="Nombre para agendar tu cuenta"
                    value={debinNombre}
                    onChange={(e) => {
                      setDebinNombre(e.target.value);
                      setDebinError("");
                    }}
                    className="h-11 bg-secondary/50 border-0"
                  />
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
                    <Button variant="secondary" className="h-9 bg-secondary/50" onClick={scrollToAgenda}>
                      Ver agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={listRef} className="mt-6 space-y-3">
              {debin.map((c) => (
                <Card key={c.id} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.nombre}</p>
                        <p className="font-mono text-sm text-muted-foreground">
                          {c.modalidad} {c.dato}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Activo
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDebin((prev) => prev.filter((x) => x.id !== c.id))}
                      >
                        <Trash2 className="h-4 w-4" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
