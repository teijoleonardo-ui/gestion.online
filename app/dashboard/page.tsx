"use client";
 
import { useState, useCallback, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CONTRATANTES as contratantes } from "@/lib/contratantes";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartaGarantiaSection } from "@/components/carta-garantia/carta-garantia-section";
import {
  DASHBOARD_TARGET_SECTION_STORAGE_KEY,
  flashSectionSpotlightAfterScroll,
} from "@/lib/section-spotlight";
 
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
  preview?: string[];
  /** Borde lateral acorde al tono del slide (modo claro). */
  frameClass: string;
};
 
const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    tag: "Instructivos",
    tagIcon: BookOpen,
    title: "¿Cómo operar en la web?",
    description: "Guía paso a paso para consultar BLs, agregar gastos al carrito y generar tu anticipada online.",
    cta: "Ver guía",
    ctaHref: "https://www.gestion-online.com.ar/v3/Guias/INSTRUCTIVOS/",
    accent: "from-emerald-500/22 via-teal-500/14 to-emerald-600/10",
    iconBg: "bg-emerald-500/18",
    iconColor: "text-emerald-semantic",
    dot: "bg-emerald-400",
    preview: [
      "Guía para Operar en la Web",
      "Medios de Pago",
      "APM - Terminal 4",
      "Pagos en Moneda USD",
    ],
    frameClass: "border-2 border-emerald-semantic",
  },
  {
    id: 2,
    tag: "Carta de Garantía",
    tagIcon: Shield,
    title: "Verificá tu Carta de Garantía",
    description: "Controlá la vigencia de tu carta y descargá el modelo oficial antes de operar en APC.",
    cta: "Consultar y descargar",
    ctaHref: "#carta-garantia",
    accent: "from-blue-500/22 via-indigo-500/14 to-blue-600/10",
    iconBg: "bg-blue-500/18",
    iconColor: "text-blue-semantic",
    dot: "bg-blue-400",
    frameClass: "border-2 border-blue-semantic",
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
    accent: "from-violet-500/22 via-purple-500/16 to-fuchsia-600/10",
    iconBg: "bg-violet-500/18",
    iconColor: "text-violet-semantic",
    dot: "bg-violet-400",
    frameClass: "border-2 border-violet-semantic",
  },
];
 
/* Orden: Agendas · Retenciones · Carrito · Mis Gestiones */
const quickActions = [
  {
    icon: Mail,
    label: "Agendas",
    href: "/dashboard/agendas",
    color: "text-amber-semantic",
    bg: "bg-amber-semantic hover:bg-amber-semantic-md",
    frameClass: "border-2 border-amber-semantic",
  },
  {
    icon: FileText,
    label: "Retenciones",
    href: "/dashboard/retenciones",
    color: "text-emerald-semantic",
    bg: "bg-emerald-semantic hover:bg-emerald-semantic-md",
    frameClass: "border-2 border-emerald-semantic",
  },
  {
    icon: ShoppingCart,
    label: "Carrito",
    href: "/dashboard/carrito",
    color: "text-blue-semantic",
    bg: "bg-blue-semantic hover:bg-blue-semantic-md",
    frameClass: "border-2 border-blue-semantic",
  },
  {
    icon: FileText,
    label: "Mis Gestiones",
    href: "/dashboard/mis-gestiones",
    color: "text-violet-semantic",
    bg: "bg-violet-semantic hover:bg-violet-semantic-md",
    frameClass: "border-2 border-violet-semantic",
  },
];
 
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
      data-tinted-border
      className={cn(
        "hover-lift group relative h-full min-h-[160px] overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] ring-1 ring-inset ring-black/[0.04] dark:border dark:border-white/10 dark:ring-white/[0.03]",
        slide.frameClass,
      )}
      onMouseDown={handlePause}
      onMouseUp={handleResume}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      onTouchCancel={handleResume}
    >
      {/* Gradiente base del slide */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br ${slide.accent} transition-all duration-700 ease-out`}
      />
      {/* Refuerzo de color al hover (solo claro; dark sin velo extra) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-primary/14 via-chart-2/9 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-0"
      />
      {/* Orbe de color superior-derecho */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full opacity-45 blur-3xl transition-colors duration-700 ease-out ${slide.iconBg}`}
      />
      {/* Halo blanco frío inferior-izquierdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-black/[0.04] blur-3xl dark:bg-white/[0.04]"
      />
      {/* Línea superior de brillo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10"
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
              className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10 ${slide.iconBg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${slide.iconColor}`} />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-widest ${slide.iconColor}`}>
              {slide.tag}
            </span>
          </div>
 
          <div className="flex items-center gap-1.5">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-secondary hover:text-foreground active:scale-95 dark:border-white/5 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-white/[0.09] dark:hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-secondary hover:text-foreground active:scale-95 dark:border-white/5 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-white/[0.09] dark:hover:text-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
 
        <div className="mt-3">
          <h3 className="text-sm font-bold leading-snug text-foreground">{slide.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-800 line-clamp-3 dark:text-muted-foreground">
            {slide.description}
          </p>

          {slide.preview && slide.preview.length > 0 && (
            <ul className="mt-2.5 space-y-1">
              {slide.preview.slice(0, 4).map((title) => (
                <li
                  key={title}
                  className="flex items-center gap-1.5 text-[11px] leading-tight text-neutral-700 dark:text-muted-foreground"
                >
                  <span aria-hidden className={`h-1 w-1 shrink-0 rounded-full ${slide.dot} opacity-70`} />
                  <span className="truncate">{title}</span>
                </li>
              ))}
              {slide.preview.length > 4 && (
                <li className="pl-[10px] text-[10px] text-neutral-600 dark:text-muted-foreground/60">
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
              if (slide.ctaHref?.startsWith("#")) {
                const id = slide.ctaHref.slice(1);
                const target = document.getElementById(id);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  flashSectionSpotlightAfterScroll(id);
                }
              }
            }}
            className={`group/cta inline-flex items-center gap-1.5 text-xs font-semibold ${slide.iconColor} transition-opacity hover:opacity-80`}
          >
            {slide.cta}
            <ExternalLink className="h-3 w-3 transition-transform duration-200 ease-out group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </a>
 
          <div className="flex items-center gap-1.5">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  i === current
                    ? `w-5 ${slide.dot}`
                    : "w-1.5 bg-muted-foreground/25 hover:w-2 hover:bg-muted-foreground/40 dark:bg-white/20 dark:hover:bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
 
      {/* Barra de progreso */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] overflow-hidden bg-border dark:bg-white/[0.04]">
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

