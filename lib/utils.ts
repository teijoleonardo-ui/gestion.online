import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Enmascara un mail para mostrarlo en pantalla.
 * Ejemplos:
 *   myriam@hotmail.com  -> myr***@hotmail.com
 *   ab@dominio.com      -> a***@dominio.com
 *   a@dominio.com       -> ***@dominio.com
 * Si el valor no es un mail válido, lo devuelve sin cambios.
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return ''
  const atIndex = email.lastIndexOf('@')
  if (atIndex <= 0) return email
  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const visible = local.length >= 3 ? local.slice(0, 3) : local.slice(0, Math.max(0, local.length - 1))
  return `${visible}***${domain}`
}
