"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Retenciones: scroll interno en la página (columnas).
 * Carrito: un solo scroll en <main> (barra nativa del navegador, sin contenedor extra).
 */
export function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRetenciones = pathname.startsWith("/dashboard/retenciones");
  const isCarrito = pathname.startsWith("/dashboard/carrito");

  return (
    <main
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-x-hidden bg-background",
        isRetenciones
          ? "flex h-full flex-col overflow-hidden"
          : isCarrito
            ? "overflow-y-auto"
            : "overflow-y-auto",
      )}
    >
      {children}
    </main>
  );
}
