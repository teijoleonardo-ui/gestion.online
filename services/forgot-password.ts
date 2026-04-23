// Backend-ready forgot-password service
// Replace the mock implementation with a real API call when integrating the backend.

import { maskEmail } from "@/lib/utils";

export interface ForgotPasswordData {
  usuario: string; // CUIT / CUIL / DNI
}

export interface ForgotPasswordResult {
  success: boolean;
  /**
   * Correo enmascarado asociado al usuario (p.ej. `myr***@hotmail.com`).
   * Lo devuelve el backend al encontrar al usuario en la base de datos.
   * Presente sólo cuando `success === true`.
   */
  maskedMail?: string;
  error?: "user_not_found" | "unknown";
}

/**
 * Simulates the "forgot password" request.
 * Expected backend contract:
 *  - 200: success — body: { maskedMail: "myr***@hotmail.com" }
 *         (el server busca el usuario en la DB y devuelve el mail enmascarado).
 *  - 404: user_not_found
 *  - 4xx/5xx: unknown
 */
export async function requestPasswordReset(
  _data: ForgotPasswordData
): Promise<ForgotPasswordResult> {
  // TODO: Replace with actual API call.
  // Example:
  //   const res = await fetch('/api/forgot-password', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(_data),
  //   });
  //   if (res.ok) {
  //     const body = await res.json();
  //     return { success: true, maskedMail: body.maskedMail };
  //   }
  //   if (res.status === 404) return { success: false, error: 'user_not_found' };
  //   return { success: false, error: 'unknown' };

  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          success: true,
          maskedMail: maskEmail("myriam@hotmail.com"),
        }),
      600
    );
  });
}
