"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { X, UserPlus, User as UserIcon, Check, Copy, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const NewAccountModal: React.FC = () => {
  const { activeModal, setActiveModal, workspace, addToast } = useLinearStore();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "guest">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (activeModal !== "new_account") return null;

  const handleClose = () => {
    setActiveModal(null);
    setEmail("");
    setRole("member");
    setCreatedInvite(null);
    setCopied(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        addToast({ title: "Autenticazione richiesta", description: "Accedi per invitare un membro.", type: "error" });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/workspace/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ workspace_id: workspace.id, email: email.trim(), role }),
      });
      const result = await response.json();

      if (!response.ok) {
        addToast({ title: "Invito non creato", description: result.error || "Impossibile creare l'invito.", type: "error" });
        setIsSubmitting(false);
        return;
      }

      const invitationLink = `${window.location.origin}/invite/${result.token}`;
      setCreatedInvite({ email: email.trim(), link: invitationLink });
      addToast({ title: "Invito generato", description: "L'invito è pronto per essere condiviso.", type: "success" });
    } catch (err: any) {
      addToast({ title: "Errore di rete", description: err?.message || "Impossibile inviare la richiesta.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdInvite) return;
    try {
      await navigator.clipboard.writeText(createdInvite.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ title: "Link copiato", description: "Il link di invito è negli appunti.", type: "info" });
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForAnother = () => {
    setEmail("");
    setRole("member");
    setCreatedInvite(null);
    setCopied(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[4px] flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] bg-[#0c0d0e] border border-white/10 rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">
              {createdInvite ? "Invito Creato" : "Invita Membro"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {createdInvite ? (
          <div className="p-6 flex flex-col gap-4 text-xs">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Invito registrato per <strong>{createdInvite.email}</strong>.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Link di invito
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInvite.link}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-white font-mono text-[11px] focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiato" : "Copia"}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-white/5">
              Se l'utente è già registrato su Chrono, riceverà la notifica nel suo centro notifiche e potrà accettare con un click. Se non è registrato, inviagli questo link per accedere o creare un account.
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                Invita un altro
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 text-xs">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-3 text-xs text-zinc-400">
              <UserIcon className="h-4 w-4 shrink-0" />
              <span>Il membro completerà nome e profilo quando accetterà l'invito.</span>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="nome@azienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-white/30 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Role selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Ruolo nel Workspace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "member" as const,
                    name: "Associato",
                    desc: "Collaboratore",
                    disabled: false,
                  },
                  {
                    id: "admin" as const,
                    name: "Admin",
                    desc: "Gestione associati",
                    disabled: workspace?.role !== "owner",
                  },
                  {
                    id: "guest" as const,
                    name: "Ospite",
                    desc: "Sola lettura",
                    disabled: false,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => setRole(item.id)}
                    className={cn(
                      "p-2.5 rounded-xl border flex flex-col gap-0.5 text-left transition-all",
                      item.disabled
                        ? "opacity-35 cursor-not-allowed bg-zinc-900/30 border-white/5"
                        : "cursor-pointer",
                      role === item.id && !item.disabled
                        ? "bg-white/10 border-white/30 text-white shadow-sm"
                        : !item.disabled && "bg-zinc-900/60 hover:bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                    )}
                    title={item.disabled ? "Solo l'Owner può assegnare il ruolo di Amministratore" : undefined}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">{item.name}</span>
                      {role === item.id && !item.disabled && (
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{item.desc}</span>
                  </button>
                ))}
              </div>
              {workspace?.role === "admin" && (
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  Come Amministratore puoi invitare Associati o Ospiti. Solo l'Owner può nominare altri Admin.
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-black text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    Crea Invito
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
