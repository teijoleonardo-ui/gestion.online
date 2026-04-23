import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoGestion from "@/assets/logo-gestion-online.png";
import { ArrowLeft, IdCard, ShieldCheck, Mail, HelpCircle } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recuperar contraseña:", { usuario });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Panel izquierdo - Formulario */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[55%] md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <h1 className="mb-0.5 text-2xl font-bold tracking-tight text-foreground">
            ¡Hola! 👋
          </h1>
          <p className="mb-1 text-lg font-medium text-foreground">
            ¿Querés recuperar tu contraseña?
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            Ingresá tu usuario y te enviaremos una nueva contraseña al correo con el que te registraste
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="h-10 rounded-xl border-border bg-card pl-10 shadow-sm transition-all focus:shadow-md focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="login"
              size="lg"
              className="h-11 w-full rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              Enviar
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
            Recuperá tu acceso de forma rápida y segura
          </p>

          {/* Glass cards */}
          <div className="mt-2 w-full max-w-sm space-y-2.5">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                Te enviaremos una nueva contraseña al correo electrónico asociado a tu cuenta.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                Por seguridad, te recomendamos cambiar tu contraseña una vez que ingreses.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
              <p className="text-xs leading-relaxed text-primary-foreground/85">
                Si no recordás tu usuario, contactá al administrador de tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
