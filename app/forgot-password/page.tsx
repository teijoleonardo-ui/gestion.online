"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import brandingRight from "@/assets/branding-right.png";
import {
  ArrowLeft,
  IdCard,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { requestPasswordReset } from "@/services/forgot-password";

type FeedbackState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; maskedMail: string }
  | { type: "error_not_found" }
  | { type: "error_unknown" };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setFeedback({ type: "loading" });

    try {
      const result = await requestPasswordReset({ usuario });
      if (result.success) {
        setFeedback({ type: "success", maskedMail: result.maskedMail ?? "" });
      } else if (result.error === "user_not_found") {
        setFeedback({ type: "error_not_found" });
      } else {
        setFeedback({ type: "error_unknown" });
      }
    } catch {
      setFeedback({ type: "error_unknown" });
    }
  };

  const isBusy = feedback.type === "loading" || feedback.type === "success";

  return (
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[460px] rounded-[28px] border border-white/[0.07] bg-[oklch(0.13_0_0)] p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)_inset] sm:p-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-6 flex items-center gap-1.5 text-[0.8125rem] font-medium text-neutral-400 transition-colors hover:text-[#10b981]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <header>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-white">
              ¡Hola!
            </h1>
            <p className="mt-1 text-[1rem] font-medium text-white">
              ¿Querés recuperar tu contraseña?
            </p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-neutral-400">
              Ingresá tu usuario y te enviaremos una nueva contraseña al correo con el que te registraste.
            </p>
          </header>

          {feedback.type === "success" && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium leading-snug text-emerald-50">
                El correo para la recuperación de tu contraseña fue enviado a{" "}
                <span className="font-bold">{feedback.maskedMail}</span>
              </p>
            </div>
          )}

          {feedback.type === "error_not_found" && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-sm font-medium leading-snug text-rose-50">
                No encontramos ese usuario en nuestra base de datos. Revisá los datos e intentá nuevamente.
              </p>
            </div>
          )}

          {feedback.type === "error_unknown" && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-sm font-medium leading-snug text-rose-50">
                Ocurrió un error inesperado. Por favor, intentá nuevamente más tarde.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="usuario"
                className="block text-[0.8125rem] font-semibold tracking-wide text-white"
              >
                Usuario
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="CUIT / CUIL / DNI"
                  disabled={isBusy}
                  required
                  className="h-12 rounded-full border border-white/10 bg-[oklch(0.17_0_0)] pl-12 pr-5 text-[0.9375rem] text-white placeholder:text-neutral-500 transition focus-visible:border-[#10b981] focus-visible:ring-0 focus-visible:shadow-[0_0_24px_rgba(16,185,129,0.45)] disabled:opacity-60"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="login"
              size="lg"
              disabled={isBusy}
              className="mt-2 h-12 w-full rounded-full text-[0.9375rem] font-semibold tracking-wide text-white transition active:scale-[0.99] bg-[linear-gradient(180deg,#34d399_0%,#059669_100%)] shadow-[0_0_40px_rgba(52,211,153,0.55),0_0_80px_rgba(52,211,153,0.25)] hover:brightness-110 disabled:opacity-70 disabled:hover:brightness-100"
            >
              {feedback.type === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : feedback.type === "success" ? (
                "Enviado"
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </div>
      </section>

      <section
        className="relative hidden overflow-hidden lg:block"
        aria-label="Gestión Online"
      >
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
