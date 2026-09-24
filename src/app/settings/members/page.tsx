"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useLinearStore } from "@/store/useLinearStore";
import {
  UserPlus,
  Mail,
  Trash2,
  Clock3,
  Copy,
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Crown,
  Shield,
  User as UserIcon,
  Loader2,
  Check,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { InternalIdBadge } from "@/components/ui/InternalIdBadge";
import { LinearSelect } from "@/components/ui/LinearSelect";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type WorkspaceInvitation = {
  id: string;
  workspace_id: string;
  email: string;
  role: "admin" | "member" | "guest";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at?: string | null;
  accepted_by?: string | null;
  accepted_by_account?: { name: string; email: string } | null;
};

type WorkspaceMember = {
  id: string;
  account_id: string;
  role: "owner" | "admin" | "member" | "guest";
  joined_at: string;
  account: { id: string; name: string; email: string; identifier?: string; internal_id?: string; username?: string } | null;
};

const ROLE_RANKS: Record<string, number> = {
  owner: 1,
  admin: 2,
  member: 3,
  guest: 4,
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Associato",
  guest: "Ospite",
};

import { useTranslation } from "@/i18n";

export default function SettingsMembersPage() {
  const { team, workspace, currentUser, addToast } = useLinearStore();
  const { t } = useTranslation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "guest">("member");
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState<boolean | null>(null);
  const [currentRole, setCurrentRole] = useState<"owner" | "admin" | "member" | "guest">("member");
  const [createdInvitationLink, setCreatedInvitationLink] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Elimination modal state
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setLoading(false);
      setCanManage(false);
      return;
    }

    try {
      const response = await fetch(`/api/workspace/invites?workspace_id=${encodeURIComponent(workspace.id)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.status === 403) {
        const errData = await response.json().catch(() => ({}));
        setCanManage(false);
        setCurrentRole(errData.currentRole || workspace.role || "member");
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
        setMembers(data.members || []);
        setCanManage(true);
        setCurrentRole(data.currentRole || workspace.role || "owner");
      } else {
        setCanManage(false);
      }
    } catch {
      setCanManage(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    // Direct channel subscription for instant realtime on members and invites
    const channel = supabase
      .channel(`members-live-${workspace.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_invitations", filter: `workspace_id=eq.${workspace.id}` },
        () => {
          void loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_members", filter: `workspace_id=eq.${workspace.id}` },
        () => {
          void loadData();
        }
      )
      .subscribe();

    const handleGlobalUpdate = () => {
      void loadData();
    };

    window.addEventListener("chrono:invitations-changed", handleGlobalUpdate);
    window.addEventListener("chrono:members-changed", handleGlobalUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("chrono:invitations-changed", handleGlobalUpdate);
      window.removeEventListener("chrono:members-changed", handleGlobalUpdate);
    };
  }, [workspace.id]);

  // Keep inviteRole valid if current user is admin
  useEffect(() => {
    if (currentRole === "admin" && inviteRole === "admin") {
      setInviteRole("member");
    }
  }, [currentRole, inviteRole]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSendingInvite) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      addToast({ title: "Autenticazione richiesta", description: "Accedi per invitare membri al workspace.", type: "error" });
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await fetch("/api/workspace/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ workspace_id: workspace.id, email: inviteEmail.trim(), role: inviteRole }),
      });
      const result = await response.json();
      if (!response.ok) {
        addToast({ title: "Invito non creato", description: result.error || "Impossibile creare l'invito.", type: "error" });
        return;
      }
      const invitationLink = `${window.location.origin}/invite/${result.token}`;
      await navigator.clipboard?.writeText(invitationLink);
      setCreatedInvitationLink(invitationLink);
      addToast({ title: "Invito creato", description: "Il link di invito è stato copiato negli appunti.", type: "success" });
      setInviteEmail("");
      await loadData();
    } catch (err: any) {
      addToast({ title: "Errore di rete", description: err?.message || "Impossibile creare l'invito.", type: "error" });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const revokeInvitation = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const response = await fetch("/api/workspace/invites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id, workspace_id: workspace.id }),
    });
    if (response.ok) {
      setInvitations((items) => items.map((item) => item.id === id ? { ...item, status: "revoked" } : item));
      addToast({ title: "Invito revocato", description: "Il link non è più utilizzabile.", type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      addToast({ title: "Operazione non riuscita", description: data.error || "Impossibile revocare l'invito.", type: "error" });
    }
  };

  const updateMemberRole = async (memberId: string, role: WorkspaceMember["role"]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const response = await fetch("/api/workspace/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: "update_member", workspace_id: workspace.id, member_id: memberId, role }),
    });
    const result = await response.json();
    if (!response.ok) {
      addToast({ title: "Ruolo non aggiornato", description: result.error || "Operazione non consentita.", type: "error" });
      return;
    }
    setMembers((items) =>
      items
        .map((item) => (item.id === memberId ? { ...item, role } : item))
        .sort((a, b) => (ROLE_RANKS[a.role] || 99) - (ROLE_RANKS[b.role] || 99))
    );
    addToast({ title: "Ruolo aggiornato", description: `Ruolo impostato su ${ROLE_LABELS[role] || role}.`, type: "success" });
  };

  const handleConfirmRemoval = async () => {
    if (!memberToRemove || isRemoving) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      addToast({ title: "Autenticazione richiesta", description: "Accedi per completare l'operazione.", type: "error" });
      return;
    }

    setIsRemoving(true);
    try {
      const response = await fetch("/api/workspace/invites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ member_id: memberToRemove.id, workspace_id: workspace.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        addToast({ title: "Membro non rimosso", description: result.error || "Operazione non consentita.", type: "error" });
        return;
      }
      setMembers((items) => items.filter((item) => item.id !== memberToRemove.id));
      addToast({ title: "Membro rimosso", description: "L'accesso al workspace è stato revocato.", type: "success" });
      setMemberToRemove(null);
    } catch (err: any) {
      addToast({ title: "Errore di connessione", description: err?.message || "Impossibile rimuovere il membro.", type: "error" });
    } finally {
      setIsRemoving(false);
    }
  };

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const rankA = ROLE_RANKS[a.role] || 99;
      const rankB = ROLE_RANKS[b.role] || 99;
      if (rankA !== rankB) return rankA - rankB;
      const nameA = a.account?.name || "";
      const nameB = b.account?.name || "";
      return nameA.localeCompare(nameB);
    });
  }, [members]);

  const ownerCount = useMemo(() => {
    return members.filter((m) => m.role === "owner").length;
  }, [members]);

  // Loading indicator
  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Verifica autorizzazioni workspace...</span>
        </div>
      </div>
    );
  }

  // Access restricted guard for Associati
  if (canManage === false) {
    return (
      <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex flex-col items-center justify-center min-h-[460px] text-ink select-none">
        <div className="w-full max-w-lg p-8 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col items-center text-center shadow-xl">
          <div className="w-12 h-12 rounded-[12px] bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Accesso riservato ad Owner e Admin
          </h1>

          <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
            La gestione del personale, dei ruoli e degli inviti è riservata esclusivamente ai proprietari (Owner) e agli amministratori (Admin) del workspace.
          </p>

          <div className="mt-4 px-3.5 py-2 rounded-[10px] bg-zinc-900/80 border border-white/5 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Il tuo ruolo attuale in questo workspace:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold uppercase text-[10px] border border-white/10">
              {ROLE_LABELS[currentRole] || "Associato"}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 mt-4 max-w-sm">
            Se hai bisogno di invitare colleghi o modificare autorizzazioni, contatta un referente amministrativo del workspace.
          </p>

          <Link
            href="/projects"
            className="mt-6 px-4 py-2.5 rounded-[12px] bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Torna ai progetti</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentOwner = currentRole === "owner";
  const isCurrentAdmin = currentRole === "admin";

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex flex-col gap-8 text-ink select-none pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {t.membersSettings.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t.membersSettings.subtitle}
          </p>
        </div>

        {/* Current User Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-zinc-950 border border-white/10 self-start sm:self-auto shrink-0">
          <span className="text-[11px] text-zinc-500">Il tuo ruolo:</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
              isCurrentOwner
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-white/10 border-white/20 text-white"
            )}
          >
            {ROLE_LABELS[currentRole]}
          </span>
        </div>
      </div>

      {/* Role Hierarchy Legend */}
      <div className="p-4 rounded-[14px] bg-zinc-950 border border-white/10 flex flex-col gap-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Gerarchia dei ruoli nel workspace
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Owner */}
          <div className="p-3 rounded-[10px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">1. Owner</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Controllo completo sul workspace. Gestisce e revoca sia gli Admin che gli Associati.
            </p>
          </div>

          {/* Admin */}
          <div className="p-3 rounded-[10px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold text-white">2. Admin</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Gestisce e revoca gli Associati. Non può modificare né rimuovere altri Admin o l'Owner.
            </p>
          </div>

          {/* Associato */}
          <div className="p-3 rounded-[10px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-white">3. Associato</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Collaboratore con accesso a progetti, issue e milestone. Non accede a questa sezione.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Member Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          Invita Nuovo Membro
        </h2>
        <form onSubmit={handleSendInvite} className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="collega@organizzazione.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-[12px] bg-zinc-900/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div className="sm:col-span-4">
              <LinearSelect
                size="md"
                fullWidth
                value={inviteRole}
                onChange={(val) => setInviteRole(val as any)}
                options={[
                  { value: "member", label: "Associato (Collaboratore)" },
                  ...(isCurrentOwner ? [{ value: "admin", label: "Admin (Amministratore)" }] : []),
                  { value: "guest", label: "Ospite (Sola lettura)" },
                ]}
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={!inviteEmail.trim() || isSendingInvite}
                className="w-full px-4 py-2.5 rounded-[12px] bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSendingInvite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>Crea invito</span>
              </button>
            </div>
          </div>

          {isCurrentAdmin && (
            <p className="text-[11px] text-zinc-500">
              Come Amministratore puoi invitare Associati e Ospiti. Solo l'Owner può nominare nuovi amministratori.
            </p>
          )}
        </form>

        {createdInvitationLink && (
          <div className="flex items-center gap-2 rounded-[12px] border border-emerald-500/20 bg-emerald-500/5 p-3">
            <input
              readOnly
              value={createdInvitationLink}
              className="min-w-0 flex-1 bg-transparent text-[11px] text-emerald-300 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(createdInvitationLink);
                addToast({ title: "Link copiato", description: "Il link di invito è negli appunti.", type: "info" });
              }}
              className="shrink-0 rounded-[8px] p-1.5 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
              title="Copia link invito"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Members Roster List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
            Membri del Workspace ({members.length})
          </h2>
          <span className="text-[11px] text-zinc-500">
            Ordinati per gerarchia: Owner, Admin, Associato
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {sortedMembers.map((member) => {
            const acc = member.account;
            if (!acc) return null;
            const isSelf = acc.id === currentUser.id || acc.email === currentUser.email;

            // Discord-style permissions:
            // - Owner can edit any role except self (to avoid accidental lockout)
            // - Admin can only edit roles of Associati (cannot touch Owner or other Admins)
            const canEditRole =
              !isSelf &&
              (isCurrentOwner ||
                (isCurrentAdmin && member.role === "member"));

            // - Owner can remove anyone (except self, and last owner protected)
            // - Admin can ONLY remove Associati
            const canRemove =
              !isSelf &&
              (isCurrentOwner
                ? member.role !== "owner" || ownerCount > 1
                : isCurrentAdmin && member.role === "member");

            const isTargetAdmin = member.role === "admin";
            const isTargetOwner = member.role === "owner";

            return (
              <div
                key={member.id}
                className="p-4 rounded-[14px] bg-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Member details with link to full Profile */}
                <Link
                  href={`/u/@${acc.username || acc.id}`}
                  className="flex items-center gap-3.5 min-w-0 group hover:opacity-90 transition-opacity"
                  title="Visualizza scheda profilo completa"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-zinc-900 text-white border border-white/10 flex items-center justify-center font-bold text-xs shadow-sm shrink-0 group-hover:border-white/30 transition-colors">
                    {acc.name ? acc.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-xs truncate group-hover:text-sky-300 transition-colors">
                        {acc.name}
                      </span>

                      {isSelf && (
                        <span className="px-1.5 py-0.2 rounded-[4px] bg-white/10 text-white border border-white/20 text-[9px] font-bold uppercase tracking-wider">
                          Tu
                        </span>
                      )}

                      {/* Role indicator pill */}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
                          member.role === "owner" && "bg-amber-500/10 border-amber-500/30 text-amber-300",
                          member.role === "admin" && "bg-sky-500/10 border-sky-500/30 text-sky-300",
                          member.role === "member" && "bg-zinc-800 border-white/10 text-zinc-300",
                          member.role === "guest" && "bg-zinc-900 border-white/5 text-zinc-500"
                        )}
                      >
                        {ROLE_LABELS[member.role] || member.role}
                      </span>

                      <InternalIdBadge
                        id={acc.identifier || "USR"}
                        internalId={acc.internal_id}
                        size="xs"
                      />
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                      {acc.email}
                    </span>
                  </div>
                </Link>

                {/* Actions & Custom Role Dropdown Selector */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  {canEditRole ? (
                    <LinearSelect
                      size="sm"
                      align="right"
                      value={member.role}
                      onChange={(newRole) => void updateMemberRole(member.id, newRole as any)}
                      options={[
                        ...(isCurrentOwner ? [{ value: "owner", label: "Owner" }] : []),
                        ...(isCurrentOwner ? [{ value: "admin", label: "Admin" }] : []),
                        { value: "member", label: "Associato" },
                        { value: "guest", label: "Ospite" },
                      ]}
                    />
                  ) : (
                    <div className="text-[11px] text-zinc-500 px-2 py-1">
                      {isSelf
                        ? "Il tuo profilo"
                        : isCurrentAdmin && (isTargetOwner || isTargetAdmin)
                        ? "Pari grado o superiore"
                        : ""}
                    </div>
                  )}

                  {canRemove ? (
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(member)}
                      className="px-2.5 py-1.5 rounded-[8px] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                      title="Rimuovi dal workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Rimuovi</span>
                    </button>
                  ) : !isSelf && (
                    <div className="w-7 h-7 flex items-center justify-center text-zinc-600" title="Non rimovibile con i tuoi permessi">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invitations List */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          Inviti Inviati ({invitations.length})
        </h2>
        {invitations.length === 0 && (
          <p className="text-xs text-zinc-500 p-5 rounded-[14px] bg-zinc-950 border border-white/10">
            Nessun invito registrato per questo workspace.
          </p>
        )}
        {invitations.map((invitation) => {
          const canRevokeInvite =
            invitation.status === "pending" &&
            (isCurrentOwner || (isCurrentAdmin && invitation.role !== "admin"));

          return (
            <div
              key={invitation.id}
              className="p-4 rounded-[14px] bg-zinc-950 border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-white truncate">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>{invitation.email}</span>
                </div>
                <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-1">
                  <Clock3 className="w-3 h-3" />
                  {invitation.status === "accepted" && invitation.accepted_at
                    ? `Accettato il ${new Date(invitation.accepted_at).toLocaleDateString("it-IT")} da ${invitation.accepted_by_account?.name || invitation.email}`
                    : `Scade il ${new Date(invitation.expires_at).toLocaleDateString("it-IT")}`}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                  {ROLE_LABELS[invitation.role] || invitation.role} · {invitation.status}
                </span>

                {canRevokeInvite && (
                  <button
                    type="button"
                    onClick={() => void revokeInvitation(invitation.id)}
                    className="p-1.5 rounded-[8px] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Revoca invito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Member Elimination */}
      {memberToRemove && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            if (!isRemoving) setMemberToRemove(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-[16px] bg-zinc-950 border border-white/15 p-6 flex flex-col gap-5 text-ink shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Rimuovi dal workspace
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Revoca dell'accesso per questo collaboratore.
                </p>
              </div>
            </div>

            {/* Target Member Card */}
            <div className="p-3.5 rounded-[12px] bg-zinc-900/70 border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {memberToRemove.account?.name ? memberToRemove.account.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {memberToRemove.account?.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono truncate">
                    {memberToRemove.account?.email}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-zinc-800 text-zinc-300 border border-white/10 shrink-0">
                {ROLE_LABELS[memberToRemove.role] || memberToRemove.role}
              </span>
            </div>

            {/* Warning Text */}
            <div className="text-xs text-zinc-300 leading-relaxed bg-red-500/5 border border-red-500/15 rounded-[12px] p-3.5">
              <p>
                Questa persona perderà immediatamente l'accesso a tutti i progetti, issue, documenti e attività del workspace{" "}
                <span className="text-white font-medium">{team.name}</span>.
              </p>
              <p className="text-[11px] text-zinc-400 mt-2">
                I contenuti già creati (issue, commenti, milestone) rimarranno conservati nello storico.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setMemberToRemove(null)}
                className="px-4 py-2.5 rounded-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => void handleConfirmRemoval()}
                className="px-4 py-2.5 rounded-[10px] bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRemoving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Rimuovi dal workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
