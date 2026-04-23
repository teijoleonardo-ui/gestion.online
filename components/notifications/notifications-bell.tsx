"use client";

import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import type {
  Notification,
  NotificationType,
} from "@/services/notifications";

type TypeVisual = {
  icon: LucideIcon;
  color: string;
  bg: string;
  ring: string;
};

const typeConfig: Record<NotificationType, TypeVisual> = {
  agenda_verification_sent: {
    icon: Mail,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    ring: "ring-amber-400/30",
  },
  agenda_verified: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-400/30",
  },
  payment_applied: {
    icon: CreditCard,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    ring: "ring-blue-400/30",
  },
  info: {
    icon: Info,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    ring: "ring-violet-400/30",
  },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-AR");
}

export function NotificationsBell() {
  const { items, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notificaciones${
            unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""
          }`}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-emerald-500 px-1 text-[10px] font-bold leading-none text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] border-white/10 bg-card p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">Notificaciones</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Estás al día"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Lista */}
        <ScrollArea className="max-h-[420px]">
          {loading && items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              Cargando...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No tenés notificaciones
              </p>
              <p className="text-xs text-muted-foreground">
                Aquí aparecerán los movimientos de tu cuenta.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={() => markAsRead(n.id)}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const cfg = typeConfig[notification.type] ?? typeConfig.info;
  const Icon = cfg.icon;

  const body = (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
          cfg.bg,
          cfg.ring
        )}
      >
        <Icon className={cn("h-4 w-4", cfg.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              notification.read
                ? "font-medium text-muted-foreground"
                : "font-semibold text-foreground"
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400"
            />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {notification.description}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/70">
            {relativeTime(notification.createdAt)}
          </span>
          {!notification.read && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRead();
              }}
              className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-emerald-400"
            >
              <Check className="h-3 w-3" />
              Marcar leída
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const wrapperCls = cn(
    "block w-full text-left transition-colors hover:bg-secondary/30",
    !notification.read && "bg-emerald-500/[0.04]"
  );

  if (notification.actionUrl) {
    return (
      <li>
        <Link
          href={notification.actionUrl}
          className={wrapperCls}
          onClick={() => {
            if (!notification.read) onRead();
          }}
        >
          {body}
        </Link>
      </li>
    );
  }

  return <li className={wrapperCls}>{body}</li>;
}
