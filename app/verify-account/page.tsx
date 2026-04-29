"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import brandingRight from "@/assets/branding-right.png";
import { CheckCircle2, ArrowRight } from "lucide-react";

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nombre = searchParams?.get("nombre") || "Usuario";

  return (
    <main className="grid min-h-screen grid-cols-1 bg-black text-white lg:grid-cols-2">
      <section className="flex items-center justify-center bg-black px-6 py-12 sm:px-10">
        <div className="w-full max-w-[460px] rounded-[28px] border border-white/[0.07] bg-[oklch(0.13_0_0)] p-8 text-center shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)_inset] sm:p-10">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
            <span
              className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-500/10"
              style={{
                boxShadow:
                  "0 0 40px rgba(52,211,153,0.45), 0 0 80px rgba(52,211,153,0.2)",
              }}
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </span>
          </div>

          <h1 className="text-[1.5rem] font-bold tracking-tight text-white">
            ¡Hola, {nombre.toUpperCase()}!
          </h1>

          <h2 className="mt-2 text-[1rem] font-semibold text-white">
            ¡Gracias por verificar tu correo electrónico!
          </h2>

          <p className="mt-3 text-[0.9375rem] leading-relaxed text-neutral-400">
            Ahora podés iniciar sesión y gestionar tus transacciones de forma online. Si necesitás ayuda, no dudes en contactarnos.
          </p>

          <Button type="button" variant="login" size="auth" className="mt-8" onClick={() => router.push("/")}>
            Ir al inicio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="relative hidden min-h-screen overflow-hidden lg:block" aria-label="Gestión Online">
        <Image
          src={brandingRight}
          alt="Gestión Online — Pagá online de la forma más fácil e inmediata"
          fill
          priority
          className="object-cover"
        />
      </section>
    </main>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#10b981] border-t-transparent" />
        </div>
      }
    >
      <VerifyAccountContent />
    </Suspense>
  );
}
