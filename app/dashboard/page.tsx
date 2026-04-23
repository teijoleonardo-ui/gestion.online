"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Settings,
  ChevronRight,
  Building2,
  CreditCard,
  Mail,
  BookOpen,
  Shield,
  ChevronLeft,
  ExternalLink,
  Zap,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CONTRATANTES as contratantes } from "@/lib/contratantes";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { CartaGarantiaSection } from "@/components/carta-garantia/carta-garantia-section";

// ─── Datos del carrusel ───────────────────────────────────────────────────────
type CarouselSlide = {
  id: number;
  tag: string;
  tagIcon: typeof BookOpen;
  title: string;
  description: string;
  cta: string;
  ctaHref: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  dot: string;
  /** Preview opcional: listado corto de títulos para mostrar dentro del slide. */
  preview?: string[];
};

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    tag: "Instructivo",
    tagIcon: BookOpen,
    title: "¿Cómo operar en la web?",
    description:
      "Guía paso a paso para consultar BLs, agregar gastos al carrito y generar tu anticipada online.",
    cta: "Ver guía",
    ctaHref: "https://www.gestion-online.com.ar/v3/Guias/INSTRUCTIVOS/",
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    dot: "bg-emerald-400",
    // Títulos obtenidos del Centro de Instructivos (gestion-online.com.ar).
    preview: [
      "Guía para Operar en la Web",
      "Medios de Pago",
      "APM - Terminal 4",
      "Pagos en Moneda USD",
    ],
  },
  {
    id: 2,
    tag: "Carta de Garantía",
    tagIcon: Shield,
    title: "Verificá tu Carta de Garantía",
    description:
      "Controlá la vigencia de tu carta y descargá el modelo oficial antes de operar en APC.",
    cta: "Consultar y descargar",
    // Anclaje dentro de la misma pantalla: scrollea al recuadro de Carta de Garantía.
    ctaHref: "#carta-garantia",
    accent: "from-blue-500/20 to-indigo-500/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    dot: "bg-blue-400",
  },
  {
    id: 3,
    tag: "Novedades",
    tagIcon: Zap,
    title: "Nueva función: Carga de retenciones",
    description:
      "Ahora podés cargar tus certificados arrastrándolos a la web. Esperá la confirmación de APC antes de generar la transacción.",
    cta: "Explorar",
    ctaHref: "/dashboard/retenciones",
    accent: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    dot: "bg-violet-400",
  },
];

// ─── Contratantes ─────────────────────────────────────────────────────────────
// La lista `contratantes` se importa desde `lib/contratantes.ts` para
// compartirla con otras pantallas (p.ej. /dashboard/retenciones).
// ─── Accesos rápidos ──────────────────────────────────────────────────────────
// Orden fijo solicitado: 1. Agendas · 2. Retenciones · 3. Carrito · 4. Mis Gestiones.
const quickActions = [
  {
    icon: Mail,
    label: "Agendas",
    href: "/dashboard/agendas",
    color: "text-amber-400",
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
  },
  {
    icon: FileText,
    label: "Retenciones",
    href: "/dashboard/retenciones",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    icon: ShoppingCart,
    label: "Carrito",
    href: "/dashboard/carrito",
    color: "text-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    icon: FileText,
    label: "Mis Gestiones",
    href: "/dashboard/mis-gestiones",
    color: "text-violet-400",
    bg: "bg-violet-500/10 hover:bg-violet-500/20",
  },
];

