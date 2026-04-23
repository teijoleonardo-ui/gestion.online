// Backend-ready change-password service.
// Reemplazar la implementación mock por un fetch real cuando se enchufe el
// backend. El contrato esperado está documentado abajo.

export interface ChangePasswordData {
  /** Contraseña actual del usuario (para reautenticar). */
  current: string;
  /** Nueva contraseña (debería validarse en el servidor, no sólo en el cliente). */
  next: string;
}

export type ChangePasswordError =
  | "wrong_current"
  | "same_as_current"
  | "weak_password"
  | "unauthorized"
  | "unknown";

export interface ChangePasswordResult {
  success: boolean;
  error?: ChangePasswordError;
}

/**
 * Simula la llamada al backend para cambiar la contraseña del usuario logueado.
 *
 * Contrato esperado:
 *   POST /api/me/password
 *     body: { current: string, next: string }
 *     respuestas:
 *       200 OK                 → success
 *       401 Unauthorized       → sesión vencida (`unauthorized`)
 *       403 Forbidden          → contraseña actual incorrecta (`wrong_current`)
 *       409 Conflict           → la nueva == la actual (`same_as_current`)
 *       422 Unprocessable Ent. → no cumple política de fuerza (`weak_password`)
 *       5xx                    → error desconocido (`unknown`)
 */
export async function changePassword(
  data: ChangePasswordData,
): Promise<ChangePasswordResult> {
  // TODO: reemplazar por el fetch real.
  // Example:
  //   const res = await fetch("/api/me/password", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include",
  //     body: JSON.stringify(data),
  //   });
  //   if (res.ok) return { success: true };
  //   if (res.status === 401) return { success: false, error: "unauthorized" };
  //   if (res.status === 403) return { success: false, error: "wrong_current" };
  //   if (res.status === 409) return { success: false, error: "same_as_current" };
  //   if (res.status === 422) return { success: false, error: "weak_password" };
  //   return { success: false, error: "unknown" };

  return new Promise((resolve) => {
    setTimeout(() => {
      // El mock sólo detecta "misma contraseña" para permitir probar ese flujo.
      if (data.current && data.current === data.next) {
        resolve({ success: false, error: "same_as_current" });
        return;
      }
      resolve({ success: true });
    }, 700);
  });
}
