"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  changePassword,
  type ChangePasswordError,
} from "@/services/change-password";

// ─── Datos del usuario logueado ──────────────────────────────────────────────
// TODO: reemplazar por el usuario de la sesión real (contexto / hook / store).
//       p.ej. `const { user } = useSession();`
const CURRENT_USER = {
  nombre: "Leonardo Teijo Cuevas",
  mail: "recepcion@gestion-online.com.ar",
};

// ─── Política de contraseña ──────────────────────────────────────────────────
const MIN_PASSWORD_LENGTH = 8;

// ─── Estados del feedback ────────────────────────────────────────────────────
type FeedbackErrorCode = ChangePasswordError | "mismatch" | "too_short";

type FeedbackState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; code: FeedbackErrorCode };

const ERROR_MESSAGES: Record<FeedbackErrorCode, string> = {
  wrong_current:
    "La contraseña actual no es correcta. Verificá y probá de nuevo.",
  same_as_current:
    "La nueva contraseña no puede ser igual a la actual. Ingresá una distinta.",
  weak_password:
    "La contraseña no cumple con la política de seguridad. Probá con una más fuerte.",
  unauthorized:
    "Tu sesión expiró. Por favor, iniciá sesión nuevamente para continuar.",
  unknown:
    "Ocurrió un error inesperado. Intentá nuevamente en unos minutos.",
  mismatch:
    "Las contraseñas no coinciden. Asegurate de ingresar la misma en ambos campos.",
  too_short: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
};

function getInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function ConfiguracionPage() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });

  const isLoading = feedback.type === "loading";
  const isSuccess = feedback.type === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validaciones del lado del cliente antes de llamar al backend.
    if (!current || !next || !confirm) return;
    if (next.length < MIN_PASSWORD_LENGTH) {
      setFeedback({ type: "error", code: "too_short" });
      return;
    }
    if (next !== confirm) {
      setFeedback({ type: "error", code: "mismatch" });
      return;
    }

    setFeedback({ type: "loading" });
    try {
      const result = await changePassword({ current, next });
      if (result.success) {
        setFeedback({ type: "success" });
        setCurrent("");
        setNext("");
        setConfirm("");
        setShowPasswords(false);
      } else {
        setFeedback({ type: "error", code: result.error ?? "unknown" });
      }
    } catch {
      setFeedback({ type: "error", code: "unknown" });
    }
  };

  const inputType = showPasswords ? "text" : "password";
  const passwordMismatch =
    !!confirm && !!next && confirm.length >= next.length && confirm !== next;

  return (
    <div className="min-h-svh bg-background">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 min-h-[3.5rem] items-center px-dash sm:h-16">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Configuración
            </h1>
            <p className="text-sm text-muted-foreground">
              Actualizá los datos de seguridad de tu cuenta
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-dash py-dash">
        {/* ── Hero ── */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <SettingsIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mi cuenta
                </p>
                <h2 className="text-2xl font-bold text-foreground">
                  Datos personales y contraseña
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cambiá tu contraseña cada tanto para mantener tu cuenta segura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Grilla principal ── */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* ── Perfil ── */}
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 text-2xl font-bold text-emerald-700 ring-2 ring-inset ring-emerald-700/40 dark:text-emerald-300 dark:ring-emerald-500/35">
                  {getInitials(CURRENT_USER.nombre)}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-800/50 bg-emerald-500 text-emerald-950 dark:border-card">
                  <ShieldCheck className="h-3 w-3" />
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-foreground">
                {CURRENT_USER.nombre}
              </h3>

              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-secondary/40 px-3 py-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs text-muted-foreground">
                  {CURRENT_USER.mail}
                </span>
              </div>

              <div className="mt-6 w-full space-y-1.5 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Usuario
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-800/25 bg-secondary/30 px-3 py-2.5 dark:border-white/10">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">
                    {CURRENT_USER.nombre}
                  </span>
                </div>
              </div>

              <div className="mt-5 h-px w-full bg-border" />

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/")}
                className="mt-5 w-full justify-center gap-2 border-2 border-rose-600/45 bg-rose-500/5 text-rose-800 hover:border-rose-700/70 hover:bg-rose-500/12 hover:text-rose-950 dark:border-rose-500/45 dark:bg-rose-500/5 dark:text-rose-300 dark:hover:border-rose-400/55 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>

          {/* ── Cambiar contraseña ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Cambiar contraseña
              </CardTitle>
              <CardDescription>
                Para continuar es necesario que ingreses los siguientes datos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Feedback */}
                {isSuccess && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300 dark:border-emerald-800/70 dark:bg-emerald-950/40"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <p className="text-sm font-medium leading-snug text-emerald-950 dark:text-emerald-50">
                      Tu contraseña se actualizó correctamente. Vas a poder usarla
                      la próxima vez que inicies sesión.
                    </p>
                  </div>
                )}

                {feedback.type === "error" && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300 dark:border-rose-900/70 dark:bg-rose-950/35"
                  >
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <p className="text-sm font-medium leading-snug text-rose-950 dark:text-rose-50">
                      {ERROR_MESSAGES[feedback.code]}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="current"
                    className="text-xs font-medium text-foreground"
                  >
                    Contraseña actual
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="current"
                      type={inputType}
                      value={current}
                      onChange={(e) => {
                        setCurrent(e.target.value);
                        if (feedback.type === "error") setFeedback({ type: "idle" });
                      }}
                      placeholder="Contraseña actual"
                      disabled={isLoading || isSuccess}
                      autoComplete="current-password"
                      required
                      className="h-10 bg-secondary/40 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="next"
                    className="text-xs font-medium text-foreground"
                  >
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="next"
                      type={inputType}
                      value={next}
                      onChange={(e) => {
                        setNext(e.target.value);
                        if (feedback.type === "error") setFeedback({ type: "idle" });
                      }}
                      placeholder="Nueva contraseña"
                      disabled={isLoading || isSuccess}
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                      className="h-10 bg-secondary/40 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm"
                    className="text-xs font-medium text-foreground"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="confirm"
                      type={inputType}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        if (feedback.type === "error") setFeedback({ type: "idle" });
                      }}
                      placeholder="Confirmar contraseña"
                      disabled={isLoading || isSuccess}
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                      className={cn(
                        "h-10 bg-secondary/40 pl-10",
                        passwordMismatch &&
                          "border-rose-500/40 focus-visible:ring-rose-500/30",
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    La contraseña debe tener al menos{" "}
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {MIN_PASSWORD_LENGTH} caracteres
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                    <Checkbox
                      checked={showPasswords}
                      onCheckedChange={(v) => setShowPasswords(v === true)}
                      aria-label="Mostrar contraseñas"
                    />
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {showPasswords ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      Mostrar contraseñas
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="h-11 w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Contraseña actualizada
                    </>
                  ) : (
                    "Actualizar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
