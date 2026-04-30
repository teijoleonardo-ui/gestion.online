"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 280;

type ScrollToTopFabProps = {
  /** Área con scroll; si falta, se usa la ventana (documento). */
  scrollContainer?: HTMLElement | null;
};

export function ScrollToTopFab({ scrollContainer }: ScrollToTopFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      if (scrollContainer) {
        setVisible(scrollContainer.scrollTop > SCROLL_THRESHOLD_PX);
      } else {
        setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", update, { passive: true });
      update();
      return () => scrollContainer.removeEventListener("scroll", update);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [scrollContainer]);

  const scrollTop = useCallback(() => {
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollContainer]);

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      onClick={scrollTop}
      aria-label="Subir al inicio"
      title="Subir al inicio"
      className={cn(
        "fixed z-40 h-11 w-11 rounded-full shadow-lg transition-[opacity,transform] duration-200",
        "bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] right-[max(1.5rem,env(safe-area-inset-right,0px))]",
        "sm:bottom-8 sm:right-8",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ChevronUp className="size-5" strokeWidth={2.25} />
    </Button>
  );
}
