// Backend-ready registration service
// Replace these mock functions with real API calls when connecting the backend

import { maskEmail } from "@/lib/utils";

export interface RegisterData {
  usuario: string; // CUIT/CUIL/DNI
  nombre: string;
  mail: string;
  contrasena: string;
}

export interface RegisterResult {
  success: boolean;
  /**
   * Mail enmascarado al que se envió el correo de validación
   * (p.ej. `myr***@hotmail.com`). Presente sólo cuando `success === true`.
   */
  maskedMail?: string;
  error?: "duplicate_user" | "duplicate_mail" | "duplicate_both" | "unknown";
}

/**
 * Simulates registration — replace with real backend call.
 * Should POST to your API endpoint and handle:
 * - 201: success
 * - 409: duplicate user/mail (check response body for which field)
 * - 4xx/5xx: unknown error
 */
export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  // TODO: Replace with actual API call
  // Example:
  // const res = await fetch('/api/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (res.status === 201) {
  //   const body = await res.json();
  //   return { success: true, maskedMail: body.maskedMail };
  // }
  // if (res.status === 409) {
  //   const body = await res.json();
  //   return { success: false, error: body.error };
  // }
  // return { success: false, error: 'unknown' };

  // Mock: always succeeds. Devolvemos el mail enmascarado a partir del mail enviado.
  return new Promise((resolve) => {
    setTimeout(
      () => resolve({ success: true, maskedMail: maskEmail(data.mail) }),
      800
    );
  });
}