// ─── Carrusel ─────────────────────────────────────────────────────────────────
function InfoCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 200);
    },
    [animating]
  );

  const prev = () => goTo((current - 1 + carouselSlides.length) % carouselSlides.length);
  const next = useCallback(() => goTo((current + 1) % carouselSlides.length), [current, goTo]);

  const slide = carouselSlides[current];
  const Icon = slide.tagIcon;

  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);

  return (
    <div
      className="group relative h-full min-h-[160px] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-sm ring-1 ring-inset ring-white/[0.03]"
      onMouseDown={handlePause}
      onMouseUp={handleResume}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      onTouchCancel={handleResume}
    >
      {/* Gradiente base del slide (suave, se anima en el cambio) */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br ${slide.accent} transition-all duration-700 ease-out`}
      />
      {/* Orbe de color superior-derecho (toma el tono del slide) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full opacity-60 blur-3xl transition-colors duration-700 ease-out ${slide.iconBg}`}
      />
      {/* Halo blanco frío inferior-izquierdo (da volumen) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-white/[0.04] blur-3xl"
      />
      {/* Línea superior de brillo sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      {/* Contenido */}
      <div
        className={`relative z-10 flex h-full flex-col justify-between p-5 transition-all duration-300 ease-out ${
          animating ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset ring-white/10 ${slide.iconBg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${slide.iconColor}`} />
            </div>
            <span
              className={`text-xs font-semibold uppercase tracking-widest ${slide.iconColor}`}
            >
              {slide.tag}
            </span>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.04] text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.09] hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.04] text-white/60 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.09] hover:text-white active:scale-95"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-bold leading-snug text-foreground">
            {slide.title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {slide.description}
          </p>

          {/* Preview discreta (si el slide la define) — p.ej. títulos de instructivos. */}
          {slide.preview && slide.preview.length > 0 && (
            <ul className="mt-2.5 space-y-1">
              {slide.preview.slice(0, 4).map((title) => (
                <li
                  key={title}
                  className="flex items-center gap-1.5 text-[11px] leading-tight text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className={`h-1 w-1 shrink-0 rounded-full ${slide.dot} opacity-70`}
                  />
                  <span className="truncate">{title}</span>
                </li>
              ))}
              {slide.preview.length > 4 && (
                <li className="pl-[10px] text-[10px] text-muted-foreground/60">
                  +{slide.preview.length - 4} más
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <a
            href={slide.ctaHref}
            target={slide.ctaHref?.startsWith("http") ? "_blank" : undefined}
            rel={slide.ctaHref?.startsWith("http") ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              // Anclaje interno (#id): scrollear suave hasta el destino.
              if (slide.ctaHref?.startsWith("#")) {
                const target = document.getElementById(slide.ctaHref.slice(1));
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }}
            className={`group/cta inline-flex items-center gap-1.5 text-xs font-semibold ${slide.iconColor} transition-opacity hover:opacity-80`}
          >
            {slide.cta}
            <ExternalLink className="h-3 w-3 transition-transform duration-200 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </a>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  i === current
                    ? `w-5 ${slide.dot}`
                    : "w-1.5 bg-white/20 hover:w-2 hover:bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Barra de progreso auto-advance (se reinicia con la key) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] overflow-hidden bg-white/[0.04]">
        <div
          key={`carousel-progress-${current}`}
          aria-hidden
          onAnimationEnd={next}
          className={`h-full origin-left ${slide.dot} opacity-50`}
          style={{
            animation: "dashboard-carousel-progress 5s linear forwards",
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const userName = "Leonardo Teijo Cuevas";
  const user = {
    firstName: userName.split(" ")[0] ?? "",
    lastName: userName.split(" ").slice(1).join(" ") ?? "",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-foreground">Inicio</h1>
            <p className="text-xs text-muted-foreground">Panel principal</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Link
              href="/dashboard/configuracion"
              aria-label="Configuración"
              title="Configuración"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-6">

        {/* ── Bienvenida + Carrusel ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Saludo */}
          <div className="lg:col-span-2 space-y-5">
            {/* Welcome message */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Hola, {user.firstName} {user.lastName}
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                En nuestra plataforma, podras gestionar y pagar diversos servicios relacionados
                con el comercio exterior de manera sencilla y rapida.
              </p>
            </div>

            {/* Important notice about agendas */}
            <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Para asegurarte de recibir todas las notificaciones sobre tus transacciones,
                      es <span className="font-semibold text-primary">muy importante</span> que des
                      de alta una agenda. Esto es obligatorio y te lo vamos a pedir al momento de
                      confirmar tu cuenta.
                    </p>
                    <Link
                      href="/dashboard/agendas"
                      className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Configurar agenda ahora
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className={`flex flex-col items-center gap-2.5 rounded-2xl border border-white/5 p-4 transition-all duration-200 ${action.bg} hover:border-white/10 hover:scale-[1.02]`}
                  >
                   <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-black/20`}>
                   <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carrusel */}
          <div className="lg:col-span-1">
            <InfoCarousel />
          </div>
        </div>

        {/* ── Contratantes ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Nuestros Contratantes</h3>
              <p className="text-xs text-muted-foreground">
                Hacé clic en el contratante que querés abonar.
              </p>
            </div>
            <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground">
              {contratantes.length} activos
            </Badge>
          </div>

          <div className="mx-auto w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {contratantes.map((c) => {
                const usesHoverBluePlate = c.sigla === "AMI";
                const needsReadablePlate = c.sigla === "SDC" || c.sigla === "APM";
                const needsSlightlyLargerLogo =
                  c.sigla === "CN" || c.sigla === "APC" || c.sigla === "YM";

                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Abonar ${c.nombre} (${c.sigla})`}
                    onClick={() =>
                      router.push(`/dashboard/consulta-bl?contratante=${encodeURIComponent(c.sigla)}`)
                    }
                    className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-xl border border-white/5 bg-card p-2.5 text-center shadow-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:border-accent/30 hover:bg-secondary/35 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-black/25 sm:p-3"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-0.5 pb-5">
                      <div
                        className={cn(
                          "flex min-h-0 w-full flex-1 items-center justify-center rounded-md transition-all duration-300",
                          needsReadablePlate &&
                            "px-1 py-0.5 bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0)] group-hover:bg-white/90 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]",
                          usesHoverBluePlate && "group-hover:bg-sky-500/35",
                        )}
                      >
                        <img
                          src={c.logoSrc}
                          alt=""
                          className={cn(
                            "max-h-[42%] w-auto max-w-[92%] object-contain grayscale transition-[filter,transform] duration-300 ease-out group-hover:scale-105 group-hover:grayscale-0",
                            needsSlightlyLargerLogo && "max-h-[45%]",
                          )}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <p className="line-clamp-2 w-full text-center text-[10px] leading-tight text-muted-foreground sm:text-[11px] sm:leading-snug">
                        {c.nombre}
                      </p>
                    </div>
                    <ChevronRight className="absolute bottom-2 right-2 h-2.5 w-2.5 text-muted-foreground/30 transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5 sm:h-3 sm:w-3" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Medios de pago ── */}
        <section>
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Medios de Pago</h3>
            <p className="text-xs text-muted-foreground">
              Conocé los diferentes métodos disponibles para realizar tus pagos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {([
              {
                icon: TrendingUp,
                title: "Transferencias o Cheques",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "hover:border-emerald-500/30",
                items: [
                  "Con CHEQUE: acercate con la boleta de transacción web impresa o con el código QR. Atención al público hasta las 16:30 hs.",
                  "Con TRANSFERENCIA: el pago se aplica una vez acreditado.",
                  "ONE y el grupo Ultramar no aceptan cheques como medio de pago.",
                  "Si abonás con TRANSFERENCIA a proveedores, los pagos se aplican una vez que contemos con la acreditación. Recibimos el comprobante + la boleta de transacción web hasta las 18 hs del día en que la realizan.",
                  "El único mail válido para recibir la aplicación de los pagos es:",
                ],
                footer: { label: "recepcion@gestion-online.com.ar", href: "#" },
                cta: "Dar de alta tu agenda",
                ctaHref: "/dashboard/agendas?tab=notificaciones",
              },
              {
                icon: Building2,
                title: "Interbanking",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "hover:border-blue-500/30",
                items: [
                  "Estar adherido al servicio BtoB.",
                  "Dar de alta la comunidad de APC.",
                ],
                instructive: {
                  prompt: "¿No sabés cómo?",
                  label: "Descargá el instructivo",
                  href: "/instructivo-ib-vep.pdf",
                  download: "instructivo-ib-vep.pdf",
                },
                note:
                  "Las transferencias realizadas vía INTERBANKING pero confeccionadas como pago a proveedores NO son consideradas un Volante Electrónico de Pago (VEP). Una vez ejecutado el pago, se aplica automáticamente a tu transacción sin necesidad de notificarnos.",
                footer: null,
                cta: "Dar de alta tu agenda",
                ctaHref: "/dashboard/agendas?tab=interbanking",
              },
              {
                icon: CreditCard,
                title: "DEBIN",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                border: "hover:border-violet-500/30",
                items: [
                  "Agendá tu CBU o Alias en nuestro sistema.",
                  "Tenés tiempo hasta las 18 hs para ingresar a tu HOMEBANKING y aceptar el DEBIN.",
                  "Una vez aceptado, el pago se aplica automáticamente a tu transacción sin necesidad de notificarnos.",
                ],
                footer: null,
                cta: "Dar de alta tu agenda",
                ctaHref: "/dashboard/agendas?tab=debin",
              },
            ] as Array<{
              icon: typeof TrendingUp;
              title: string;
              color: string;
              bg: string;
              border: string;
              items: string[];
              footer: { label: string; href: string } | null;
              cta: string;
              ctaHref: string;
              /** Bloque opcional con un instructivo descargable (PDF). */
              instructive?: {
                prompt: string;
                label: string;
                href: string;
                download: string;
              };
              /** Nota aclaratoria opcional que se muestra debajo del instructivo. */
              note?: string;
            }>).map((mp) => {
              const Icon = mp.icon;
              return (
                <Card
                  key={mp.title}
                  className={`border-white/5 bg-card shadow-sm transition-all duration-300 ease-out ${mp.border} hover:scale-[1.02] hover:bg-secondary/30 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30`}
                >
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${mp.bg}`}>
                    <Icon className={`h-5 w-5 ${mp.color}`} />
                      </div>
                      <h4 className="font-semibold text-foreground">{mp.title}</h4>
                    </div>

                    <ul className="space-y-2">
                      {mp.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${mp.color} opacity-70`} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {mp.instructive && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-foreground">
                          {mp.instructive.prompt}
                        </p>
                        <a
                          href={mp.instructive.href}
                          download={mp.instructive.download}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-secondary/60 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {mp.instructive.label}
                        </a>
                      </div>
                    )}

                    {mp.note && (
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {mp.note}
                      </p>
                    )}

                    {mp.footer && (
                      <p className="mt-3 text-[10px] text-muted-foreground">{mp.footer.label}</p>
                    )}

                    <Link
                      href={mp.ctaHref}
                      className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold ${mp.color} transition-opacity hover:opacity-70`}
                    >
                      {mp.cta} <ChevronRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Carta de Garantía ── */}
        <section id="carta-garantia" className="scroll-mt-24">
          <CartaGarantiaSection />
        </section>

        {/* ── Carga de retenciones ── */}
        <section>
          <Card className="border-white/5 bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Carga de retenciones</p>
                  <p className="text-xs text-muted-foreground">
                    Adjuntá tus certificados de retención antes de confirmar el pago.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/10 bg-secondary/30 hover:bg-secondary/50"
              >
                <Link href="/dashboard/retenciones">
                  Cargar
                  <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}