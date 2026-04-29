"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  FileText,
  Calendar,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
  HelpCircle,
  BookOpen,
  Shield,
  Receipt,
  Mail,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CART_ADDED_EVENT } from "@/lib/cart-events";
import { flashSectionSpotlightAfterScroll } from "@/lib/section-spotlight";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Guías oficiales (misma URL que el ítem del menú lateral «Instructivos»). */
const INSTRUCTIVOS_GUIAS_URL = "https://www.gestion-online.com.ar/v3/Guias/INSTRUCTIVOS/";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Si es true, se renderiza como <a target="_blank"> y no marca "activo". */
  external?: boolean;
  /** Solo Inicio: activo en /dashboard salvo cuando el hash es otra sección (p. ej. carta). */
  dashboardHome?: boolean;
  /** Ancla en /dashboard (sin #); scroll suave si ya estás en el dashboard. */
  anchorId?: string;
};

const menuItems: MenuItem[] = [
  { title: "Inicio", url: "/dashboard", icon: Home, dashboardHome: true },
  {
    title: "Instructivos",
    url: INSTRUCTIVOS_GUIAS_URL,
    icon: BookOpen,
    external: true,
  },
  {
    title: "Carta de Garantía",
    url: "/dashboard#carta-garantia",
    icon: Shield,
    anchorId: "carta-garantia",
  },
  { title: "Agendas", url: "/dashboard/agendas", icon: Calendar },
  { title: "Retenciones", url: "/dashboard/retenciones", icon: Receipt },
  { title: "Carrito", url: "/dashboard/carrito", icon: ShoppingCart },
  { title: "Mis Gestiones", url: "/dashboard/mis-gestiones", icon: FileText },
];

