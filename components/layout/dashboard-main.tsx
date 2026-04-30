"use client";

import { cn } from "@/lib/utils";

/**
 * Un solo scroll en <main>: evita contenedores anidados que en algunos navegadores
 * no reciben bien la rueda del mouse y mantienen el panel lateral fuera del flujo que scrollea.
 */
export function DashboardMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-background",
      )}
    >
      {children}
    </main>
  );
}
