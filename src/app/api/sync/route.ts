import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL and SUPABASE_SECRET_KEY environment variables");
}

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let workspaceId = await resolveWorkspaceId(action, payload);
    if (action === "pull_all" && !workspaceId) {
      const { data: defaultMembership } = await supabaseServer
        .from("workspace_members")
        .select("workspace_id")
        .eq("account_id", auth.accountId)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      workspaceId = defaultMembership?.workspace_id || null;
    }
    if (action === "pull_all" && workspaceId && payload) {
      payload.workspace_id = workspaceId;
    }

    const workspaceAdminActions = new Set(["upsert_account", "upsert_workspace"]);
    if (!workspaceId && !workspaceAdminActions.has(action) && action !== "pull_all") {
      return NextResponse.json({ error: "Workspace scope is required" }, { status: 400 });
    }

    if (action === "upsert_workspace") {
      const { data: existingWorkspace } = await supabaseServer
        .from("workspaces")
        .select("id")
        .eq("id", payload.id)
        .maybeSingle();

      if (existingWorkspace) {
        const isMember = await hasWorkspaceAccess(payload.id, auth.accountId);
        if (!isMember) {
          return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
        }
      } else {
        // Prevent unauthorized/uninvited users from creating arbitrary workspaces.
        // Allowed only if the user is already an owner or admin of an existing workspace,
        // or if there are zero workspaces in the system (initial bootstrap).
        const { count: totalWorkspaces } = await supabaseServer
          .from("workspaces")
          .select("id", { count: "exact", head: true });

        if ((totalWorkspaces || 0) > 0) {
          const { data: userMemberships } = await supabaseServer
            .from("workspace_members")
            .select("role")
            .eq("account_id", auth.accountId);

          const canCreate = (userMemberships || []).some(
            (m: any) => m.role === "owner" || m.role === "admin"
          );

          if (!canCreate) {
            return NextResponse.json(
              { error: "Accesso su invito: creazione di nuovi workspace consentita solo agli amministratori" },
              { status: 403 }
            );
          }
        }
      }
    } else if (workspaceId && action !== "pull_all") {
      const isMember = await hasWorkspaceAccess(workspaceId, auth.accountId);
      if (!isMember) {
        return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
      }
    } else if (action === "upsert_account") {
      const isSelf = payload.id === auth.accountId;
      if (!isSelf && !canManageAccounts(auth.role)) {
        return NextResponse.json({ error: "Workspace administration required" }, { status: 403 });
      }
    }

    if (["delete_workspace", "delete_account"].includes(action) && auth.role !== "owner") {
      return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    }

    switch (action) {
      // 1. PROJECTS
      case "upsert_project": {
        const projectRow = {
          ...payload,
          identifier: payload.identifier || `PRJ-${Math.floor(Math.random() * 9000 + 1000)}`,
          internal_id: payload.internal_id || `prj_${payload.id || Date.now()}`,
          workspace_id: payload.workspace_id || workspaceId,
          team_id: payload.team_id || "team-1",
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseServer.from("projects").upsert(projectRow);
        if (error) {
          console.error("[API Sync] upsert_project error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_project": {
        const { error } = await supabaseServer
          .from("projects")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_project error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 2. MILESTONES
      case "upsert_milestone": {
        const milestoneRow = {
          id: payload.id,
          project_id: payload.project_id,
          name: payload.name,
          target_date: payload.target_date || null,
          completed: Boolean(payload.completed),
          sort_order: payload.sort_order || 0,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseServer.from("project_milestones").upsert(milestoneRow);
        if (error) {
          console.error("[API Sync] upsert_milestone error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_milestone": {
        const { error } = await supabaseServer
          .from("project_milestones")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_milestone error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 3. ISSUES
      case "upsert_issue": {
        const issueRow = {
          ...payload,
          identifier: payload.identifier || `ISS-${Math.floor(Math.random() * 9000 + 1000)}`,
          internal_id: payload.internal_id || `iss_${payload.id || Date.now()}`,
          workspace_id: payload.workspace_id || workspaceId,
          team_id: payload.team_id || "team-1",
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseServer.from("issues").upsert(issueRow);
        if (error) {
          console.error("[API Sync] upsert_issue error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_issue": {
        const { error } = await supabaseServer
          .from("issues")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_issue error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 4. HABITS
      case "upsert_habit": {
        const habitRow = {
          id: payload.id,
          workspace_id: payload.workspace_id || workspaceId,
          account_id: payload.account_id || auth.accountId,
          title: payload.title,
          category: payload.category || "General",
          icon: payload.icon || "flame",
          color: payload.color || "#5e6ad2",
          frequency: payload.frequency || "daily",
          target_days: payload.target_days || [1, 2, 3, 4, 5, 6, 7],
          completed_dates: payload.completed_dates || [],
          streak: payload.streak || 0,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseServer.from("habits").upsert(habitRow);
        if (error) {
          console.error("[API Sync] upsert_habit error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_habit": {
        const { error } = await supabaseServer
          .from("habits")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_habit error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 5. TAGS
      case "upsert_tag": {
        const tagRow = {
          id: payload.id,
          workspace_id: payload.workspace_id || workspaceId,
          name: payload.name,
          color: payload.color || "#5e6ad2",
          description: payload.description || null,
        };
        const { error } = await supabaseServer.from("tags").upsert(tagRow);
        if (error) {
          console.error("[API Sync] upsert_tag error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_tag": {
        const { error } = await supabaseServer
          .from("tags")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_tag error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 6. PROJECT FOLDERS
      case "upsert_folder": {
        const folderRow = {
          id: payload.id,
          workspace_id: payload.workspace_id || workspaceId,
          name: payload.name,
          icon: payload.icon || "folder",
          color: payload.color || "#5e6ad2",
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabaseServer.from("project_folders").upsert(folderRow);
        if (error) {
          console.error("[API Sync] upsert_folder error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      case "delete_folder": {
        const { error } = await supabaseServer
          .from("project_folders")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_folder error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 7. WORKSPACES
      case "upsert_workspace": {
        const wsRow = {
          id: payload.id,
          identifier: payload.identifier || "WS-1",
          internal_id: payload.internal_id || `wrk_${payload.id}`,
          name: payload.name || "Nuovo Workspace",
          slug: payload.slug || `workspace-${Date.now()}`,
          icon: payload.icon || "chrono",
          icon_bg: payload.icon_bg || payload.iconBg || "#121419",
          icon_color: payload.icon_color || payload.iconColor || "#5e6ad2",
          plan: payload.plan || "Pro",
          updated_at: new Date().toISOString(),
        };

        const { error: wsError } = await supabaseServer.from("workspaces").upsert(wsRow);
        if (wsError) {
          console.error("[API Sync] upsert_workspace error:", wsError);
          return NextResponse.json({ error: wsError.message }, { status: 500 });
        }

        // Always register the creating user as owner in workspace_members
        const { error: memberError } = await supabaseServer.from("workspace_members").upsert(
          {
            workspace_id: payload.id,
            account_id: auth.accountId,
            role: "owner",
            joined_at: new Date().toISOString(),
          },
          { onConflict: "workspace_id,account_id" }
        );
        if (memberError) {
          console.warn("[API Sync] upsert_workspace member notice:", memberError.message);
        }

        // Ensure default team exists for this workspace
        const { data: existingTeam } = await supabaseServer
          .from("teams")
          .select("id")
          .eq("workspace_id", payload.id)
          .limit(1)
          .maybeSingle();

        if (!existingTeam) {
          const teamKey = (payload.name || "TEM")
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 3)
            .toUpperCase() || "TEM";

          await supabaseServer.from("teams").insert({
            id: `team-${payload.id}`,
            identifier: `TEM-${Date.now().toString().slice(-4)}`,
            internal_id: `team_${payload.id}`,
            name: payload.name || "Default Team",
            key: teamKey,
            icon: payload.icon || "zap",
            color: payload.icon_color || payload.iconColor || "#5e6ad2",
            workspace_id: payload.id,
          });
        }

        return NextResponse.json({ success: true, workspace: wsRow });
      }

      case "delete_workspace": {
        const { error } = await supabaseServer
          .from("workspaces")
          .delete()
          .eq("id", payload.id);
        if (error) {
          console.error("[API Sync] delete_workspace error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 8. ACCOUNTS
      case "upsert_account": {
        const accountRow: Record<string, any> = {
          id: payload.id,
          name: payload.name,
          username: payload.username,
          email: payload.email,
          avatar_url: payload.avatar_url !== undefined ? payload.avatar_url : (payload.avatarUrl !== undefined ? payload.avatarUrl : null),
          role: payload.role || "member",
        };
        if (payload.cover_url !== undefined || payload.coverUrl !== undefined) {
          accountRow.cover_url = payload.cover_url !== undefined ? payload.cover_url : payload.coverUrl;
        }
        if (payload.cover_gradient !== undefined || payload.coverGradient !== undefined) {
          accountRow.cover_gradient = payload.cover_gradient !== undefined ? payload.cover_gradient : payload.coverGradient;
        }
        if (payload.bio !== undefined) accountRow.bio = payload.bio;
        if (payload.department !== undefined) accountRow.department = payload.department;
        if (payload.title !== undefined) accountRow.title = payload.title;
        if (payload.location !== undefined) accountRow.location = payload.location;
        if (payload.phone !== undefined) accountRow.phone = payload.phone;
        if (payload.github !== undefined) accountRow.github = payload.github;
        if (payload.twitter !== undefined) accountRow.twitter = payload.twitter;
        if (payload.website !== undefined) accountRow.website = payload.website;

        const { error } = await supabaseServer.from("accounts").upsert(accountRow);
        if (error) {
          // If columns do not exist yet on remote Supabase instance, fall back to core schema
          if (error.message?.includes("column") || (error as any).code === "42703") {
            const fallbackRow = {
              id: payload.id,
              name: payload.name,
              username: payload.username,
              email: payload.email,
              avatar_url: accountRow.avatar_url,
              role: accountRow.role,
            };
            const fallbackRes = await supabaseServer.from("accounts").upsert(fallbackRow);
            if (fallbackRes.error) {
              console.error("[API Sync] upsert_account fallback error:", fallbackRes.error);
              return NextResponse.json({ error: fallbackRes.error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, notice: "Saved core profile" });
          }
          console.error("[API Sync] upsert_account error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 9. ACTIVITY LOG
      case "log_activity": {
        const { error } = await supabaseServer
          .from("activity_logs")
          .insert({
            action: payload.action,
            details: payload.details || payload.description || null,
            project_id: payload.project_id || null,
            issue_id: payload.issue_id || null,
            user_id: payload.user_id || null,
          });
        if (error) {
          console.warn("[API Sync] log_activity notice:", error.message);
        }
        return NextResponse.json({ success: true });
      }

      // 9. BULK SYNC (Push All)
      case "bulk_sync": {
        const { workspaces, projects, milestones, issues, habits, tags, folders } = payload;
        const results: Record<string, any> = {};

        // Order matters for FK constraints:
        // workspaces -> projects -> milestones -> issues -> rest

        if (workspaces && workspaces.length > 0) {
          const { error: wsErr } = await supabaseServer
            .from("workspaces")
            .upsert(workspaces);
          results.workspaces = wsErr ? wsErr.message : "ok";
        }

        if (projects && projects.length > 0) {
          const { error: prjErr } = await supabaseServer
            .from("projects")
            .upsert(projects);
          results.projects = prjErr ? prjErr.message : "ok";
        }

        if (milestones && milestones.length > 0) {
          const { error: msErr } = await supabaseServer
            .from("project_milestones")
            .upsert(milestones);
          results.milestones = msErr ? msErr.message : "ok";
        }

        if (issues && issues.length > 0) {
          // Build the set of project IDs that exist in this batch or already in DB
          const batchProjectIds = new Set((projects || []).map((p: any) => p.id));

          // Nullify project_id if the referenced project wasn't pushed in this batch
          // (it might already exist in DB, but to avoid FK errors on missing refs we clear it)
          const { data: existingProjects } = await supabaseServer
            .from("projects")
            .select("id");
          const dbProjectIds = new Set((existingProjects || []).map((p: any) => p.id));

          const safeIssues = issues.map((i: any) => ({
            ...i,
            project_id:
              i.project_id && (batchProjectIds.has(i.project_id) || dbProjectIds.has(i.project_id))
                ? i.project_id
                : null,
          }));

          const { error: issErr } = await supabaseServer
            .from("issues")
            .upsert(safeIssues);
          results.issues = issErr ? issErr.message : "ok";
        }

        if (habits && habits.length > 0) {
          const { error: hbErr } = await supabaseServer
            .from("habits")
            .upsert(habits);
          results.habits = hbErr ? hbErr.message : "ok";
        }

        if (tags && tags.length > 0) {
          const { error: tgErr } = await supabaseServer
            .from("tags")
            .upsert(tags);
          results.tags = tgErr ? tgErr.message : "ok";
        }

        if (folders && folders.length > 0) {
          const { error: fdErr } = await supabaseServer
            .from("project_folders")
            .upsert(folders);
          results.folders = fdErr ? fdErr.message : "ok";
        }

        return NextResponse.json({ success: true, results });
      }

      // 10. PROJECT BUNDLE - project, milestones and links in one request
      case "sync_project_bundle": {
        const { project, milestones = [], links = [] } = payload || {};
        if (!project?.id) {
          return NextResponse.json({ error: "Missing project" }, { status: 400 });
        }

        const { error: projectError } = await supabaseServer
          .from("projects")
          .upsert(project);
        if (projectError) {
          console.error("[API Sync] sync_project_bundle project error:", projectError);
          return NextResponse.json({ error: projectError.message }, { status: 500 });
        }

        const milestonePromise = milestones.length > 0
          ? supabaseServer.from("project_milestones").upsert(milestones)
          : Promise.resolve({ error: null });
        const linksPromise = (async () => {
          const { error: deleteError } = await supabaseServer
            .from("project_links")
            .delete()
            .eq("project_id", project.id);
          if (deleteError) return { error: deleteError };
          if (links.length === 0) return { error: null };
          return supabaseServer.from("project_links").insert(
            links.map((link: any) => ({
              id: link.id,
              project_id: project.id,
              title: link.title,
              url: link.url,
              category: link.category || "custom",
            })),
          );
        })();

        const [{ error: milestoneError }, { error: linksError }] = await Promise.all([
          milestonePromise,
          linksPromise,
        ]);
        const error = milestoneError || linksError;
        if (error) {
          console.error("[API Sync] sync_project_bundle child error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }

      // 11. PROJECT LINKS - replace all links for a project atomically
      case "sync_project_links": {
        const { project_id, links } = payload;
        if (!project_id) {
          return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
        }
        // Delete all existing links for the project, then insert the new set
        const { error: delErr } = await supabaseServer
          .from("project_links")
          .delete()
          .eq("project_id", project_id);
        if (delErr) {
          console.error("[API Sync] sync_project_links delete error:", delErr);
          return NextResponse.json({ error: delErr.message }, { status: 500 });
        }
        if (links && links.length > 0) {
          const rows = links.map((l: any) => ({
            id: l.id,
            project_id,
            title: l.title,
            url: l.url,
            category: l.category || "custom",
          }));
          const { error: insErr } = await supabaseServer
            .from("project_links")
            .insert(rows);
          if (insErr) {
            console.error("[API Sync] sync_project_links insert error:", insErr);
            return NextResponse.json({ error: insErr.message }, { status: 500 });
          }
        }
        return NextResponse.json({ success: true });
      }

      // 11. PULL ALL
      case "pull_all": {
        const workspaceFilter = payload?.workspace_id;
        const { data: userMemberships } = await supabaseServer
          .from("workspace_members")
          .select("workspace_id, role")
          .eq("account_id", auth.accountId);
        const memberWsIds = (userMemberships || []).map((m) => m.workspace_id);
        const roleByWsId = new Map((userMemberships || []).map((m) => [m.workspace_id, m.role]));

        // CRITICAL GUARD: If user has NO memberships, return completely empty state!
        // DO NOT auto-assign. DO NOT leak other workspaces.
        if (memberWsIds.length === 0) {
          return NextResponse.json({
            success: true,
            workspaces: [],
            projects: [],
            milestones: [],
            issues: [],
            habits: [],
            tags: [],
            folders: [],
            accounts: [],
            projectLinks: [],
          });
        }

        const effectiveWsIds = (workspaceFilter && memberWsIds.includes(workspaceFilter))
          ? [workspaceFilter]
          : memberWsIds;

        const [
          { data: workspaces },
          { data: projects },
          { data: issues },
          { data: habits },
          { data: tags },
          { data: folders },
        ] = await Promise.all([
          supabaseServer
            .from("workspaces")
            .select("id, identifier, internal_id, name, slug, icon, icon_bg, icon_color, plan, created_at, updated_at")
            .in("id", memberWsIds)
            .order("created_at", { ascending: true }),
          supabaseServer
            .from("projects")
            .select("id, identifier, internal_id, workspace_id, team_id, name, slug, summary, description, status, priority, lead_id, start_date, target_date, icon, icon_bg, icon_color, icon_symbol, icon_shape, cover_url, cover_gradient, parent_project_id, created_at, updated_at")
            .in("workspace_id", effectiveWsIds)
            .order("created_at", { ascending: false }),
          supabaseServer
            .from("issues")
            .select("id, identifier, internal_id, workspace_id, team_id, project_id, assignee_id, creator_id, title, description, status, priority, due_date, due_time, reminder_date, reminder_time, recurrence, recurrence_days, eisenhower_quadrant, labels, tags, estimate, sort_order, completed_at, created_at, updated_at")
            .in("workspace_id", effectiveWsIds)
            .order("created_at", { ascending: false })
            .limit(500),
          supabaseServer
            .from("habits")
            .select("id, workspace_id, account_id, title, category, icon, color, frequency, target_days, completed_dates, streak, created_at")
            .in("workspace_id", effectiveWsIds)
            .order("created_at", { ascending: false }),
          supabaseServer
            .from("tags")
            .select("id, workspace_id, name, color, description")
            .in("workspace_id", effectiveWsIds)
            .order("created_at", { ascending: true }),
          supabaseServer
            .from("project_folders")
            .select("id, workspace_id, name, icon, color, created_at")
            .in("workspace_id", effectiveWsIds)
            .order("created_at", { ascending: true }),
        ]);

        const projectIds = (projects || []).map((project) => project.id);
        const [{ data: milestones }, { data: projectLinks }, { data: memberAccounts }] = await Promise.all([
          projectIds.length > 0
            ? supabaseServer.from("project_milestones").select("id, project_id, name, target_date, completed, sort_order").in("project_id", projectIds).order("sort_order", { ascending: true }).order("target_date", { ascending: true })
            : Promise.resolve({ data: [] }),
          projectIds.length > 0
            ? supabaseServer.from("project_links").select("id, project_id, title, url, category").in("project_id", projectIds)
            : Promise.resolve({ data: [] }),
          supabaseServer.from("workspace_members").select("account_id").in("workspace_id", effectiveWsIds),
        ]);

        const accountIds = [...new Set((memberAccounts || []).map((m: any) => m.account_id))];
        const { data: accounts } = accountIds.length > 0
          ? await supabaseServer.from("accounts").select("*").in("id", accountIds)
          : { data: [] };

        const enrichedWorkspaces = (workspaces || []).map((ws) => ({
          ...ws,
          role: roleByWsId.get(ws.id) || "member",
        }));

        return NextResponse.json({
          success: true,
          workspaces: enrichedWorkspaces,
          projects: projects || [],
          milestones: milestones || [],
          issues: issues || [],
          habits: habits || [],
          tags: tags || [],
          folders: folders || [],
          accounts: accounts || [],
          projectLinks: projectLinks || [],
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[API Sync] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

type AuthContext = {
  accountId: string;
  role: string;
  email: string;
};

async function authenticateRequest(req: Request): Promise<AuthContext | null> {
  const authorization = req.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
  if (userError || !user?.email) return null;

  let { data: account, error: accountError } = await supabaseServer
    .from("accounts")
    .select("id, role, email")
    .ilike("email", user.email)
    .maybeSingle();

  if (!account) {
    const baseUsername = (user.email.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
    const { data: created } = await supabaseServer
      .from("accounts")
      .insert({
        name: user.user_metadata?.full_name || user.user_metadata?.name || baseUsername,
        username: `${baseUsername}_${randomBytes(3).toString("hex")}`,
        email: user.email,
        role: "member",
      })
      .select("id, role, email")
      .single();
    account = created;
  }

  if (!account) return null;
  return { accountId: account.id, role: account.role || "member", email: user.email };
}

function canManageAccounts(role: string) {
  return role === "owner" || role === "admin";
}

async function hasWorkspaceAccess(workspaceId: string, accountId: string): Promise<boolean> {
  if (!workspaceId || !accountId) return false;
  const { data, error } = await supabaseServer
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("account_id", accountId)
    .maybeSingle();

  return !error && Boolean(data);
}


async function resolveWorkspaceId(action: string, payload: any): Promise<string | null> {
  const directWorkspaceId = payload?.workspace_id || payload?.project?.workspace_id;
  if (directWorkspaceId) return directWorkspaceId;

  if (action === "pull_all") return payload?.workspace_id || null;
  if (action === "upsert_workspace" || action === "delete_workspace") return payload?.id || null;

  const id = payload?.id;
  if (["upsert_project", "delete_project", "sync_project_bundle"].includes(action)) {
    if (action === "sync_project_bundle") return payload?.project?.workspace_id || null;
    return lookupWorkspaceId("projects", id);
  }
  if (["upsert_issue", "delete_issue"].includes(action)) return lookupWorkspaceId("issues", id);
  if (["upsert_habit", "delete_habit"].includes(action)) return lookupWorkspaceId("habits", id);
  if (["upsert_tag", "delete_tag"].includes(action)) return lookupWorkspaceId("tags", id);
  if (["upsert_folder", "delete_folder"].includes(action)) return lookupWorkspaceId("project_folders", id);

  if (["upsert_milestone", "delete_milestone"].includes(action)) {
    if (action === "upsert_milestone" && payload?.project_id) {
      return lookupWorkspaceId("projects", payload.project_id);
    }
    const { data } = await supabaseServer
      .from("project_milestones")
      .select("project_id")
      .eq("id", id)
      .maybeSingle();
    return data?.project_id ? lookupWorkspaceId("projects", data.project_id) : null;
  }

  if (action === "sync_project_links") {
    return lookupWorkspaceId("projects", payload?.project_id);
  }

  if (action === "log_activity") {
    if (payload?.workspace_id) return payload.workspace_id;
    if (payload?.project_id) return lookupWorkspaceId("projects", payload.project_id);
    if (payload?.issue_id) return lookupWorkspaceId("issues", payload.issue_id);
  }

  if (action === "bulk_sync") {
    const workspaceIds = new Set<string>();
    for (const collection of [payload?.projects, payload?.issues, payload?.habits, payload?.tags, payload?.folders]) {
      for (const row of collection || []) {
        if (row.workspace_id) workspaceIds.add(row.workspace_id);
      }
    }
    if (workspaceIds.size > 1) {
      throw new Error("Bulk sync cannot span multiple workspaces");
    }
    return [...workspaceIds][0] || null;
  }

  return null;
}

async function lookupWorkspaceId(table: string, id?: string) {
  if (!id) return null;
  const { data } = await supabaseServer.from(table).select("workspace_id").eq("id", id).maybeSingle();
  return data?.workspace_id || null;
}
