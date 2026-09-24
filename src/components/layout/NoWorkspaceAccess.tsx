"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Check, Mail, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/i18n";
import { LinearSelect } from "@/components/ui/LinearSelect";

const REGION_OPTIONS = [
  { value: "European Union", label: "European Union (Frankfurt)" },
  { value: "United States", label: "United States (N. Virginia)" },
];

type PendingInvite = {
  id: string;
  workspace_id: string;
  role: string;
  workspace_name?: string;
};

export const NoWorkspaceAccess: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, createWorkspace, pullFromSupabase, addToast } = useLinearStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("European Union");
  const [includeDemoData, setIncludeDemoData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const checkPendingInvites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const rawInvites = data.pending_invitations || [];

      const mapped: PendingInvite[] = rawInvites.map((inv: any) => {
        const notif = (data.notifications || []).find(
          (n: any) => n.metadata?.invitation_id === inv.id || n.workspace_id === inv.workspace_id
        );
        return {
          id: inv.id,
          workspace_id: inv.workspace_id,
          role: inv.role,
          workspace_name: notif ? notif.title.replace(/^Invito a\s+/i, "") : "Workspace",
        };
      });

      setPendingInvites(mapped);
    } catch (err) {
      console.error("[NoWorkspaceAccess] Error checking invites:", err);
    }
  };

  useEffect(() => {
    void checkPendingInvites();

    const handleRealtimeUpdate = () => {
      void checkPendingInvites();
      void pullFromSupabase();
    };

    window.addEventListener("chrono:invitations-changed", handleRealtimeUpdate);
    window.addEventListener("chrono:members-changed", handleRealtimeUpdate);
    window.addEventListener("chrono:notifications-changed", handleRealtimeUpdate);

    return () => {
      window.removeEventListener("chrono:invitations-changed", handleRealtimeUpdate);
      window.removeEventListener("chrono:members-changed", handleRealtimeUpdate);
      window.removeEventListener("chrono:notifications-changed", handleRealtimeUpdate);
    };
  }, [pullFromSupabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = createWorkspace(
        {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          region,
          plan: "Pro",
        },
        includeDemoData
      );

      addToast({
        title: "Workspace pronto",
        description: `Benvenuto in ${created.name}.`,
        type: "success",
      });
    } catch (err: any) {
      addToast({
        title: "Errore creazione",
        description: err?.message || "Impossibile creare il workspace.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvite = async (invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/workspace/invites", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ invitation_id: invitationId }),
      });

      const json = await res.json();
      if (!res.ok) {
        addToast({
          title: "Errore accettazione",
          description: json.error || "Impossibile accettare l'invito.",
          type: "error",
        });
        return;
      }

      addToast({
        title: "Invito accettato",
        description: "Accesso al workspace completato.",
        type: "success",
      });

      await pullFromSupabase();
      window.location.reload();
    } catch (err: any) {
      addToast({
        title: "Errore di rete",
        description: err?.message || "Riprova tra poco.",
        type: "error",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  const userEmail = currentUser.email || currentUser.name || "utente";

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#08090a] text-white select-none">
      {/* Top Header */}
      <header className="w-full h-16 px-6 md:px-10 flex items-center justify-between text-xs text-zinc-400 border-b border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnetti</span>
        </button>

        <div className="text-zinc-500 text-[11px] font-mono">
          Logged in as <span className="text-zinc-300 font-medium">{userEmail}</span>
        </div>
      </header>

      {/* Main Content Form (Linear-like centered layout) */}
      <main className="flex-1 w-full max-w-[460px] mx-auto px-6 py-12 flex flex-col justify-center animate-fade-in">
        <div className="flex flex-col gap-1 mb-8 text-left">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Create a workspace
          </h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Move work forward across teams and agents
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-zinc-400">
              Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="h-10 px-3.5 rounded-lg bg-[#141518] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* URL Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-zinc-400">
              URL
            </label>
            <div className="h-10 px-3.5 rounded-lg bg-[#141518] border border-white/10 flex items-center text-sm text-zinc-500 focus-within:border-white/30 transition-colors">
              <span className="shrink-0 select-none text-zinc-500 font-mono text-xs">
                chrono.engineering/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none pl-1"
              />
            </div>
          </div>

          {/* Region Field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-zinc-400">
              Region
            </label>
            <LinearSelect
              size="lg"
              fullWidth
              value={region}
              onChange={setRegion}
              options={REGION_OPTIONS}
            />
          </div>

          {/* Starter Showcase Demo Data Option */}
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-white/5 bg-[#121316]/50 hover:bg-[#121316] transition-colors cursor-pointer select-none text-left">
            <input
              type="checkbox"
              checked={includeDemoData}
              onChange={(e) => setIncludeDemoData(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-zinc-900 text-white focus:ring-0 cursor-pointer accent-white"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Includi dati dimostrativi (Nebula Core)
              </span>
              <span className="text-[11px] text-zinc-400 leading-normal">
                Carica il progetto showcase con milestone, roadmap e issue per iniziare subito.
              </span>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full h-10 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs transition-all shadow-md active:scale-[0.99] cursor-pointer mt-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span>Create workspace</span>
            )}
          </button>
        </form>

        {/* Pending Invites Section */}
        {pendingInvites.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
            <span className="text-[11px] font-semibold text-zinc-400 text-left uppercase tracking-wider">
              Inviti ricevuti per il tuo account
            </span>
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="w-full rounded-lg border border-white/10 bg-[#121316] p-3 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate leading-tight">
                      {inv.workspace_name}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono capitalize">
                      Ruolo: {inv.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={acceptingId === inv.id}
                  onClick={() => handleAcceptInvite(inv.id)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-md bg-white hover:bg-zinc-200 text-black px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {acceptingId === inv.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Accetta
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer minimal info */}
      <footer className="w-full h-12 flex items-center justify-center text-[11px] text-zinc-600">
        Chrono Platform &middot; Fast, keyboard-first issue tracking
      </footer>
    </div>
  );
};