export default function DashboardPage() {
  const router = useRouter();
  const userName = "Leonardo Teijo Cuevas";
  const user = {
    firstName: userName.split(" ")[0] ?? "",
    lastName: userName.split(" ").slice(1).join(" ") ?? "",
  };

  useEffect(() => {
    const DASHBOARD_SECTION_IDS = new Set(["carta-garantia", "nuestros-contratantes"]);

    const scrollAndSpotlight = (id: string) => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        flashSectionSpotlightAfterScroll(id);
      });
    };

    const resolveTargetOnMount = (): string | null => {
      const fromHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      if (fromHash && DASHBOARD_SECTION_IDS.has(fromHash)) return fromHash;
      try {
        const stored = sessionStorage.getItem(DASHBOARD_TARGET_SECTION_STORAGE_KEY);
        if (stored && DASHBOARD_SECTION_IDS.has(stored)) {
          sessionStorage.removeItem(DASHBOARD_TARGET_SECTION_STORAGE_KEY);
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}#${stored}`,
          );
          return stored;
        }
      } catch {
        /* private mode / disabled storage */
      }
      return null;
    };

    const onHashChange = () => {
      const raw = window.location.hash;
      if (!raw.startsWith("#")) return;
      const id = raw.slice(1);
      if (!DASHBOARD_SECTION_IDS.has(id)) return;
      scrollAndSpotlight(id);
    };

    const initial = resolveTargetOnMount();
    if (initial) scrollAndSpotlight(initial);

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 min-h-[3.5rem] items-center justify-between px-dash sm:h-16">
          <div>
            <h1 className="text-base font-semibold text-foreground">Inicio</h1>
            <p className="text-xs text-muted-foreground">Panel principal</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
 
      <div className="mx-auto max-w-7xl space-y-6 px-dash py-dash md:space-y-8">
 
        {/* Bienvenida + Carrusel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Hola, {user.firstName} {user.lastName}
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                En nuestra plataforma, podras gestionar y pagar diversos servicios relacionados
                con el comercio exterior de manera sencilla y rapida.
              </p>
            </div>
 
            <Card
              data-tinted-border
              className="hover-lift border-2 border-emerald-semantic bg-emerald-semantic backdrop-blur-sm transition-colors duration-300 hover:bg-emerald-semantic-md"
            >
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
 
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    data-tinted-border
                    onClick={() => router.push(action.href)}
                    className={cn(
                      "hover-lift flex flex-col items-center gap-2.5 rounded-2xl p-4 transition-colors duration-300",
                      action.frameClass,
                      action.bg,
                    )}
                  >
                    <div className="dashboard-quick-icon flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 dark:bg-black/20">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
 
          <div className="lg:col-span-1">
            <InfoCarousel />
          </div>
        </div>
 
        {/* Contratantes */}
        <section id="nuestros-contratantes" className="scroll-mt-24">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Nuestros Contratantes</h3>
              <p className="text-xs text-muted-foreground">
                Hacé clic en el contratante que querés abonar.
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 bg-secondary/50 text-muted-foreground">
              {contratantes.length} activos
            </Badge>
          </div>
 
          <div className="mx-auto w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            <div className="grid w-full gap-2 max-lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,10.5rem),1fr))] max-lg:gap-3 lg:grid-cols-4 lg:gap-2.5 xl:grid-cols-5">
              {contratantes.map((c) => {
                const usesHoverBluePlate = c.sigla === "AMI";
                const needsReadablePlate = c.sigla === "SDC" || c.sigla === "APM";
                const needsSlightlyLargerLogo = c.sigla === "CN" || c.sigla === "APC" || c.sigla === "YM";
 
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Abonar ${c.nombre} (${c.sigla})`}
                    onClick={() =>
                      router.push(`/dashboard/consulta-bl?contratante=${encodeURIComponent(c.sigla)}`)
                    }
                    className={cn(
                      "group relative flex w-full flex-col overflow-hidden rounded-xl border-2 border-subtle bg-card p-2.5 text-center surface-card transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[var(--border-strong)] hover:shadow-md hover:shadow-black/5 dark:border-white/10 dark:hover:border-[var(--border-strong)] dark:hover:bg-secondary/35 dark:hover:shadow-black/25 sm:p-3",
                      /* Solo &lt; lg: celdas más legibles y logos visibles; desde lg igual que antes */
                      "max-lg:aspect-auto max-lg:min-h-[6.75rem] max-lg:touch-manipulation",
                      "lg:aspect-square lg:min-h-0",
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.04] to-transparent opacity-0 transition-opacity duration-300 dark:group-hover:opacity-100" />
                    <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-0.5 pb-5">
                      <div
                        className={cn(
                          "flex min-h-0 w-full flex-1 items-center justify-center rounded-md transition-all duration-300 max-lg:min-h-[4.25rem] lg:min-h-0",
                          needsReadablePlate &&
                            "px-1 py-0.5 bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0)] group-hover:bg-white/90 group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] dark:bg-transparent dark:group-hover:bg-white/95",
                          usesHoverBluePlate &&
                            /* Color marca AMI (≈ #164e63): petróleo; en dark sin placa hasta hover */
                            "bg-[#164e63]/76 transition-colors group-hover:bg-[#164e63] dark:bg-transparent dark:group-hover:bg-sky-500/35",
                        )}
                      >
                        <img
                          src={c.logoSrc}
                          alt=""
                          className={cn(
                            "max-h-[42%] w-auto max-w-[92%] object-contain transition-[filter,transform,opacity] duration-300 ease-out group-hover:scale-105",
                            /* Pantallas chicas: altura mínima para que el logo no quede invisible (% sobre celdas muy bajas) */
                            "max-lg:max-h-14 max-lg:min-h-10 sm:max-lg:max-h-16",
                            "lg:min-h-0",
                            /* Color ~70% en reposo, 100% al hover (excepto casos dark SDC/APM/AMI abajo) */
                            !needsReadablePlate &&
                              !usesHoverBluePlate &&
                              "saturate-[0.72] opacity-[0.88] group-hover:saturate-100 group-hover:opacity-100",
                            needsReadablePlate &&
                              "saturate-[0.72] opacity-[0.88] group-hover:saturate-100 group-hover:opacity-100 dark:brightness-0 dark:invert dark:!grayscale-0 dark:saturate-100 dark:opacity-100 dark:group-hover:brightness-100 dark:group-hover:invert-0",
                            usesHoverBluePlate &&
                              "saturate-[0.72] opacity-[0.88] group-hover:saturate-100 group-hover:opacity-100 dark:!grayscale-0 dark:!opacity-100",
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
                    <ChevronRight className="absolute bottom-2 right-2 h-2.5 w-2.5 text-muted-foreground/30 transition-all duration-300 group-hover:text-muted-foreground group-hover:translate-x-0.5 sm:h-3 sm:w-3" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
 
        {/* Medios de pago */}
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
                color: "text-emerald-600 dark:text-emerald-400",
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
                color: "text-blue-semantic",
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
                note: "Las transferencias realizadas vía INTERBANKING pero confeccionadas como pago a proveedores NO son consideradas un Volante Electrónico de Pago (VEP). Una vez ejecutado el pago, se aplica automáticamente a tu transacción sin necesidad de notificarnos.",
                footer: null,
                cta: "Dar de alta tu agenda",
                ctaHref: "/dashboard/agendas?tab=interbanking",
              },
              {
                icon: CreditCard,
                title: "DEBIN",
                color: "text-violet-600 dark:text-violet-400",
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
              instructive?: { prompt: string; label: string; href: string; download: string };
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
                        <p className="text-xs font-medium text-foreground">{mp.instructive.prompt}</p>
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
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{mp.note}</p>
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
 
        {/* Carta de Garantía */}
        <section id="carta-garantia" className="scroll-mt-24">
          <CartaGarantiaSection />
        </section>

        {/* Carga de retenciones */}
        <section id="carga-retenciones" className="scroll-mt-24">
          <Card className="border-border bg-card">
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
                className="border-border bg-secondary/30 hover:bg-secondary/50"
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
