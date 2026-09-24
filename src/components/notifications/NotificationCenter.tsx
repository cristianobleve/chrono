"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Check, X, Loader2, Mail, Inbox, ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLinearStore } from "@/store/useLinearStore";
import { useTranslation } from "@/i18n";
import type { TranslationDictionary } from "@/i18n";

type NotificationItem = {
  id: string;
  type?: string;
  title: string;
  body?: string | null;
  href?: string | null;
  metadata?: {
    invitation_id?: string;
    workspace_id?: string;
    role?: string;
    token?: string;
  } | null;
  read_at?: string | null;
  created_at: string;
};

function formatRelativeTime(dateString: string, t: TranslationDictionary["notifications"], lang: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return t.justNow;
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return t.yesterday;
    if (diffDays < 7) return `${diffDays}d`;
    const localeMap: Record<string, string> = {
      it: "it-IT",
      en: "en-US",
      de: "de-DE",
      fr: "fr-FR",
      es: "es-ES",
      ru: "ru-RU",
    };
    return date.toLocaleDateString(localeMap[lang] || "en-US", { day: "numeric", month: "short" });
  } catch {
    return dateString;
  }
}

export function NotificationCenter() {
  const { t, lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const pullFromSupabase = useLinearStore((s) => s.pullFromSupabase);
  const addToast = useLinearStore((s) => s.addToast);

  const load = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch (err) {
      console.error("[Notifications] Load error:", err);
    }
  };

  useEffect(() => {
    void load();

    const handleRealtime = () => {
      void load();
    };

    window.addEventListener("chrono:notifications-changed", handleRealtime);
    window.addEventListener("chrono:invitations-changed", handleRealtime);
    const timer = window.setInterval(() => void load(), 15000);

    return () => {
      window.removeEventListener("chrono:notifications-changed", handleRealtime);
      window.removeEventListener("chrono:invitations-changed", handleRealtime);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const markAllRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ all: true }),
    });
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
    setUnread(0);
  };

  const handleInviteAction = async (item: NotificationItem, action: "accept" | "reject") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setActionLoadingId(item.id);
    try {
      const payload: any = {
        action: action === "reject" ? "reject" : "accept",
      };
      if (item.metadata?.token) {
        payload.token = item.metadata.token;
      } else if (item.metadata?.invitation_id) {
        payload.invitation_id = item.metadata.invitation_id;
      } else {
        const hrefToken = item.href?.startsWith("/invite/") ? item.href.replace("/invite/", "") : null;
        if (hrefToken) payload.token = hrefToken;
      }

      const res = await fetch("/api/workspace/invites", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({
          title: "Azione non riuscita",
          description: data.error || "Impossibile elaborare l'invito.",
          type: "error",
        });
        return;
      }

      addToast({
        title: action === "accept" ? "Invito accettato" : "Invito rifiutato",
        description: action === "accept" ? "Il workspace è stato aggiunto al tuo account." : "L'invito è stato rimosso.",
        type: "success",
      });

      setItems((current) =>
        current.map((it) => (it.id === item.id ? { ...it, read_at: new Date().toISOString() } : it))
      );
      setUnread((u) => Math.max(0, u - 1));

      if (action === "accept") {
        await pullFromSupabase();
      }
    } catch (err: any) {
      addToast({
        title: "Errore di connessione",
        description: err?.message || "Riprova tra poco.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = tab === "unread" ? items.filter((it) => !it.read_at) : items;

  return (
    <div className="relative" ref={ref}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void load();
        }}
        className="relative flex h-8 w-8 items-center justify-center rounded-[6px] border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white transition-colors"
        title={t.notifications.title}
        aria-label={t.notifications.title}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black font-mono shadow-sm">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Vercel-Style Popover */}
      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-[390px] sm:w-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#000000] text-white shadow-[0_24px_60px_rgba(0,0,0,0.95)] animate-slide-up select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-zinc-950/60">
            {/* Segmented Tabs (Vercel Style) */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`px-2.5 py-1 text-xs rounded-[6px] transition-colors ${
                  tab === "all"
                    ? "bg-white/10 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.notifications.all}
              </button>
              <button
                type="button"
                onClick={() => setTab("unread")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[6px] transition-colors ${
                  tab === "unread"
                    ? "bg-white/10 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{t.notifications.unread}</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">
                    {unread}
                  </span>
                )}
              </button>
            </div>

            {/* Mark as read */}
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>{t.notifications.markAllRead}</span>
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 mb-2.5">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-300">
                  {tab === "unread" ? t.notifications.noUnread : t.notifications.noNotifications}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isInvite = item.type === "workspace_invitation" && !item.read_at;
                const isLoadingThis = actionLoadingId === item.id;
                const isUnread = !item.read_at;

                return (
                  <div
                    key={item.id}
                    className={`group px-4 py-3.5 transition-colors hover:bg-white/[0.03] ${
                      isUnread ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread dot or icon */}
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                        {isUnread ? (
                          <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-semibold text-zinc-100 truncate leading-tight">
                            {item.title}
                          </p>
                          <time className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {formatRelativeTime(item.created_at, t.notifications, lang)}
                          </time>
                        </div>

                        {item.body && (
                          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                            {item.body}
                          </p>
                        )}

                        {/* Interactive Invite Action Buttons (Vercel Style) */}
                        {isInvite && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isLoadingThis}
                              onClick={() => handleInviteAction(item, "accept")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {isLoadingThis ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              )}
                              {t.notifications.accept}
                            </button>
                            <button
                              type="button"
                              disabled={isLoadingThis}
                              onClick={() => handleInviteAction(item, "reject")}
                              className="rounded-lg border border-white/10 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {t.notifications.decline}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer (Vercel Style) */}
          <div className="border-t border-white/10 bg-zinc-950/80 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Chrono Notifiche</span>
            <Link
              href="/settings/members"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <span>Membri e inviti</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}