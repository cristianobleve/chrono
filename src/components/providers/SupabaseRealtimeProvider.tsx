"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { supabaseSync } from "@/lib/supabaseSync";
import { supabase } from "@/lib/supabase";
import { describeCron } from "@/lib/cronUtils";

export const SupabaseRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pullFromSupabase = useLinearStore((s) => s.pullFromSupabase);
  const addToast = useLinearStore((s) => s.addToast);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const initialSyncRef = useRef(false);

  useEffect(() => {
    if (initialSyncRef.current) return;
    initialSyncRef.current = true;

    // 1. Recover any user projects/workspaces from previous localStorage keys
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authenticatedEmail = session?.user?.email?.toLowerCase();
      if (authenticatedEmail) {
        const state = useLinearStore.getState();
        const account = state.accounts.find((item) => item.email.toLowerCase() === authenticatedEmail);
        if (account) {
          useLinearStore.setState({
            currentAccountId: account.id,
            currentUser: {
              id: account.id,
              identifier: account.identifier,
              internalId: account.internalId,
              name: account.name,
              username: account.username,
              email: account.email,
              role: account.role,
              avatarUrl: account.avatarUrl || undefined,
            },
          });
        } else if (session?.user) {
          const fallbackName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || authenticatedEmail.split("@")[0];
          useLinearStore.setState({
            currentAccountId: session.user.id,
            currentUser: {
              id: session.user.id,
              name: fallbackName,
              username: authenticatedEmail.split("@")[0],
              email: session.user.email || authenticatedEmail,
              role: "member",
            },
          });
        }
      }

      // Initial fetch of remote Supabase data
      await pullFromSupabase();
    })();

    // 3. Setup Postgres Realtime Channel
    console.log("[Supabase Realtime] Connecting to live postgres channel...");
    const unsubscribe = supabaseSync.subscribeToRealtime(
      // On Project Change
      (eventType, row) => {
        if (!row) return;
        const store = useLinearStore.getState();

        if (eventType === "INSERT") {
          const exists = store.projects.some((p) => p.id === row.id || p.slug === row.slug);
          if (!exists) {
            const formatted = {
              id: row.id,
              identifier: row.identifier || `PRJ-${store.projects.length + 1}`,
              internalId: row.internal_id || `prj_${row.id}`,
              workspaceId: row.workspace_id || store.currentWorkspaceId,
              teamId: row.team_id || "team-1",
              name: row.name,
              slug: row.slug,
              summary: row.summary || "",
              description: row.description || "",
              status: row.status || "Planned",
              priority: row.priority || "medium",
              leadId: row.lead_id,
              startDate: row.start_date,
              targetDate: row.target_date,
              icon: row.icon || "P",
              iconBg: row.icon_bg || "#121419",
              iconColor: row.icon_color || "#5e6ad2",
              iconSymbol: row.icon_symbol,
              iconShape: row.icon_shape || "squircle",
              coverUrl: row.cover_url,
              coverGradient: row.cover_gradient,
              parentProjectId: row.parent_project_id,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            };

            useLinearStore.setState({
              projects: [formatted, ...store.projects],
            });

            addToast({
              title: "Nuovo Progetto Ricevuto (Realtime)",
              description: `"${row.name}" sincronizzato istantaneamente via Supabase Cloud`,
              type: "info",
            });
          }
        } else if (eventType === "UPDATE") {
          useLinearStore.setState({
            projects: store.projects.map((p) => {
              if (p.id === row.id) {
                return {
                  ...p,
                  name: row.name ?? p.name,
                  slug: row.slug ?? p.slug,
                  status: row.status ?? p.status,
                  priority: row.priority ?? p.priority,
                  summary: row.summary ?? p.summary,
                  description: row.description ?? p.description,
                  targetDate: row.target_date ?? p.targetDate,
                  startDate: row.start_date ?? p.startDate,
                  coverUrl: row.cover_url ?? p.coverUrl,
                  coverGradient: row.cover_gradient ?? p.coverGradient,
                  icon: row.icon ?? p.icon,
                  iconBg: row.icon_bg ?? p.iconBg,
                  iconColor: row.icon_color ?? p.iconColor,
                  updatedAt: row.updated_at || new Date().toISOString(),
                };
              }
              return p;
            }),
          });
        } else if (eventType === "DELETE") {
          useLinearStore.setState({
            projects: store.projects.filter((p) => p.id !== row.id),
          });
        }
      },

      // On Issue Change
      (eventType, row) => {
        if (!row) return;
        const store = useLinearStore.getState();

        if (eventType === "INSERT") {
          const exists = store.issues.some((i) => i.id === row.id || i.identifier === row.identifier);
          if (!exists) {
            const formatted = {
              id: row.id,
              identifier: row.identifier || `ISS-${store.issues.length + 1}`,
              internalId: row.internal_id || `iss_${row.id}`,
              workspaceId: row.workspace_id || store.currentWorkspaceId,
              teamId: row.team_id || "team-1",
              projectId: row.project_id,
              title: row.title,
              description: row.description || "",
              status: row.status || "todo",
              priority: row.priority || "none",
              dueDate: row.due_date,
              dueTime: row.due_time,
              reminderDate: row.reminder_date,
              reminderTime: row.reminder_time,
              recurrence: (row.recurrence && row.recurrence.startsWith("cron:")) ? "custom" : (row.recurrence || "none"),
              recurrenceDays: row.recurrence_days || [],
              cronExpression: (row.recurrence && row.recurrence.startsWith("cron:")) ? row.recurrence.replace("cron:", "") : null,
              cronHumanReadable: (row.recurrence && row.recurrence.startsWith("cron:")) ? describeCron(row.recurrence.replace("cron:", "")) : null,
              eisenhowerQuadrant: row.eisenhower_quadrant,
              labels: row.labels || [],
              tags: row.tags || [],
              estimate: row.estimate,
              sortOrder: row.sort_order || 1,
              completedAt: row.completed_at,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            };

            useLinearStore.setState({
              issues: [formatted, ...store.issues],
            });
          }
        } else if (eventType === "UPDATE") {
          useLinearStore.setState({
            issues: store.issues.map((i) => {
              if (i.id === row.id) {
                return {
                  ...i,
                  title: row.title ?? i.title,
                  status: row.status ?? i.status,
                  priority: row.priority ?? i.priority,
                  description: row.description ?? i.description,
                  dueDate: row.due_date ?? i.dueDate,
                  dueTime: row.due_time ?? i.dueTime,
                  completedAt: row.completed_at ?? i.completedAt,
                  eisenhowerQuadrant: row.eisenhower_quadrant ?? i.eisenhowerQuadrant,
                  labels: row.labels ?? i.labels,
                  tags: row.tags ?? i.tags,
                  estimate: row.estimate ?? i.estimate,
                  updatedAt: row.updated_at || new Date().toISOString(),
                };
              }
              return i;
            }),
          });
        } else if (eventType === "DELETE") {
          useLinearStore.setState({
            issues: store.issues.filter((i) => i.id !== row.id),
          });
        }
      },

      // On Workspace Change
      (eventType, row) => {
        if (!row) return;
        const store = useLinearStore.getState();

        if (eventType === "INSERT") {
          const exists = store.workspaces.some((w) => w.id === row.id || w.slug === row.slug);
          if (!exists) {
            const formatted = {
              id: row.id,
              identifier: row.identifier || `WS-${store.workspaces.length + 1}`,
              internalId: row.internal_id || `wrk_${row.id}`,
              name: row.name,
              slug: row.slug,
              icon: row.icon || "chrono",
              iconBg: row.icon_bg || "#121419",
              iconColor: row.icon_color || "#5e6ad2",
              plan: row.plan || "Pro",
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            };

            useLinearStore.setState({
              workspaces: [...store.workspaces, formatted],
            });
          }
        } else if (eventType === "UPDATE") {
          useLinearStore.setState({
            workspaces: store.workspaces.map((w) => {
              if (w.id === row.id) {
                return {
                  ...w,
                  name: row.name ?? w.name,
                  slug: row.slug ?? w.slug,
                  icon: row.icon ?? w.icon,
                  iconBg: row.icon_bg ?? w.iconBg,
                  iconColor: row.icon_color ?? w.iconColor,
                  plan: row.plan ?? w.plan,
                  updatedAt: row.updated_at || new Date().toISOString(),
                };
              }
              return w;
            }),
          });
        } else if (eventType === "DELETE") {
          useLinearStore.setState({
            workspaces: store.workspaces.filter((w) => w.id !== row.id),
          });
        }
      },

      // On Workspace Invitation Change (Realtime stream)
      (eventType, row) => {
        if (!row) return;
        console.log("[Supabase Realtime] Evento invito ricevuto:", eventType, row);
        window.dispatchEvent(new CustomEvent("chrono:invitations-changed", { detail: { eventType, row } }));
        void pullFromSupabase();

        const currentUserEmail = useLinearStore.getState().currentUser.email?.toLowerCase();
        if (eventType === "INSERT" && row.email && currentUserEmail === row.email.toLowerCase()) {
          addToast({
            title: "Nuovo Invito Ricevuto",
            description: `Hai ricevuto un invito al workspace con ruolo ${row.role}.`,
            type: "info",
          });
        }
      },

      // On Workspace Member Change (Realtime stream)
      (eventType, row) => {
        if (!row) return;
        console.log("[Supabase Realtime] Evento membro ricevuto:", eventType, row);
        window.dispatchEvent(new CustomEvent("chrono:members-changed", { detail: { eventType, row } }));
        void pullFromSupabase();
      },

      // On Workspace Notification Change (Realtime stream)
      (eventType, row) => {
        if (!row) return;
        console.log("[Supabase Realtime] Evento notifica ricevuto:", eventType, row);
        window.dispatchEvent(new CustomEvent("chrono:notifications-changed", { detail: { eventType, row } }));
      },

      // On Any Database Modification (Global Streaming)
      (table, eventType, row) => {
        window.dispatchEvent(new CustomEvent("chrono:realtime-change", { detail: { table, eventType, row } }));
      }
    );

    setIsSubscribed(true);

    return () => {
      unsubscribe();
    };
  }, [pullFromSupabase, addToast]);

  return <>{children}</>;
};
