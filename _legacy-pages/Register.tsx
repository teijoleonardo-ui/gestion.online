import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoGestion from "@/assets/logo-gestion-online.png";
import { AlertCircle, Mail, Lock, User, IdCard, ArrowLeft, Shield, Info, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { registerUser } from "@/services/register";

type FeedbackState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; mail: string }
  | { type: "error_duplicate" }
  | { type: "error_unknown" };

const Register = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [mail, setMail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!usuario || !nombre || !mail || !contrasena || !confirmarContrasena) {
      return;
    }
    if (contrasena !== confirmarContrasena) {
      return;
    }

    setFeedback({ type: "loading" });

    try {
      const result = await registerUser({ usuario, nombre, mail, contrasena });
      if (result.success) {
        setFeedback({ type: "success", mail });
      } else if (result.error === "duplicate_user" || result.error === "duplicate_mail" || result.error === "duplicate_both") {
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
      {/* Panel izquierdo - Formulario */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[55%] md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <h1 className="mb-0.5 text-2xl font-bold tracking-tight text-foreground">
            Creá tu cuenta
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Completá los datos para comenzar a operar online
          </p>

          <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <p className="text-xs leading-snug text-muted-foreground">
              Revisá que la información sea correcta — no se pueden realizar cambios una vez generado el usuario.
            </p>
          </div>

          {/* Feedback banners */}
          {feedback.type === "success" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/90 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                ¡Tu cuenta se creó exitosamente! Acabamos de enviarte un correo de validación a: <span className="font-bold">{feedback.mail}</span>. Por favor, revisá tu bandeja de entrada para confirmar tu registro
              </p>
            </div>
          )}

          {feedback.type === "error_duplicate" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                ¡Hola! El usuario o correo electrónico que ingresaste ya está registrado en nuestra base de datos. Si ya tenés una cuenta, te invitamos a iniciar sesión. Si tenés alguna duda, no dudes en contactarnos
              </p>
            </div>
          )}

          {feedback.type === "error_unknown" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/90 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-white" />
              <p className="text-sm font-medium leading-snug text-white">
                Ocurrió un error inesperado. Por favor, intentá nuevamente más tarde.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Usuario - full width */}
            <div className="space-y-1">
              <Label htmlFor="usuario" className="text-xs font-medium text-foreground">
                Usuario
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="CUIT / CUIL / DNI"
                  required
                  disabled={feedback.type === "loading" || feedback.type === "success"}
                  className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Nombre + Mail - side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nombre" className="text-xs font-medium text-foreground">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del usuario"
                    required
                    disabled={feedback.type === "loading" || feedback.type === "success"}
                    className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="mail" className="text-xs font-medium text-foreground">
                  Mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="mail"
                    type="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    disabled={feedback.type === "loading" || feedback.type === "success"}
                    className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Contraseñas - side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="contrasena" className="text-xs font-medium text-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    disabled={feedback.type === "loading" || feedback.type === "success"}
                    className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmarContrasena" className="text-xs font-medium text-foreground">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    id="confirmarContrasena"
                    type="password"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repetí tu contraseña"
                    required
                    disabled={feedback.type === "loading" || feedback.type === "success"}
                    className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="login"
              size="lg"
              disabled={feedback.type === "loading" || feedback.type === "success"}
              className="!mt-5 h-11 w-full rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
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

      {/* Panel derecho - Branding con glassmorphism */}
      <div className="relative hidden w-[45%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] md:flex">
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-sm" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 blur-sm" />
        <div className="absolute right-12 bottom-32 h-32 w-32 rounded-full bg-white/10 blur-sm" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-10">
          <img
            src={logoGestion}
            alt="Gestión Online"
            className="h-16 w-auto brightness-0 invert drop-shadow-lg"
          />
          <p className="max-w-xs text-center text-lg font-light leading-relaxed text-primary-foreground/90">
            Creá hoy tu usuario web y empezá a generar tus transacciones online
          </p>

          {/* Glass cards con la info */}
          <div className="mt-2 w-full max-w-sm space-y-2.5">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                Las casillas de mail son únicas por usuario y no pueden reutilizarse para registrar uno nuevo.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                Recomendamos casillas genéricas para que todos los que operen tengan acceso.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                NO se pueden modificar datos post-registro. NO se suministran claves de usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
