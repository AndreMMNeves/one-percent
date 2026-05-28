"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { messages } from "@/lib/tone";
import { todayISO } from "@/lib/utils";

interface Toast {
  id: string;
  text: string;
}

export function NotificationsHost() {
  const profile = useStore((s) => s.profile);
  const logs = useStore((s) => s.logs);
  const lastNotificationAt = useStore((s) => s.lastNotificationAt);
  const markNotificationShown = useStore((s) => s.markNotificationShown);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Focus-loss notification: if no log today and last shown >6h
  useEffect(() => {
    if (!profile) return;
    const today = todayISO();
    const loggedToday = logs.some((l) => l.date === today);
    if (loggedToday) return;

    const last = lastNotificationAt ? new Date(lastNotificationAt).getTime() : 0;
    const sixHours = 6 * 60 * 60 * 1000;
    if (Date.now() - last < sixHours) return;

    const t = setTimeout(() => {
      setToasts((arr) => [
        ...arr,
        {
          id: `t_${Date.now()}`,
          text: messages(profile.tone).missedDay,
        },
      ]);
      markNotificationShown();
    }, 4000);
    return () => clearTimeout(t);
  }, [profile, logs, lastNotificationAt, markNotificationShown]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="card animate-slide-up flex items-start gap-3 border-accent/30"
        >
          <Bell className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">{t.text}</div>
          <button
            onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))}
            className="text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
