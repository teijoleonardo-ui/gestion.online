"use client";

import { useState } from "react";
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

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Si es true, se renderiza como <a target="_blank"> y no marca "activo". */
  external?: boolean;
};

const menuItems: MenuItem[] = [
  { title: "Inicio", url: "/dashboard", icon: Home },
  {
    title: "Instructivos",
    url: "https://www.gestion-online.com.ar/v3/Guias/INSTRUCTIVOS/",
    icon: BookOpen,
    external: true,
  },
  {
    title: "Carta de Garantía",
    url: "http://www.apconline.com.ar/carta.html",
    icon: Shield,
    external: true,
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
            const isActive =
              !item.external &&
              (pathname === item.url ||
                (item.url !== "/dashboard" && pathname.startsWith(item.url)));

            const itemClassName = cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            );

            const itemContent = (
              <>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
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
              <Link key={item.url} href={item.url} className={itemClassName}>
                {itemContent}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className={tooltipContentClass}>
                    {item.title}
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/30">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
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
          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-secondary/30 p-4 transition-colors hover:border-emerald-500/20 hover:bg-secondary/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-400/20">
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Instructivos</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Verificá los <span className="font-medium text-emerald-400">instructivos para operar en la web</span> —
                encontrarás guías paso a paso para consultar BLs, agregar gastos al carrito
                y generar tu anticipada online.
              </p>
            </div>
          </div>

          {/* Medios de pago */}
          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-secondary/30 p-4 transition-colors hover:border-blue-500/20 hover:bg-secondary/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-inset ring-blue-400/20">
              <CreditCard className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Medios de Pago</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                En la sección <span className="font-medium text-blue-400">Medios de Pago</span> del
                dashboard figuran todos los métodos disponibles junto con los
                <span className="font-medium text-foreground"> datos bancarios</span> necesarios
                para realizar tus pagos.
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/30">
              <Mail className="h-4 w-4 text-emerald-400" />
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
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
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
