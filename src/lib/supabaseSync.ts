import { supabase } from "./supabase";
import { describeCron } from "./cronUtils";
import { sortMilestones } from "./utils";
import {
  Workspace,
  Account,
  Project,
  Issue,
  Milestone,
  Habit,
  Tag,
  ProjectFolder,
  TimelineEvent,
} from "@/types";

export interface SupabaseHealth {
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export const supabaseSync = {
  /**
   * Check connection health with Supabase PostgreSQL
   */
  async checkConnection(): Promise<SupabaseHealth> {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id")
        .limit(1);

      const latencyMs = Math.round(performance.now() - startTime);

      if (error) {
        return { connected: false, latencyMs, error: error.message };
      }

      return { connected: true, latencyMs };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return { connected: false, latencyMs, error: err.message || "Failed to reach Supabase" };
    }
  },

  /**
   * Format Project to Supabase snake_case columns
   */
  formatProjectRow(p: Project, workspaceId?: string) {
    const wsId = p.workspaceId || workspaceId || "ws-1";
    return {
      id: p.id,
      identifier: p.identifier || `PRJ-${Math.floor(Math.random() * 1000)}`,
      internal_id: p.internalId || `prj_${p.id}`,
      workspace_id: wsId,
      team_id: p.teamId || "team-1",
      name: p.name || "Untitled Project",
      slug: p.slug || `project-${Date.now()}`,
      summary: p.summary || null,
      description: p.description || null,
      status: p.status || "Planned",
      priority: p.priority || "medium",
      lead_id: p.leadId || p.lead?.id || null,
      start_date: p.startDate || null,
      target_date: p.targetDate || null,
      icon: p.icon || p.name?.charAt(0) || "P",
      icon_bg: p.iconBg || "#121419",
      icon_color: p.iconColor || "#5e6ad2",
      icon_symbol: p.iconSymbol || null,
      icon_shape: p.iconShape || "squircle",
      cover_url: p.coverUrl || null,
      cover_gradient: p.coverGradient || null,
      parent_project_id: p.parentProjectId || null,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Format Milestone to Supabase snake_case columns
   */
  formatMilestoneRow(m: Milestone, projectId: string) {
    return {
      id: m.id,
      project_id: m.projectId || projectId,
      name: m.name,
      target_date: m.targetDate || null,
      completed: Boolean(m.completed),
      sort_order: m.sortOrder || 0,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Format Issue to Supabase snake_case columns
   */
  formatIssueRow(i: Issue, workspaceId?: string) {
    const wsId = i.workspaceId || workspaceId || "ws-1";
    return {
      id: i.id,
      identifier: i.identifier || `ISS-${Math.floor(Math.random() * 1000)}`,
      internal_id: i.internalId || `iss_${i.id}`,
      workspace_id: wsId,
      team_id: i.teamId || "team-1",
      project_id: i.projectId || null,
      assignee_id: i.assigneeId || i.assignee?.id || null,
      creator_id: i.creatorId || i.creator?.id || null,
      title: i.title || "Untitled Issue",
      description: i.description || null,
      status: i.status || "todo",
      priority: i.priority || "none",
      due_date: i.dueDate || null,
      due_time: i.dueTime || null,
      reminder_date: i.reminderDate || null,
      reminder_time: i.reminderTime || null,
      recurrence: i.cronExpression ? `cron:${i.cronExpression}` : (i.recurrence || "none"),
      recurrence_days: i.recurrenceDays || [],
      eisenhower_quadrant: i.eisenhowerQuadrant || null,
      labels: i.labels || [],
      tags: i.tags || [],
      estimate: i.estimate || null,
      sort_order: i.sortOrder || 1,
      completed_at: i.completedAt || null,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Format Habit to Supabase snake_case columns
   */
  formatHabitRow(h: Habit, workspaceId?: string, accountId?: string) {
    return {
      id: h.id,
      workspace_id: h.workspaceId || workspaceId || "ws-1",
      account_id: accountId || "user-1",
      title: h.title,
      category: h.category || "General",
      icon: h.icon || "flame",
      color: h.color || "#5e6ad2",
      frequency: h.frequency || "daily",
      target_days: h.targetDays || [1, 2, 3, 4, 5, 6, 7],
      completed_dates: h.completedDates || [],
      streak: h.streak || 0,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Format Tag to Supabase snake_case columns
   */
  formatTagRow(t: Tag, workspaceId?: string) {
    return {
      id: t.id,
      workspace_id: t.workspaceId || workspaceId || "ws-1",
      name: t.name,
      color: t.color || "#5e6ad2",
      description: t.description || null,
    };
  },

  /**
   * Format Folder to Supabase snake_case columns
   */
  formatFolderRow(f: ProjectFolder, workspaceId?: string) {
    return {
      id: f.id,
      workspace_id: f.workspaceId || workspaceId || "ws-1",
      name: f.name,
      icon: f.icon || "folder",
      color: f.color || "#5e6ad2",
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Format Workspace to Supabase snake_case columns
   */
  formatWorkspaceRow(w: Workspace) {
    return {
      id: w.id,
      identifier: w.identifier || "WS-1",
      internal_id: w.internalId || `wrk_${w.id}`,
      name: w.name,
      slug: w.slug,
      icon: w.icon || "chrono",
      icon_bg: w.iconBg || "#121419",
      icon_color: w.iconColor || "#5e6ad2",
      plan: w.plan || "Pro",
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Safe server-side API call to bypass RLS in client runtime
   */
  async callApiSync(action: string, payload: any) {
    if (typeof window !== "undefined") {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.warn("[supabaseSync] Skipping API call: no authenticated session");
          return null;
        }

        const res = await fetch("/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action, payload }),
        });
        const result = await res.json().catch(() => null);
        if (res.ok) return result;
        console.warn(`[supabaseSync] ${action} failed (${res.status}):`, result?.error || res.statusText);
        return { success: false, error: result?.error || res.statusText, status: res.status };
      } catch (err) {
        console.warn("[supabaseSync] API call notice:", err);
      }
    }
    return null;
  },

  /**
   * Sync single project to Supabase, including its milestones
   */
  async syncProject(project: Project) {
    const row = this.formatProjectRow(project);
    const apiRes = await this.callApiSync("sync_project_bundle", {
      project: row,
      milestones: (project.milestones || []).map((milestone) =>
        this.formatMilestoneRow(milestone, project.id),
      ),
      links: (project.links || []).map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        category: link.category || "custom",
      })),
    });
    if (!apiRes || !apiRes.success) {
      try {
        const { error } = await supabase.from("projects").upsert(row);
        if (error) {
          console.warn("Supabase syncProject notice:", error.message || error.details || error);
        }
      } catch (err: any) {
        console.warn("Supabase syncProject failed:", err?.message || err);
      }
      if (project.milestones && project.milestones.length > 0) {
        await Promise.all(project.milestones.map((milestone) => this.syncMilestone(milestone, project.id)));
      }
      if (project.links !== undefined) {
        await this.syncProjectLinks(project.id, project.links || []);
      }
    }
  },

  /**
   * Replace all links for a project atomically
   */
  async syncProjectLinks(projectId: string, links: import("@/types").ProjectLink[]) {
    const res = await this.callApiSync("sync_project_links", {
      project_id: projectId,
      links: links.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        category: l.category || "custom",
      })),
    });
    if (!res || !res.success) {
      console.warn("syncProjectLinks via API failed, skipping direct fallback");
    }
  },

  /**
   * Delete project from Supabase
   */
  async deleteProject(id: string) {
    const apiRes = await this.callApiSync("delete_project", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteProject notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteProject failed:", err?.message || err);
    }
  },

  /**
   * Sync single milestone to Supabase
   */
  async syncMilestone(milestone: Milestone, projectId: string) {
    const row = this.formatMilestoneRow(milestone, projectId);
    const apiRes = await this.callApiSync("upsert_milestone", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("project_milestones").upsert(row);
      if (error) {
        console.warn("Supabase syncMilestone notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncMilestone failed:", err?.message || err);
    }
  },

  /**
   * Delete milestone from Supabase
   */
  async deleteMilestone(id: string) {
    const apiRes = await this.callApiSync("delete_milestone", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("project_milestones").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteMilestone notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteMilestone failed:", err?.message || err);
    }
  },

  /**
   * Sync single issue to Supabase
   */
  async syncIssue(issue: Issue) {
    const row = this.formatIssueRow(issue);
    const apiRes = await this.callApiSync("upsert_issue", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("issues").upsert(row);
      if (error) {
        console.warn("Supabase syncIssue notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncIssue failed:", err?.message || err);
    }
  },

  /**
   * Delete issue from Supabase
   */
  async deleteIssue(id: string) {
    const apiRes = await this.callApiSync("delete_issue", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("issues").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteIssue notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteIssue failed:", err?.message || err);
    }
  },

  /**
   * Sync single habit to Supabase
   */
  async syncHabit(habit: Habit, workspaceId?: string, accountId?: string) {
    const row = this.formatHabitRow(habit, workspaceId, accountId);
    const apiRes = await this.callApiSync("upsert_habit", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("habits").upsert(row);
      if (error) {
        console.warn("Supabase syncHabit notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncHabit failed:", err?.message || err);
    }
  },

  /**
   * Delete habit from Supabase
   */
  async deleteHabit(id: string) {
    const apiRes = await this.callApiSync("delete_habit", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteHabit notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteHabit failed:", err?.message || err);
    }
  },

  /**
   * Sync single tag to Supabase
   */
  async syncTag(tag: Tag, workspaceId?: string) {
    const row = this.formatTagRow(tag, workspaceId);
    const apiRes = await this.callApiSync("upsert_tag", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("tags").upsert(row);
      if (error) {
        console.warn("Supabase syncTag notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncTag failed:", err?.message || err);
    }
  },

  /**
   * Delete tag from Supabase
   */
  async deleteTag(id: string) {
    const apiRes = await this.callApiSync("delete_tag", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteTag notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteTag failed:", err?.message || err);
    }
  },

  /**
   * Sync single project folder to Supabase
   */
  async syncFolder(folder: ProjectFolder, workspaceId?: string) {
    const row = this.formatFolderRow(folder, workspaceId);
    const apiRes = await this.callApiSync("upsert_folder", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("project_folders").upsert(row);
      if (error) {
        console.warn("Supabase syncFolder notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncFolder failed:", err?.message || err);
    }
  },

  /**
   * Delete project folder from Supabase
   */
  async deleteFolder(id: string) {
    const apiRes = await this.callApiSync("delete_folder", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("project_folders").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteFolder notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteFolder failed:", err?.message || err);
    }
  },

  /**
   * Sync single workspace to Supabase
   */
  async syncWorkspace(workspace: Workspace) {
    const row = this.formatWorkspaceRow(workspace);
    const apiRes = await this.callApiSync("upsert_workspace", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("workspaces").upsert(row);
      if (error) {
        console.warn("Supabase syncWorkspace notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncWorkspace failed:", err?.message || err);
    }
  },

  /**
   * Delete workspace from Supabase
   */
  async deleteWorkspace(id: string) {
    const apiRes = await this.callApiSync("delete_workspace", { id });
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) {
        console.warn("Supabase deleteWorkspace notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase deleteWorkspace failed:", err?.message || err);
    }
  },

  /**
   * Sync single account profile to Supabase
   */
  async syncAccount(account: Partial<Account> & { id: string }) {
    const row: Record<string, any> = {
      id: account.id,
      name: account.name,
      username: account.username,
      email: account.email,
      avatar_url: account.avatarUrl !== undefined ? account.avatarUrl : null,
      role: account.role || "member",
    };
    if (account.coverUrl !== undefined) row.cover_url = account.coverUrl;
    if (account.coverGradient !== undefined) row.cover_gradient = account.coverGradient;
    if (account.department !== undefined) row.department = account.department;
    if (account.title !== undefined) row.title = account.title;
    if (account.bio !== undefined) row.bio = account.bio;
    if (account.location !== undefined) row.location = account.location;
    if (account.phone !== undefined) row.phone = account.phone;
    if (account.github !== undefined) row.github = account.github;
    if (account.twitter !== undefined) row.twitter = account.twitter;
    if (account.website !== undefined) row.website = account.website;

    const apiRes = await this.callApiSync("upsert_account", row);
    if (apiRes && apiRes.success) return;

    try {
      const { error } = await supabase.from("accounts").upsert(row);
      if (error) {
        if (error.message?.includes("column") || (error as any).code === "42703") {
          await supabase.from("accounts").upsert({
            id: account.id,
            name: account.name,
            username: account.username,
            email: account.email,
            avatar_url: row.avatar_url,
            role: row.role,
          });
          return;
        }
        console.warn("Supabase syncAccount notice:", error.message || error.details || error);
      }
    } catch (err: any) {
      console.warn("Supabase syncAccount failed:", err?.message || err);
    }
  },

  /**
   * Log activity to Supabase activity_logs
   */
  async logActivity(data: { action: string; details?: string; projectId?: string; issueId?: string; userId?: string }) {
    await this.callApiSync("log_activity", {
      action: data.action,
      details: data.details,
      project_id: data.projectId || null,
      issue_id: data.issueId || null,
      user_id: data.userId || null,
    });
  },

  /**
   * Pull all workspace data from Supabase
   */
  async pullAllFromSupabase(workspaceId?: string) {
    // 1. Try server sync endpoint first
    const apiRes = await this.callApiSync("pull_all", {
      workspace_id: workspaceId || undefined,
    });
    if (apiRes && apiRes.success) {
      const milestonesByProject: Record<string, Milestone[]> = {};
      (apiRes.milestones || []).forEach((m: any) => {
        const ms: Milestone = {
          id: m.id,
          name: m.name,
          targetDate: m.target_date,
          completed: Boolean(m.completed),
          projectId: m.project_id,
          sortOrder: m.sort_order || 0,
        };
        if (!milestonesByProject[m.project_id]) {
          milestonesByProject[m.project_id] = [];
        }
        milestonesByProject[m.project_id].push(ms);
      });

      const linksByProject: Record<string, import("@/types").ProjectLink[]> = {};
      (apiRes.projectLinks || []).forEach((l: any) => {
        const link = { id: l.id, title: l.title, url: l.url, category: l.category };
        if (!linksByProject[l.project_id]) linksByProject[l.project_id] = [];
        linksByProject[l.project_id].push(link);
      });

      const mappedProjects: Project[] = (apiRes.projects || []).map((p: any) => ({
        id: p.id,
        identifier: p.identifier,
        internalId: p.internal_id,
        workspaceId: p.workspace_id,
        teamId: p.team_id || "team-1",
        name: p.name,
        slug: p.slug,
        summary: p.summary || "",
        description: p.description || "",
        status: p.status || "Planned",
        priority: p.priority || "medium",
        leadId: p.lead_id,
        startDate: p.start_date,
        targetDate: p.target_date,
        icon: p.icon || "P",
        iconBg: p.icon_bg || "#121419",
        iconColor: p.icon_color || "#71717a",
        iconSymbol: p.icon_symbol,
        iconShape: p.icon_shape || "squircle",
        coverUrl: p.cover_url,
        coverGradient: p.cover_gradient,
        parentProjectId: p.parent_project_id,
        milestones: sortMilestones(milestonesByProject[p.id] || []),
        links: linksByProject[p.id] || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      const mappedIssues: Issue[] = (apiRes.issues || []).map((i: any) => ({
        id: i.id,
        identifier: i.identifier,
        internalId: i.internal_id,
        workspaceId: i.workspace_id,
        teamId: i.team_id || "team-1",
        projectId: i.project_id,
        assigneeId: i.assignee_id,
        creatorId: i.creator_id,
        title: i.title,
        description: i.description || "",
        status: i.status || "todo",
        priority: i.priority || "none",
        dueDate: i.due_date,
        dueTime: i.due_time,
        reminderDate: i.reminder_date,
        reminderTime: i.reminder_time,
        recurrence: (i.recurrence && i.recurrence.startsWith("cron:")) ? "custom" : (i.recurrence || "none"),
        recurrenceDays: i.recurrence_days || [],
        cronExpression: (i.recurrence && i.recurrence.startsWith("cron:")) ? i.recurrence.replace("cron:", "") : null,
        cronHumanReadable: (i.recurrence && i.recurrence.startsWith("cron:")) ? describeCron(i.recurrence.replace("cron:", "")) : null,
        eisenhowerQuadrant: i.eisenhower_quadrant,
        labels: i.labels || [],
        tags: i.tags || [],
        estimate: i.estimate,
        sortOrder: i.sort_order,
        completedAt: i.completed_at,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }));

      const mappedWorkspaces: Workspace[] = (apiRes.workspaces || []).map((w: any) => ({
        id: w.id,
        identifier: w.identifier,
        internalId: w.internal_id,
        name: w.name,
        slug: w.slug,
        icon: w.icon || "chrono",
        iconBg: w.icon_bg || "#121419",
        iconColor: w.icon_color || "#71717a",
        plan: w.plan || "Pro",
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      }));

      const mappedHabits: Habit[] = (apiRes.habits || []).map((h: any) => ({
        id: h.id,
        workspaceId: h.workspace_id,
        accountId: h.account_id,
        title: h.title,
        category: h.category || "General",
        icon: h.icon || "flame",
        color: h.color || "#5e6ad2",
        frequency: h.frequency || "daily",
        targetDays: h.target_days || [1, 2, 3, 4, 5, 6, 7],
        completedDates: h.completed_dates || [],
        streak: h.streak || 0,
        createdAt: h.created_at,
      }));

      const mappedTags: Tag[] = (apiRes.tags || []).map((t: any) => ({
        id: t.id,
        workspaceId: t.workspace_id,
        name: t.name,
        color: t.color || "#5e6ad2",
        description: t.description || "",
      }));

      const mappedFolders: ProjectFolder[] = (apiRes.folders || []).map((f: any) => ({
        id: f.id,
        workspaceId: f.workspace_id,
        name: f.name,
        icon: f.icon || "folder",
        color: f.color || "#5e6ad2",
        createdAt: f.created_at,
      }));

      const mappedAccounts: Account[] = (apiRes.accounts || []).map((a: any) => ({
        id: a.id,
        identifier: a.identifier,
        internalId: a.internal_id || a.internalId,
        name: a.name,
        username: a.username,
        email: a.email,
        avatarUrl: a.avatar_url || a.avatarUrl || null,
        role: a.role || "member",
        workspaces: a.workspaces || [],
        activeWorkspaceId: a.active_workspace_id || a.activeWorkspaceId,
        createdAt: a.created_at || a.createdAt || new Date().toISOString(),
      }));

      return {
        workspaces: mappedWorkspaces,
        projects: mappedProjects,
        issues: mappedIssues,
        habits: mappedHabits,
        tags: mappedTags,
        folders: mappedFolders,
        accounts: mappedAccounts,
      };
    }

    // Direct Supabase fallback
    try {
      const [
        { data: workspaces },
        { data: projects },
        { data: milestones },
        { data: issues },
        { data: habits },
        { data: tags },
        { data: folders },
        { data: accounts },
        { data: projectLinks },
      ] = await Promise.all([
        supabase.from("workspaces").select("*"),
        workspaceId
          ? supabase.from("projects").select("*").eq("workspace_id", workspaceId)
          : supabase.from("projects").select("*"),
        supabase.from("project_milestones").select("*").order("sort_order", { ascending: true }).order("target_date", { ascending: true }),
        workspaceId
          ? supabase.from("issues").select("*").eq("workspace_id", workspaceId)
          : supabase.from("issues").select("*"),
        workspaceId
          ? supabase.from("habits").select("*").eq("workspace_id", workspaceId)
          : supabase.from("habits").select("*"),
        workspaceId
          ? supabase.from("tags").select("*").eq("workspace_id", workspaceId)
          : supabase.from("tags").select("*"),
        workspaceId
          ? supabase.from("project_folders").select("*").eq("workspace_id", workspaceId)
          : supabase.from("project_folders").select("*"),
        supabase.from("accounts").select("*"),
        supabase.from("project_links").select("*"),
      ]);

      const milestonesByProject: Record<string, Milestone[]> = {};
      (milestones || []).forEach((m: any) => {
        const ms: Milestone = {
          id: m.id,
          name: m.name,
          targetDate: m.target_date,
          completed: Boolean(m.completed),
          projectId: m.project_id,
          sortOrder: m.sort_order || 0,
        };
        if (!milestonesByProject[m.project_id]) {
          milestonesByProject[m.project_id] = [];
        }
        milestonesByProject[m.project_id].push(ms);
      });

      const linksByProject: Record<string, import("@/types").ProjectLink[]> = {};
      (projectLinks || []).forEach((l: any) => {
        const link = { id: l.id, title: l.title, url: l.url, category: l.category };
        if (!linksByProject[l.project_id]) linksByProject[l.project_id] = [];
        linksByProject[l.project_id].push(link);
      });

      const mappedProjects: Project[] = (projects || []).map((p: any) => ({
        id: p.id,
        identifier: p.identifier,
        internalId: p.internal_id,
        workspaceId: p.workspace_id,
        teamId: p.team_id || "team-1",
        name: p.name,
        slug: p.slug,
        summary: p.summary || "",
        description: p.description || "",
        status: p.status || "Planned",
        priority: p.priority || "medium",
        leadId: p.lead_id,
        startDate: p.start_date,
        targetDate: p.target_date,
        icon: p.icon || "P",
        iconBg: p.icon_bg || "#121419",
        iconColor: p.icon_color || "#71717a",
        iconSymbol: p.icon_symbol,
        iconShape: p.icon_shape || "squircle",
        coverUrl: p.cover_url,
        coverGradient: p.cover_gradient,
        parentProjectId: p.parent_project_id,
        milestones: sortMilestones(milestonesByProject[p.id] || []),
        links: linksByProject[p.id] || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      const mappedIssues: Issue[] = (issues || []).map((i: any) => ({
        id: i.id,
        identifier: i.identifier,
        internalId: i.internal_id,
        workspaceId: i.workspace_id,
        teamId: i.team_id || "team-1",
        projectId: i.project_id,
        assigneeId: i.assignee_id,
        creatorId: i.creator_id,
        title: i.title,
        description: i.description || "",
        status: i.status || "todo",
        priority: i.priority || "none",
        dueDate: i.due_date,
        dueTime: i.due_time,
        reminderDate: i.reminder_date,
        reminderTime: i.reminder_time,
        recurrence: (i.recurrence && i.recurrence.startsWith("cron:")) ? "custom" : (i.recurrence || "none"),
        recurrenceDays: i.recurrence_days || [],
        cronExpression: (i.recurrence && i.recurrence.startsWith("cron:")) ? i.recurrence.replace("cron:", "") : null,
        cronHumanReadable: (i.recurrence && i.recurrence.startsWith("cron:")) ? describeCron(i.recurrence.replace("cron:", "")) : null,
        eisenhowerQuadrant: i.eisenhower_quadrant,
        labels: i.labels || [],
        tags: i.tags || [],
        estimate: i.estimate,
        sortOrder: i.sort_order,
        completedAt: i.completed_at,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      }));

      const mappedWorkspaces: Workspace[] = (workspaces || []).map((w: any) => ({
        id: w.id,
        identifier: w.identifier,
        internalId: w.internal_id,
        name: w.name,
        slug: w.slug,
        icon: w.icon || "chrono",
        iconBg: w.icon_bg || "#121419",
        iconColor: w.icon_color || "#71717a",
        plan: w.plan || "Pro",
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      }));

      const mappedHabits: Habit[] = (habits || []).map((h: any) => ({
        id: h.id,
        workspaceId: h.workspace_id,
        accountId: h.account_id,
        title: h.title,
        category: h.category || "General",
        icon: h.icon || "flame",
        color: h.color || "#5e6ad2",
        frequency: h.frequency || "daily",
        targetDays: h.target_days || [1, 2, 3, 4, 5, 6, 7],
        completedDates: h.completed_dates || [],
        streak: h.streak || 0,
        createdAt: h.created_at,
      }));

      const mappedTags: Tag[] = (tags || []).map((t: any) => ({
        id: t.id,
        workspaceId: t.workspace_id,
        name: t.name,
        color: t.color || "#5e6ad2",
        description: t.description || "",
      }));

      const mappedFolders: ProjectFolder[] = (folders || []).map((f: any) => ({
        id: f.id,
        workspaceId: f.workspace_id,
        name: f.name,
        icon: f.icon || "folder",
        color: f.color || "#5e6ad2",
        createdAt: f.created_at,
      }));

      let cachedAccounts: Account[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("linear-clone-storage");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.accounts) {
              cachedAccounts = parsed.state.accounts;
            }
          }
        } catch {}
      }

      const mappedAccounts: Account[] = (accounts || []).map((a: any) => {
        const localAcc = cachedAccounts.find((c) => c.id === a.id);
        return {
          id: a.id,
          identifier: a.identifier || localAcc?.identifier,
          internalId: a.internal_id || a.internalId || localAcc?.internalId,
          name: a.name || localAcc?.name,
          username: a.username || localAcc?.username,
          email: a.email || localAcc?.email,
          avatarUrl: a.avatar_url !== undefined ? a.avatar_url : (localAcc?.avatarUrl || null),
          role: a.role || localAcc?.role || "member",
          workspaces: a.workspaces || localAcc?.workspaces || [],
          activeWorkspaceId: a.active_workspace_id || a.activeWorkspaceId || localAcc?.activeWorkspaceId,
          coverUrl: a.cover_url !== undefined ? a.cover_url : (localAcc?.coverUrl || null),
          coverGradient: a.cover_gradient !== undefined ? a.cover_gradient : (localAcc?.coverGradient || null),
          department: a.department !== undefined ? a.department : (localAcc?.department || null),
          title: a.title !== undefined ? a.title : (localAcc?.title || null),
          bio: a.bio !== undefined ? a.bio : (localAcc?.bio || null),
          location: a.location !== undefined ? a.location : (localAcc?.location || null),
          timezone: a.timezone !== undefined ? a.timezone : (localAcc?.timezone || null),
          phone: a.phone !== undefined ? a.phone : (localAcc?.phone || null),
          github: a.github !== undefined ? a.github : (localAcc?.github || null),
          twitter: a.twitter !== undefined ? a.twitter : (localAcc?.twitter || null),
          website: a.website !== undefined ? a.website : (localAcc?.website || null),
          createdAt: a.created_at || a.createdAt || localAcc?.createdAt || new Date().toISOString(),
        };
      });

      return {
        workspaces: mappedWorkspaces,
        projects: mappedProjects,
        issues: mappedIssues,
        habits: mappedHabits,
        tags: mappedTags,
        folders: mappedFolders,
        accounts: mappedAccounts,
      };
    } catch (err) {
      console.warn("Supabase pull warning:", err);
      return null;
    }
  },

  /**
   * Push full local state to Supabase
   */
  async pushAllToSupabase(data: {
    workspaces: Workspace[];
    accounts: Account[];
    projects: Project[];
    issues: Issue[];
    habits: Habit[];
    tags: Tag[];
    folders: ProjectFolder[];
    workspaceId: string;
  }) {
    try {
      const wsRows = data.workspaces.map((w) => this.formatWorkspaceRow(w));
      const projRows = data.projects.map((p) => this.formatProjectRow(p, data.workspaceId));
      const issueRows = data.issues.map((i) => this.formatIssueRow(i, data.workspaceId));
      const habitRows = (data.habits || []).map((h) => this.formatHabitRow(h, data.workspaceId));
      const tagRows = (data.tags || []).map((t) => this.formatTagRow(t, data.workspaceId));
      const folderRows = (data.folders || []).map((f) => this.formatFolderRow(f, data.workspaceId));

      const milestoneRows: any[] = [];
      data.projects.forEach((p) => {
        (p.milestones || []).forEach((m) => {
          milestoneRows.push(this.formatMilestoneRow(m, p.id));
        });
      });

      const apiRes = await this.callApiSync("bulk_sync", {
        workspaces: wsRows,
        projects: projRows,
        milestones: milestoneRows,
        issues: issueRows,
        habits: habitRows,
        tags: tagRows,
        folders: folderRows,
      });

      if (apiRes && apiRes.success) {
        return { success: true };
      }

      // Fallback
      if (wsRows.length > 0) await supabase.from("workspaces").upsert(wsRows);
      if (projRows.length > 0) await supabase.from("projects").upsert(projRows);
      if (milestoneRows.length > 0) await supabase.from("project_milestones").upsert(milestoneRows);
      if (issueRows.length > 0) await supabase.from("issues").upsert(issueRows);
      if (habitRows.length > 0) await supabase.from("habits").upsert(habitRows);
      if (tagRows.length > 0) await supabase.from("tags").upsert(tagRows);
      if (folderRows.length > 0) await supabase.from("project_folders").upsert(folderRows);

      return { success: true };
    } catch (err: any) {
      console.warn("Supabase push error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * General syncRecord helper for backwards compatibility
   */
  async syncRecord(table: string, action: "upsert" | "delete", record: any) {
    // Ignore non-existent tables safely
    if (table === "timeline_events" || table === "trash") {
      return;
    }
    try {
      if (action === "upsert") {
        await supabase.from(table).upsert(record);
      } else if (action === "delete") {
        await supabase.from(table).delete().eq("id", record.id);
      }
    } catch (err) {
      console.warn(`Supabase background sync notice for ${table}:`, err);
    }
  },

  /**
   * Subscribe to Postgres Realtime Changes across projects, issues, workspaces, invitations, members and notifications
   */
  subscribeToRealtime(
    onProjectChange: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onIssueChange: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onWorkspaceChange: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onInviteChange?: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onMemberChange?: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onNotificationChange?: (type: "INSERT" | "UPDATE" | "DELETE", row: any) => void,
    onAnyChange?: (table: string, type: "INSERT" | "UPDATE" | "DELETE", row: any) => void
  ) {
    const channel = supabase
      .channel("chrono-global-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          onProjectChange(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("projects", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        (payload) => {
          onIssueChange(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("issues", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspaces" },
        (payload) => {
          onWorkspaceChange(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("workspaces", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_invitations" },
        (payload) => {
          onInviteChange?.(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("workspace_invitations", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_members" },
        (payload) => {
          onMemberChange?.(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("workspace_members", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_notifications" },
        (payload) => {
          onNotificationChange?.(payload.eventType as any, payload.new || payload.old);
          onAnyChange?.("workspace_notifications", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_milestones" },
        (payload) => {
          onAnyChange?.("project_milestones", payload.eventType as any, payload.new || payload.old);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "habits" },
        (payload) => {
          onAnyChange?.("habits", payload.eventType as any, payload.new || payload.old);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Supabase Realtime] Streaming attivo per tutte le tabelle.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
