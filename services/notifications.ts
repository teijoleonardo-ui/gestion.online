// Backend-ready notifications service.
// Las notificaciones son creadas por el backend cuando ocurre un "evento
// de negocio" (ver `NotificationType`). El front sólo las consume.
//
// ── Contrato de endpoints esperado (backend) ─────────────────────────
//   GET   /api/notifications
//       Devuelve las notificaciones del usuario autenticado.
//       200 → { items: Notification[]; unreadCount: number }
//
//   POST  /api/notifications/:id/read
//       Marca una notificación como leída.
//       200 → { success: true }
//
//   POST  /api/notifications/read-all
//       Marca todas como leídas.
//       200 → { success: true }
//
// ── Eventos que disparan una notificación (lado backend) ─────────────
//   1) AGENDA_VERIFICATION_SENT
//      Se dispara cuando el cliente registra un mail en su agenda y
//      nuestro servidor envía el correo con el botón "Validar".
//      Payload: { agendaId, email, expiresAt? }
//      Texto sugerido:
//         title:       "Validá tu agenda"
//         description: "Te enviamos un correo a <email>. Hacé clic en
//                       el botón 'Validar' dentro del mail para
//                       confirmarla."
//
//   2) AGENDA_VERIFIED
//      Se dispara cuando el cliente clickea el link de validación.
//      Payload: { agendaId, email }
//      Texto sugerido:
//         title:       "Agenda validada"
//         description: "Tu agenda <email> fue validada correctamente."
//
//   3) PAYMENT_APPLIED
//      Se dispara cuando el sistema marca el pago como aplicado.
//      Payload: { paymentId, amount, currency, contratanteSigla, bls? }
//      Texto sugerido:
//         title:       "Pago aplicado"
//         description: "Tu pago de <currency> <amount> a <contratante>
//                       fue aplicado correctamente."
//
// Para cambiar del mock al backend real basta con poner USE_MOCK=false
// (o controlarlo vía una env var, p.ej. NEXT_PUBLIC_NOTIFICATIONS_MOCK).

export type NotificationType =
  | "agenda_verification_sent"
  | "agenda_verified"
  | "payment_applied"
  | "info";

export interface NotificationBase {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** ISO-8601 timestamp generado por el backend. */
  createdAt: string;
  read: boolean;
  /** URL opcional a la que lleva el item al hacer click. */
  actionUrl?: string;
  /** Texto opcional para el CTA (si la UI quiere mostrarlo). */
  actionLabel?: string;
}

export interface AgendaVerificationSentNotification extends NotificationBase {
  type: "agenda_verification_sent";
  payload: {
    agendaId: string;
    email: string;
    expiresAt?: string;
  };
}

export interface AgendaVerifiedNotification extends NotificationBase {
  type: "agenda_verified";
  payload: {
    agendaId: string;
    email: string;
  };
}

export interface PaymentAppliedNotification extends NotificationBase {
  type: "payment_applied";
  payload: {
    paymentId: string;
    amount: number;
    currency: "ARS" | "USD";
    contratanteSigla: string;
    bls?: string[];
  };
}

export interface InfoNotification extends NotificationBase {
  type: "info";
  payload?: Record<string, unknown>;
}

export type Notification =
  | AgendaVerificationSentNotification
  | AgendaVerifiedNotification
  | PaymentAppliedNotification
  | InfoNotification;

export interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
}

// ─── Toggle mock/real ────────────────────────────────────────────────
// Cuando el backend esté listo, cambiar a `false` (o leer de env).
const USE_MOCK = true;

// ─── API pública ──────────────────────────────────────────────────────
export async function fetchNotifications(): Promise<NotificationsResponse> {
  if (USE_MOCK) return mockFetchNotifications();

  const res = await fetch("/api/notifications", { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchNotifications failed: ${res.status}`);
  return (await res.json()) as NotificationsResponse;
}

export async function markAsRead(id: string): Promise<void> {
  if (USE_MOCK) return mockMarkAsRead(id);

  const res = await fetch(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`markAsRead failed: ${res.status}`);
}

export async function markAllAsRead(): Promise<void> {
  if (USE_MOCK) return mockMarkAllAsRead();

  const res = await fetch("/api/notifications/read-all", { method: "POST" });
  if (!res.ok) throw new Error(`markAllAsRead failed: ${res.status}`);
}

// ─── Mock store ──────────────────────────────────────────────────────
// Datos de ejemplo para desarrollo local. Se ignora cuando USE_MOCK=false.

let mockStore: Notification[] | null = null;

function now(offsetMinutes = 0): string {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
}

function seedMockStore(): void {
  mockStore = [
    {
      id: "n1",
      type: "agenda_verification_sent",
      title: "Validá tu agenda",
      description:
        "Te enviamos un correo a juanperez@empresa.com. Hacé clic en el botón 'Validar' dentro del mail para confirmar la agenda.",
      createdAt: now(5),
      read: false,
      actionUrl: "/dashboard/agendas",
      actionLabel: "Ver agendas",
      payload: {
        agendaId: "agenda-001",
        email: "juanperez@empresa.com",
      },
    },
    {
      id: "n2",
      type: "payment_applied",
      title: "Pago aplicado",
      description:
        "Tu pago de USD 1.245,00 a APC fue aplicado correctamente.",
      createdAt: now(120),
      read: false,
      actionUrl: "/dashboard/mis-gestiones",
      actionLabel: "Ver gestiones",
      payload: {
        paymentId: "pay-9421",
        amount: 1245,
        currency: "USD",
        contratanteSigla: "APC",
      },
    },
  ];
}

async function mockFetchNotifications(): Promise<NotificationsResponse> {
  if (!mockStore) seedMockStore();
  await wait(250);
  const items = [...(mockStore ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const unreadCount = items.filter((n) => !n.read).length;
  return { items, unreadCount };
}

async function mockMarkAsRead(id: string): Promise<void> {
  if (!mockStore) seedMockStore();
  const n = mockStore!.find((x) => x.id === id);
  if (n) n.read = true;
  await wait(120);
}

async function mockMarkAllAsRead(): Promise<void> {
  if (!mockStore) seedMockStore();
  mockStore!.forEach((n) => (n.read = true));
  await wait(120);
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Helper opcional para probar desde la consola:
//   window.__pushNotification({ type: 'payment_applied', title: '...', description: '...', payload: {...} })
// Se inyecta sólo cuando el mock está activo y en cliente.
if (typeof window !== "undefined" && USE_MOCK) {
  (window as unknown as {
    __pushNotification?: (n: Partial<Notification>) => void;
  }).__pushNotification = (n) => {
    if (!mockStore) seedMockStore();
    mockStore!.unshift({
      id: `n${Date.now()}`,
      type: "info",
      title: "Nuevo movimiento",
      description: "",
      createdAt: new Date().toISOString(),
      read: false,
      ...(n as Notification),
    } as Notification);
  };
}
