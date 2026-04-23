import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoGestion from "@/assets/logo-gestion-online.png";
import Image from "next/image";

const Index = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const router = useRouter();
router.push("/dashboard");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implementar lógica de login
    console.log("Login:", { usuario, contrasena });
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo - Formulario */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 md:px-20 lg:px-28">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">
            Bienvenido
          </h1>
          <p className="mb-8 text-base text-muted-foreground">
            Ingresá tus credenciales para acceder a tu cuenta
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="text-sm font-medium text-foreground">
                Usuario
              </Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresá tu usuario"
                className="h-12 rounded-xl border-border bg-card shadow-sm transition-shadow focus:shadow-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contrasena" className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresá tu contraseña"
                className="h-12 rounded-xl border-border bg-card shadow-sm transition-shadow focus:shadow-md"
              />
            </div>

            <Button type="submit" variant="login" size="lg" className="h-12 w-full rounded-xl shadow-md hover:shadow-lg transition-shadow">
              Ingresar
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">¿No tenés cuenta?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="register" size="lg" className="mt-4 h-12 w-full rounded-xl" onClick={() => router.push("/registrate")}>
            Registrate
          </Button>

          <button
            type="button"
            onClick={() => router.push("/olvide-contrasena")}
            className="mt-6 block w-full text-center text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Panel derecho - Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] md:flex">
  <div className="flex flex-col items-center gap-8 px-12 text-center">
    <Image
      src={logoGestion}
      alt="Gestión Online"
      width={200}
      height={100}
      className="h-24 w-auto brightness-0 invert drop-shadow-lg"
    />
    <p className="max-w-sm text-2xl font-light leading-relaxed text-primary-foreground/90">
      Pagá online de la forma más fácil e inmediata
    </p>
  </div>
</div>
    </div>
  );
};

export default Index;
