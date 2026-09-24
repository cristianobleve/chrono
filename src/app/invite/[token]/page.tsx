"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, UserCheck, LogOut, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type InvitePreview = {
  valid: boolean;
  invitation: {
    id: string;
    role: string;
    email: string;
    expires_at: string;
  };
  workspace: {
    id: string;
    name: string;
    slug?: string;
    icon?: string;
    icon_bg?: string;
    icon_color?: string;
  };
  inviter: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
};

export default function WorkspaceInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setCurrentUserEmail(session?.user?.email?.toLowerCase() || null);
        }

        const res = await fetch(`/api/workspace/invites?preview_token=${encodeURIComponent(params.token)}`);
        const json = await res.json();

        if (!res.ok) {
          if (isMounted) {
            setError(json.error || "Questo invito non è valido o è scaduto.");
          }
          return;
        }

        if (isMounted) {
          setPreview(json);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Errore di connessione durante la verifica dell'invito.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (params.token) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [params.token]);

  const handleAccept = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?next=/invite/${encodeURIComponent(params.token)}`);
        return;
      }

      const response = await fetch("/api/workspace/invites", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: params.token }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Impossibile accettare l'invito.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Invito accettato con successo. Accesso al workspace completato.");
      setTimeout(() => {
        window.location.assign("/projects");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Errore durante l'accettazione dell'invito.");
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?next=/invite/${encodeURIComponent(params.token)}`);
        return;
      }

      const response = await fetch("/api/workspace/invites", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "reject", token: params.token }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Impossibile rifiutare l'invito.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Hai rifiutato l'invito al workspace.");
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Errore durante il rifiuto dell'invito.");
      setSubmitting(false);
    }
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    window.location.assign(`/login?next=/invite/${encodeURIComponent(params.token)}`);
  };

  const isEmailMatching = preview && currentUserEmail
    ? preview.invitation.email.toLowerCase() === currentUserEmail.toLowerCase()
    : false;

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 selection:bg-zinc-800">
      <div className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#0c0d0e] p-7 shadow-[0_24px_50px_rgba(0,0,0,0.95)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            <p className="text-xs text-zinc-500">Verifica invito in corso...</p>
          </div>
        ) : error && !preview ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-base font-semibold text-white">Invito non valido</h1>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{error}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors text-center"
              >
                Accedi a Chrono
              </Link>
            </div>
          </div>
        ) : successMessage ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-base font-semibold text-white">Operazione completata</h1>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{successMessage}</p>
            <button
              type="button"
              onClick={() => window.location.assign("/projects")}
              className="mt-6 w-full rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
            >
              Apri i Progetti
            </button>
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-5">
            {/* Workspace & Inviter Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 font-bold text-sm text-white"
                  style={{
                    backgroundColor: preview.workspace.icon_bg || "#18181b",
                    color: preview.workspace.icon_color || "#ffffff",
                  }}
                >
                  {preview.workspace.icon && preview.workspace.icon !== "chrono"
                    ? preview.workspace.icon.slice(0, 2).toUpperCase()
                    : preview.workspace.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Invito di team</span>
                  </div>
                  <h1 className="text-base font-semibold text-white truncate leading-tight mt-0.5">
                    {preview.workspace.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Details Box */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-zinc-500">Invitato da</span>
                <span className="font-medium text-white">{preview.inviter.name || "Membro del team"}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-zinc-500">Ruolo assegnato</span>
                <span className="font-medium text-white capitalize">{preview.invitation.role}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-zinc-500">Email destinatario</span>
                <span className="font-mono text-[11px] text-zinc-300">{preview.invitation.email}</span>
              </div>
            </div>

            {/* Account state info */}
            {currentUserEmail ? (
              isEmailMatching ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                  <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Sei collegato con l'indirizzo email corretto ({currentUserEmail}).</span>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <p className="leading-relaxed">
                      Sei collegato come <strong className="text-white">{currentUserEmail}</strong>, ma l'invito è indirizzato a <strong className="text-white">{preview.invitation.email}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer mt-1"
                  >
                    <LogOut className="h-3 w-3" />
                    Cambia account
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-zinc-900/30 p-3 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-300" />
                <span>Accedi o registrati con l'email <strong>{preview.invitation.email}</strong> per accettare l'invito.</span>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {currentUserEmail ? (
                isEmailMatching ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={submitting}
                      className="w-1/3 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                    >
                      Rifiuta
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={submitting}
                      className="w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Accettazione...
                        </>
                      ) : (
                        <>
                          Accetta invito
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
                  >
                    Accedi con {preview.invitation.email}
                  </button>
                )
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/login?next=/invite/${encodeURIComponent(params.token)}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
                  >
                    Accedi per accettare
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/signup?next=/invite/${encodeURIComponent(params.token)}`}
                    className="w-full text-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    Crea un nuovo account
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}