const tooltipContentClass =
  "border border-emerald-400/40 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 [&>span>svg]:!bg-emerald-600 [&>span>svg]:!fill-emerald-600 [&>svg]:!bg-emerald-600 [&>svg]:!fill-emerald-600";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [cartHighlight, setCartHighlight] = useState(false);

  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
  }, [pathname]);

  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const onCartAdded = () => {
      setCartHighlight(true);
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => setCartHighlight(false), 5000);
    };
    window.addEventListener(CART_ADDED_EVENT, onCartAdded);
    return () => {
      window.removeEventListener(CART_ADDED_EVENT, onCartAdded);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const scrollToDashboardAnchor = useCallback((id: string) => {
    const h = `#${id}`;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    flashSectionSpotlightAfterScroll(id);
    const nextUrl = `${window.location.pathname}${window.location.search}${h}`;
    if (window.location.hash !== h) {
      window.history.replaceState(null, "", nextUrl);
      setHash(h);
    }
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">GO</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Gestión Online</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const pathOnly = item.url.split("#")[0] ?? item.url;
            const isActive = (() => {
              if (item.external) return false;
              if (item.anchorId) {
                return pathname === "/dashboard" && hash === `#${item.anchorId}`;
              }
              if (item.dashboardHome) {
                return pathname === "/dashboard" && hash !== "#carta-garantia";
              }
              return (
                pathname === pathOnly ||
                (pathOnly !== "/dashboard" && pathname.startsWith(pathOnly))
              );
            })();

            const isCarrito = item.url === "/dashboard/carrito";

            const itemClassName = cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              cartHighlight &&
                isCarrito &&
                !isActive &&
                "bg-emerald-500/15 text-emerald-900 ring-1 ring-emerald-500/40 dark:bg-emerald-500/[0.18] dark:text-emerald-100 dark:ring-emerald-500/45",
              cartHighlight && isCarrito && isActive && "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-sidebar dark:ring-emerald-400/50",
            );

            const itemContent = (
              <>
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    cartHighlight && isCarrito && "text-emerald-700 dark:text-emerald-300",
                  )}
                />
                {!collapsed && (
                  <>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        cartHighlight && isCarrito &&
                          "font-semibold text-emerald-900 dark:text-emerald-50",
                      )}
                    >
                      {item.title}
                    </span>
                    {cartHighlight && isCarrito && (
                      <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm dark:bg-emerald-500">
                        Agregado
                      </span>
                    )}
                  </>
                )}
              </>
            );

            const NavItem = item.external ? (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClassName}
              >
                {itemContent}
              </a>
            ) : (
              <Link
                key={item.url}
                href={item.url}
                className={itemClassName}
                onClick={
                  item.anchorId && pathname === "/dashboard"
                    ? (e) => {
                        e.preventDefault();
                        scrollToDashboardAnchor(item.anchorId!);
                      }
                    : undefined
                }
              >
                {itemContent}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip
                  key={item.url}
                  {...(isCarrito && cartHighlight ? { open: true } : {})}
                >
                  <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className={tooltipContentClass}>
                    {cartHighlight && isCarrito ? "Agregado al carrito" : item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavItem;
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3">
          {/* Configuración */}
          {(() => {
            const item = {
              title: "Configuración",
              url: "/dashboard/configuracion",
              icon: Settings,
            };
            const isActive = pathname === item.url;
            const NavItem = (
              <Link
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className={tooltipContentClass}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return NavItem;
          })()}

          {/* Ayuda (abre diálogo flotante) */}
          <HelpDialog collapsed={collapsed} />

          <div className="mt-2 border-t border-sidebar-border pt-2">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className={tooltipContentClass}>
                  Cerrar sesión
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Cerrar sesión</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/* ─── Diálogo de ayuda ──────────────────────────────────────────────── */
function HelpDialog({ collapsed }: { collapsed: boolean }) {
  const trigger = (
    <button
      type="button"
      aria-label="Ayuda"
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <HelpCircle className="h-4 w-4 shrink-0" />
      {!collapsed && <span>Ayuda</span>}
    </button>
  );

  return (
    <Dialog>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className={tooltipContentClass}>
            Ayuda
          </TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="border-white/10 bg-card p-0 sm:max-w-lg">
        {/* Encabezado con gradiente */}
        <div className="relative overflow-hidden rounded-t-lg border-b border-white/10 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-600/45 dark:ring-emerald-500/40">
                <HelpCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-bold text-foreground">
                  ¿Necesitás ayuda?
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs">
                  Todo lo que necesitás para operar con nosotros.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenido */}
        <div className="space-y-3 p-6 pt-4">
          {/* Instructivos */}
          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-secondary/30 p-4 transition-colors hover:border-emerald-600/30 hover:bg-secondary/50 dark:hover:border-emerald-500/25">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-600/40 dark:ring-emerald-500/35">
              <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Instructivos</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Verificá los{" "}
                <a
                  href={INSTRUCTIVOS_GUIAS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  instructivos para operar en la web
                </a>{" "}
                — encontrarás guías paso a paso para consultar BLs, agregar gastos al carrito
                y generar tu anticipada online.
              </p>
            </div>
          </div>

          {/* Medios de pago */}
          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-secondary/30 p-4 transition-colors hover:border-blue-600/30 hover:bg-secondary/50 dark:hover:border-blue-500/25">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-inset ring-blue-600/40 dark:ring-blue-500/35">
              <CreditCard className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Medios de Pago</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                En la sección{" "}
                <a
                  href={INSTRUCTIVOS_GUIAS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Medios de Pago
                </a>{" "}
                del instructivo figuran todos los métodos disponibles junto con los datos bancarios
                necesarios para realizar tus pagos.
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-700/25 bg-emerald-500/5 p-4 dark:border-emerald-500/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-inset ring-emerald-600/45 dark:ring-emerald-500/40">
              <Mail className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                ¿Tenés consultas adicionales?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Escribinos y te ayudamos personalmente:
              </p>
              <a
                href="mailto:recepcion@gestion-online.com.ar"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <Mail className="h-3 w-3" />
                recepcion@gestion-online.com.ar
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
