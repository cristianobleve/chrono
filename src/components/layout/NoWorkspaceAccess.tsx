"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Check, Mail, Loader2, RefreshCw } from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";
import { supabase } from "@/lib/supabase";
import { CreateWorkspacePage } from "@/components/workspaces/CreateWorkspacePage";

type PendingInvite = {
  id: string;
  workspace_id: string;
  role: string;
  workspace_name?: string;
};

export const NoWorkspaceAccess: React.FC = () => {
  const { currentUser, pullFromSupabase, addToast } = useLinearStore();

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const idpAvatar =
        session?.user?.user_metadata?.avatar_url ||
        session?.user?.user_metadata?.picture ||
        null;
      if (idpAvatar) {
        setAvatarUrl(idpAvatar);
      } else {
        const seed = encodeURIComponent(
          session?.user?.email || session?.user?.id || currentUser.email || "user"
        );
        setAvatarUrl(`https://blobatar.dev/${seed}.svg`);
      }
    });
  }, [currentUser.email]);

  const checkPendingInvites = async () => {
    try {
      setIsRefreshing(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setIsChecked(true);
        return;
      }

      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setIsChecked(true);
        return;
      }

      const data = await res.json();
      const rawInvites = data.pending_invitations || [];

      const mapped: PendingInvite[] = rawInvites.map(
        (inv: { id: string; workspace_id: string; role: string }) => {
          const notif = (data.notifications || []).find(
            (n: {
              metadata?: { invitation_id?: string };
              workspace_id?: string;
              title?: string;
            }) =>
              n.metadata?.invitation_id === inv.id ||
              n.workspace_id === inv.workspace_id
          );
          return {
            id: inv.id,
            workspace_id: inv.workspace_id,
            role: inv.role,
            workspace_name: notif
              ? notif.title.replace(/^Invito a\s+/i, "")
              : "Workspace",
          };
        }
      );

      setPendingInvites(mapped);
    } catch (err) {
      console.error("[NoWorkspaceAccess] Error checking invites:", err);
    } finally {
      setIsRefreshing(false);
      setIsChecked(true);
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
    window.addEventListener(
      "chrono:notifications-changed",
      handleRealtimeUpdate
    );

    return () => {
      window.removeEventListener(
        "chrono:invitations-changed",
        handleRealtimeUpdate
      );
      window.removeEventListener(
        "chrono:members-changed",
        handleRealtimeUpdate
      );
      window.removeEventListener(
        "chrono:notifications-changed",
        handleRealtimeUpdate
      );
    };
  }, [pullFromSupabase]);

  const handleAcceptInvite = async (invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
          title: "Acceptance error",
          description: json.error || "Failed to accept invite.",
          type: "error",
        });
        return;
      }

      addToast({
        title: "Invite accepted",
        description: "Workspace access granted.",
        type: "success",
      });

      await pullFromSupabase();
      window.location.reload();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Please try again shortly.";
      addToast({
        title: "Network error",
        description: message,
        type: "error",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

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
      } catch {}
    }

    window.location.assign("/login");
  };

  // Loading state while checking for invites
  if (!isChecked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#08090a]">
        <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
      </div>
    );
  }

  // No invites found - show workspace creation page
  if (showCreateWorkspace || pendingInvites.length === 0) {
    return (
      <CreateWorkspacePage
        onBack={
          showCreateWorkspace ? () => setShowCreateWorkspace(false) : undefined
        }
      />
    );
  }

  // Pending invites view
  const userEmail = currentUser.email || currentUser.name || "user";

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#08090a] text-white select-none">
      <header className="w-full h-12 px-5 flex items-center justify-between text-[11px] text-zinc-500 border-b border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign out</span>
        </button>

        <div className="flex items-center gap-2">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="font-mono text-zinc-500 text-[11px] max-w-[200px] truncate">
            {userEmail}
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[480px] mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="flex flex-col gap-6 text-left">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Pending invitations
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              You have been invited to collaborate on the following workspaces.
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
                      Role: {inv.role}
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
                  <span>Accept invite</span>
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
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateWorkspace(true)}
              className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Create a new workspace
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full h-12 flex items-center justify-center text-[11px] text-zinc-700 border-t border-white/5">
        Chrono Platform
      </footer>
    </div>
  );
};
