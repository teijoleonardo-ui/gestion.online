"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const iconMotion = cn(
  "h-4 w-4 transition-transform duration-300 ease-out",
  "motion-safe:animate-[theme-toggle-icon_4s_ease-in-out_infinite]",
  "group-hover:scale-110 group-hover:rotate-12 group-active:scale-95",
);

/** Una vez por sesión de navegador (se borra al cerrar la pestaña). */
const THEME_INTRO_SESSION_KEY = "gestion-online-theme-intro-shown-session";

type BubbleBox = { top: number; left: number; width: number };

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [bubbleBox, setBubbleBox] = useState<BubbleBox | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const hideIntro = useCallback(() => {
    setIntroVisible(false);
    setBubbleBox(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (resolvedTheme !== "dark") {
      hideIntro();
      return;
    }
    try {
      if (sessionStorage.getItem(THEME_INTRO_SESSION_KEY)) return;
      sessionStorage.setItem(THEME_INTRO_SESSION_KEY, "1");
      setIntroVisible(true);
      timerRef.current = setTimeout(() => {
        setIntroVisible(false);
        setBubbleBox(null);
        timerRef.current = null;
      }, 5000);
    } catch {
      /* private mode */
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mounted, resolvedTheme, hideIntro]);

  const updateBubblePosition = useCallback(() => {
    if (!introVisible || !btnRef.current) {
      setBubbleBox(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const width = Math.min(288, Math.max(220, window.innerWidth - 24));
    let left = r.right - width;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    setBubbleBox({ top: r.bottom + 8, left, width });
  }, [introVisible]);

  useLayoutEffect(() => {
    updateBubblePosition();
  }, [updateBubblePosition, introVisible]);

  useEffect(() => {
    if (!introVisible) return;
    const onResize = () => updateBubblePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [introVisible, updateBubblePosition]);

  /** Un clic en cualquier parte de la pantalla cierra el cartel (incluye el mismo cartel). */
  useEffect(() => {
    if (!introVisible || !mounted) return;
    const onPointerDown = () => hideIntro();
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [introVisible, mounted, hideIntro]);

  useEffect(() => {
    if (!introVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideIntro();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introVisible, hideIntro]);

  const handleToggle = () => {
    const goingLight = resolvedTheme === "dark";
    if (goingLight) setTheme("light");
    else setTheme("dark");
  };

  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = resolvedTheme === "dark";

  const legendPortal =
    introVisible &&
    isDark &&
    bubbleBox &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        id="theme-intro-leyenda"
        role="status"
        style={{
          position: "fixed",
          top: bubbleBox.top,
          left: bubbleBox.left,
          width: bubbleBox.width,
          zIndex: 10050,
        }}
        className={cn(
          "rounded-xl border-2 border-primary/50 bg-card text-card-foreground shadow-2xl",
          "px-3.5 py-3 text-left text-xs",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
        )}
      >
        <p className="font-semibold text-foreground">Modo claro</p>
        <p className="mt-1.5 leading-snug text-muted-foreground">
          Tocá el sol para cambiar a la pantalla clara. Si lo hacés, guardamos tu preferencia en este
          dispositivo (modo oscuro o claro).
        </p>
      </div>,
      document.body,
    );

  return (
    <>
      {legendPortal}
      <div className="relative shrink-0">
        <button
          ref={btnRef}
          type="button"
          onClick={handleToggle}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-describedby={introVisible && isDark ? "theme-intro-leyenda" : undefined}
          className={cn(
            "group relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground transition-all duration-300 hover:text-foreground",
            introVisible &&
              isDark &&
              cn(
                "z-[10060] scale-110 bg-primary/25 shadow-lg shadow-primary/50 motion-reduce:scale-105",
                "ring-[3px] ring-primary ring-offset-[3px] ring-offset-background dark:shadow-primary/40",
              ),
          )}
        >
          {introVisible && isDark && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/25 to-primary/[0.08] animate-pulse motion-reduce:animate-none"
            />
          )}
          {isDark ? (
            <Sun
              className={cn(
                iconMotion,
                "relative z-[1]",
                introVisible && "text-primary [filter:drop-shadow(0_0_14px_oklch(0.78_0.18_158_/_0.9))]",
              )}
            />
          ) : (
            <Moon className={cn(iconMotion, "relative z-[1]")} />
          )}
        </button>
      </div>
    </>
  );
}
