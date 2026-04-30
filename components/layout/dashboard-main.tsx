"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollToTopFab } from "@/components/layout/scroll-to-top-fab";

/**
 * Un solo scroll en <main>: evita contenedores anidados que en algunos navegadores
 * no reciben bien la rueda del mouse y mantienen el panel lateral fuera del flujo que scrollea.
 */
export function DashboardMain({ children }: { children: React.ReactNode }) {
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  return (
    <main
      ref={setScrollRoot}
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-background",
      )}
    >
      {children}
      <ScrollToTopFab scrollContainer={scrollRoot} />
    </main>
  );
}
