import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import logoGestion from "@/assets/logo-gestion-online.png";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nombre = searchParams.get("nombre") || "Usuario";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Panel izquierdo - Confirmación */}
      <div className="flex w-full flex-col items-center justify-center px-8 md:w-[55%] md:px-16 lg:px-24">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          {/* Animated check icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            ¡Hola! {nombre.toUpperCase()} 😊
          </h1>

          <h2 className="mb-2 text-lg font-semibold text-foreground">
            ¡Gracias por verificar tu correo electrónico!
          </h2>

          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Ahora podés iniciar sesión y gestionar tus transacciones de forma online. Si necesitás ayuda, no dudes en contactarnos.
          </p>

          <Button
            variant="login"
            size="lg"
            onClick={() => navigate("/")}
            className="h-12 w-full max-w-xs rounded-xl shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            Ir al inicio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panel derecho - Branding */}
      <div className="relative hidden w-[45%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] md:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-sm" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 blur-sm" />
        <div className="absolute right-12 bottom-32 h-32 w-32 rounded-full bg-white/10 blur-sm" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-10">
          <img
            src={logoGestion}
            alt="Gestión Online"
            className="h-20 w-auto brightness-0 invert drop-shadow-lg"
          />
          <p className="max-w-xs text-center text-lg font-light leading-relaxed text-primary-foreground/90">
            Tu cuenta fue verificada exitosamente. ¡Bienvenido a Gestión Online!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
