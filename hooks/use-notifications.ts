"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  type Notification,
} from "@/services/notifications";

// Polling simple hasta que el backend exponga push (WebSocket / SSE).
const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      if (!mountedRef.current) return;
      setItems(res.items);
      setUnreadCount(res.unreadCount);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "unknown");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await apiMarkAsRead(id);
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const markAllAsRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await apiMarkAllAsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  return {
    items,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
