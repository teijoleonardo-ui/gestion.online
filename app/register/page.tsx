"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginPanelHorizontal from "@/assets/login-panel-horizontal.jpg";
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  IdCard,
  ArrowLeft,
  Shield,
  Info,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { registerUser } from "@/services/register";

type FeedbackState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; maskedMail: string }
  | { type: "error_duplicate" }
  | { type: "error_unknown" };

function RegisterInfoCard({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-950/40 px-4 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/85" aria-hidden />
      <p className="text-sm leading-relaxed text-white/90">{children}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [mail, setMail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });

  const passwordMismatch =
    contrasena.length > 0 &&
    confirmarContrasena.length > 0 &&
    contrasena !== confirmarContrasena;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !nombre || !mail || !contrasena || !confirmarContrasena) return;
    if (contrasena !== confirmarContrasena) return;

    setFeedback({ type: "loading" });

    try {
      const result = await registerUser({ usuario, nombre, mail, contrasena });
      if (result.success) {
        setFeedback({
          type: "success",
          maskedMail: result.maskedMail ?? mail,
        });
      } else if (
        result.error === "duplicate_user" ||
        result.error === "duplicate_mail" ||
        result.error === "duplicate_both"
      ) {
        setFeedback({ type: "error_duplicate" });
      } else {
        setFeedback({ type: "error_unknown" });
      }
    } catch {
      setFeedback({ type: "error_unknown" });
    }
  };

  const inputClass =
    "h-12 rounded-2xl border border-white/10 bg-[oklch(0.17_0_0)] pl-11 text-[0.9375rem] text-white shadow-none transition placeholder:text-neutral-500 focus-visible:border-emerald-500 focus-visible:ring-0 focus-visible:shadow-[0_0_20px_rgba(16,185,129,0.35)]";

  return (
    <div className="flex min-h-screen flex-col bg-black text-white lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-lg rounded-[28px] border border-white/[0.07] bg-[oklch(0.13_0_0)] p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)_inset] sm:p-10">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mb-6 flex items-center gap-1.5 text-[0.8125rem] font-medium text-neutral-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-neutral-400">Completa los datos para comenzar a operar online</p>

          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-transparent px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <p className="text-xs font-medium leading-snug text-emerald-400/95">Revisa que la informacion sea correcta.</p>
          </div>

          {feedback.type === "success" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm font-medium leading-snug text-emerald-50">
                ¡Tu cuenta se creó exitosamente! El correo para la validación fue enviado a{" "}
                <span className="font-bold">{feedback.maskedMail}</span>. Por favor, revisá tu bandeja de entrada para
                confirmar tu registro.
              </p>
            </div>
          )}

          {feedback.type === "error_duplicate" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/35 bg-rose-500/15 px-4 py-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-sm font-medium leading-snug text-rose-50">
                El usuario o correo electronico ya esta registrado.
              </p>
            </div>
          )}

          {feedback.type === "error_unknown" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/35 bg-rose-500/15 px-4 py-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-sm font-medium leading-snug text-rose-50">Ocurrio un error inesperado. Intenta nuevamente.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="text-[0.8125rem] font-semibold text-white">
                Usuario
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input id="usuario" type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-[0.8125rem] font-semibold text-white">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mail" className="text-[0.8125rem] font-semibold text-white">
                  Mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input id="mail" type="email" value={mail} onChange={(e) => setMail(e.target.value)} required className={inputClass} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contrasena" className="text-[0.8125rem] font-semibold text-white">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    aria-invalid={passwordMismatch}
                    className={`${inputClass} ${passwordMismatch ? "border-rose-500 focus-visible:shadow-rose-500/20" : ""}`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmarContrasena" className="text-[0.8125rem] font-semibold text-white">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="confirmarContrasena"
                    type="password"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    aria-invalid={passwordMismatch}
                    className={`${inputClass} ${passwordMismatch ? "border-rose-500 focus-visible:shadow-rose-500/20" : ""}`}
                  />
                </div>
              </div>
            </div>

            {passwordMismatch && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-400/35 bg-rose-500/15 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <p className="text-sm font-medium leading-snug text-rose-50">
                  Las contraseñas no coinciden. Revisá ambos campos e intentá nuevamente.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="login"
              size="auth"
              disabled={feedback.type === "loading" || feedback.type === "success" || passwordMismatch}
              className="!mt-6"
            >
              {feedback.type === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar registro"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden h-screen min-h-0 flex-col overflow-hidden lg:flex lg:w-1/2">
        <div className="w-full shrink-0">
          <Image
            src={loginPanelHorizontal}
            alt="Gestión Online"
            className="block h-auto w-full"
            priority
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-y-auto bg-black px-8 py-6">
          <RegisterInfoCard icon={Mail}>
            Las casillas de mail registradas para un usuario son únicas, no pueden volver a ser utilizadas para registrar uno
            nuevo.
          </RegisterInfoCard>
          <RegisterInfoCard icon={Shield}>
            Recomendamos utilizar casillas genéricas para que todos los que operen en la web, tengan acceso a la misma.
          </RegisterInfoCard>
          <RegisterInfoCard icon={Info}>
            NO se pueden realizar modificaciones sobre los datos ingresados en el momento del registro. NO se suministran
            claves de usuarios.
          </RegisterInfoCard>
        </div>
      </div>
    </div>
  );
}
