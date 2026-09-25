"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Check, Mail, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/i18n";

type PendingInvite = {
  id: string;
  workspace_id: string;
  role: string;
  workspace_name?: string;
};

export const NoWorkspaceAccess: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, pullFromSupabase, addToast } = useLinearStore();

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkPendingInvites = async () => {
    try {
      setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
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
    try {
      await supabase.auth.signOut();
    } catch (_) {}

    useLinearStore.setState({
      workspaces: [],
      workspace: {
        id: "",
        identifier: "",
        internalId: "",
        name: "",
        slug: "",
        icon: "chrono",
        iconBg: "#121419",
        iconColor: "#5e6ad2",
        plan: "Free",
        createdAt: "",
        updatedAt: "",
      },
      currentWorkspaceId: "",
      projects: [],
      issues: [],
      habits: [],
      tags: [],
      projectFolders: [],
      trash: [],
      timelineEvents: [],
      accounts: [],
      currentAccountId: "",
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chrono_app_store_v8");
        localStorage.removeItem("linear-clone-storage");
      } catch (_) {}
    }

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
          Autenticato come <span className="text-zinc-300 font-medium">{userEmail}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[480px] mx-auto px-6 py-12 flex flex-col justify-center animate-fade-in">
        {pendingInvites.length > 0 ? (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Inviti disponibili
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Sei stato invitato a collaborare nei seguenti workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="w-full rounded-lg border border-white/10 bg-[#121316] p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate leading-tight">
                        {inv.workspace_name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono capitalize mt-0.5">
                        Ruolo: {inv.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={acceptingId === inv.id}
                    onClick={() => handleAcceptInvite(inv.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-zinc-200 text-black px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {acceptingId === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Accetta invito</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <button
                type="button"
                onClick={checkPendingInvites}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Aggiorna</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#121316] text-zinc-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  In attesa di un invito
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Accesso riservato su invito
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#121316] p-4 flex flex-col gap-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Questo account non è associato ad alcun workspace attivo. Chrono richiede un invito esplicito da parte di un amministratore per accedere ai progetti e alle issue.
              </p>

              <div className="rounded-md border border-white/5 bg-black/40 px-3 py-2 text-xs font-mono text-zinc-300">
                <span className="text-zinc-500">Email: </span>
                <span>{userEmail}</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-normal">
                Quando un amministratore invierà un invito al tuo indirizzo email, la richiesta comparirà automaticamente in questa schermata per essere accettata.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={checkPendingInvites}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Verifica in corso..." : "Verifica inviti"}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>Accedi con altro account</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full h-12 flex items-center justify-center text-[11px] text-zinc-600 border-t border-white/5">
        Chrono Platform. Issue tracking e sincronizzazione su invito.
      </footer>
    </div>
  );
};
