"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import brandingRight from "@/assets/branding-right.png";
import { loginUser } from "@/services/login";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginUser({ usuario, contrasena });
    if (result.success) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-black text-white lg:grid-cols-2">
      <section className="flex items-center justify-center bg-black px-6 py-12 sm:px-10">
        <div className="w-full max-w-[420px] rounded-[28px] border border-white/[0.07] bg-[oklch(0.13_0_0)] p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)_inset] sm:p-10">
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-[1.75rem]">
              Bienvenido
            </h1>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-neutral-400">
              Ingresa tus credenciales para acceder a tu cuenta.
            </p>
          </header>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="block text-[0.8125rem] font-semibold tracking-wide text-white">
                Usuario
              </Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="h-12 rounded-full border border-white/10 bg-[oklch(0.17_0_0)] px-5 text-[0.9375rem] text-white placeholder:text-neutral-500 transition focus-visible:border-[#10b981] focus-visible:ring-0 focus-visible:shadow-[0_0_24px_rgba(16,185,129,0.45)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contrasena" className="block text-[0.8125rem] font-semibold tracking-wide text-white">
                Contraseña
              </Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="h-12 rounded-full border border-white/10 bg-[oklch(0.17_0_0)] px-5 text-[0.9375rem] text-white placeholder:text-neutral-500 transition focus-visible:border-[#10b981] focus-visible:ring-0 focus-visible:shadow-[0_0_24px_rgba(16,185,129,0.45)]"
              />
            </div>

            <Button type="submit" variant="login" size="auth" className="mt-2">
              Ingresar
            </Button>
          </form>

          <div className="mt-7 space-y-5">
            <div className="text-center">
              <p className="text-[0.8125rem] font-semibold text-white">¿No tenés cuenta?</p>
              <Button
                variant="register"
                size="lg"
                className="mt-2 h-12 w-full rounded-full border-2 border-[#10b981] bg-transparent text-[0.9375rem] font-semibold text-[#10b981] transition hover:bg-[#10b981]/10"
                onClick={() => router.push("/register")}
              >
                Registrate
              </Button>
            </div>

            <div className="text-center">
              <p className="text-[0.8125rem] font-semibold text-white">¿Te olvidaste tu contraseña?</p>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="mt-2 h-12 w-full rounded-full bg-[oklch(0.22_0_0)] text-[0.9375rem] font-medium text-neutral-200 transition hover:bg-[oklch(0.26_0_0)] hover:text-white"
              >
                Recuperá tu contraseña
              </button>
            </div>
          </div>
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
