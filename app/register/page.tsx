"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
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
} from "lucide-react";
import { registerUser } from "@/services/register";

type FeedbackState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; maskedMail: string }
  | { type: "error_duplicate" }
  | { type: "error_unknown" };

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

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Columna izquierda — formulario */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[55%] md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <h1 className="mb-0.5 text-2xl font-bold tracking-tight text-foreground">Crea tu cuenta</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Completa los datos para comenzar a operar online
          </p>

          <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <p className="text-xs leading-snug text-muted-foreground">
              Revisa que la informacion sea correcta.
            </p>
          </div>

          {feedback.type === "success" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/90 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                ¡Tu cuenta se creó exitosamente! El correo para la validación fue enviado a{" "}
                <span className="font-bold">{feedback.maskedMail}</span>. Por favor, revisá tu bandeja de entrada para confirmar tu registro.
              </p>
            </div>
          )}

          {feedback.type === "error_duplicate" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-3 shadow-lg">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                El usuario o correo electronico ya esta registrado.
              </p>
            </div>
          )}

          {feedback.type === "error_unknown" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-3 shadow-lg">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                Ocurrio un error inesperado. Intenta nuevamente.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="usuario" className="text-xs font-medium text-foreground">
                Usuario
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input id="usuario" type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required className="h-10 rounded-xl pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nombre" className="text-xs font-medium text-foreground">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="h-10 rounded-xl pl-10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="mail" className="text-xs font-medium text-foreground">
                  Mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input id="mail" type="email" value={mail} onChange={(e) => setMail(e.target.value)} required className="h-10 rounded-xl pl-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="contrasena" className="text-xs font-medium text-foreground">
                  Contrasena
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    aria-invalid={passwordMismatch}
                    className={`h-10 rounded-xl pl-10 ${passwordMismatch ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmarContrasena" className="text-xs font-medium text-foreground">
                  Confirmar contrasena
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="confirmarContrasena"
                    type="password"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    aria-invalid={passwordMismatch}
                    className={`h-10 rounded-xl pl-10 ${passwordMismatch ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}`}
                  />
                </div>
              </div>
            </div>

            {passwordMismatch && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                <p className="text-sm font-medium leading-snug text-white">
                  Las contraseñas no coinciden. Revisá ambos campos e intentá nuevamente.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="login"
              size="lg"
              disabled={feedback.type === "loading" || feedback.type === "success" || passwordMismatch}
              className="!mt-5 h-11 w-full rounded-xl disabled:opacity-60"
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

     {/* Columna derecha — imagen superior pegada al borde + leyendas centradas debajo */}
     <div className="hidden md:flex md:w-[45%] flex-col h-screen">

  {/* Imagen completa pegada al tope */}
  <div className="w-full">
    <img
      src={loginPanelHorizontal.src}
      alt="Gestion Online"
      className="w-full h-auto block"
    />
  </div>

  {/* Espacio restante — leyendas centradas vertical y horizontalmente */}
  <div className="flex flex-1 flex-col items-center justify-center px-10 gap-3">

    <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-md w-full">
      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
      <p className="text-sm leading-relaxed text-white/90">
        Las casillas de mail registradas para un usuario son únicas, no pueden volver a ser utilizadas para registrar uno nuevo.
      </p>
    </div>

    <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-md w-full">
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
      <p className="text-sm leading-relaxed text-white/90">
        Recomendamos utilizar casillas genéricas para que todos los que operen en la web, tengan acceso a la misma.
      </p>
    </div>

    <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-md w-full">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
      <p className="text-sm leading-relaxed text-white/90">
        NO se pueden realizar modificaciones sobre los datos ingresados en el momento del registro.
        NO se suministran claves de usuarios.
      </p>
    </div>

  </div>

</div>

</div>
  );
}