#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Resolve environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(projectRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(projectRoot, ".env"), quiet: true });

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseKey) {
  console.error(
    "[Chrono MCP] Warning: SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined."
  );
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to resolve fallback workspace ID
async function getDefaultWorkspaceId(providedWorkspaceId?: string): Promise<string> {
  if (providedWorkspaceId && providedWorkspaceId.trim()) {
    return providedWorkspaceId.trim();
  }
  const { data: wsWithProjects } = await supabase
    .from("projects")
    .select("workspace_id")
    .limit(1)
    .maybeSingle();

  if (wsWithProjects?.workspace_id) {
    return wsWithProjects.workspace_id;
  }

  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id || "ws-1";
}

// Helper to format JSON responses for MCP tools
function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorResult(message: string) {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
  };
}

// Instantiate MCP Server
const server = new McpServer({
  name: "chrono-mcp",
  version: "1.0.0",
});

/* ========================================================================== */
/* 1. WORKSPACE TOOLS                                                         */
/* ========================================================================== */

server.tool(
  "list_workspaces",
  "List all workspaces available in Chrono",
  {},
  async () => {
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, identifier, internal_id, name, slug, plan, icon, created_at, updated_at")
        .order("created_at", { ascending: true });

      if (error) return errorResult(error.message);
      return jsonResult(data || []);
    } catch (err: any) {
      return errorResult(err?.message || "Failed to list workspaces");
    }
  }
);

server.tool(
  "get_workspace",
  "Get details, statistics, and counts of a workspace by ID or slug",
  {
    workspaceId: z.string().optional().describe("Workspace ID (e.g. ws-1)"),
    slug: z.string().optional().describe("Workspace slug (e.g. chrono-core)"),
  },
  async ({ workspaceId, slug }) => {
    try {
      let query = supabase.from("workspaces").select("*");
      if (workspaceId) {
        query = query.eq("id", workspaceId);
      } else if (slug) {
        query = query.eq("slug", slug);
      } else {
        const defaultId = await getDefaultWorkspaceId();
        query = query.eq("id", defaultId);
      }

      const { data: ws, error: wsErr } = await query.maybeSingle();
      if (wsErr) return errorResult(wsErr.message);
      if (!ws) return errorResult("Workspace not found");

      const [projectsRes, issuesRes, membersRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", ws.id),
        supabase.from("issues").select("id", { count: "exact", head: true }).eq("workspace_id", ws.id),
        supabase.from("workspace_members").select("id", { count: "exact", head: true }).eq("workspace_id", ws.id),
      ]);

      return jsonResult({
        ...ws,
        stats: {
          totalProjects: projectsRes.count || 0,
          totalIssues: issuesRes.count || 0,
          totalMembers: membersRes.count || 0,
        },
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to get workspace");
    }
  }
);

/* ========================================================================== */
/* 2. PROJECT TOOLS                                                           */
/* ========================================================================== */

server.tool(
  "list_projects",
  "List projects in a workspace with optional filters for status, priority, and search keyword",
  {
    workspaceId: z.string().optional().describe("Workspace ID. Defaults to active workspace"),
    status: z
      .enum(["Planned", "In Progress", "Completed", "Backlog", "Paused", "Canceled"])
      .optional()
      .describe("Filter by project status"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("Filter by project priority"),
    search: z.string().optional().describe("Search term matching project name or summary"),
    limit: z.number().optional().default(50).describe("Max items to return (default 50)"),
  },
  async ({ workspaceId, status, priority, search, limit }) => {
    try {
      let query = supabase
        .from("projects")
        .select(
          "id, identifier, internal_id, workspace_id, name, slug, summary, status, priority, start_date, target_date, icon, icon_bg, icon_color, created_at, updated_at"
        )
        .order("created_at", { ascending: false })
        .limit(limit || 50);

      if (workspaceId && workspaceId.trim()) {
        query = query.eq("workspace_id", workspaceId.trim());
      }
      if (status) query = query.eq("status", status);
      if (priority) query = query.eq("priority", priority);
      if (search && search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) return errorResult(error.message);

      return jsonResult({
        workspaceId: workspaceId || "all",
        count: data?.length || 0,
        projects: data || [],
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to list projects");
    }
  }
);

server.tool(
  "get_project",
  "Get complete details of a project by ID or slug, including milestones and issues breakdown",
  {
    projectId: z.string().describe("Project ID (e.g. proj-casd-1) or project slug"),
  },
  async ({ projectId }) => {
    try {
      let query = supabase.from("projects").select("*");
      if (projectId.startsWith("proj-") || projectId.includes("-")) {
        query = query.or(`id.eq.${projectId},slug.eq.${projectId}`);
      } else {
        query = query.eq("id", projectId);
      }

      const { data: project, error: pErr } = await query.maybeSingle();
      if (pErr) return errorResult(pErr.message);
      if (!project) return errorResult(`Project '${projectId}' not found`);

      const [milestonesRes, issuesRes, linksRes] = await Promise.all([
        supabase
          .from("project_milestones")
          .select("id, name, target_date, completed, sort_order")
          .eq("project_id", project.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("issues")
          .select("id, status")
          .eq("project_id", project.id),
        supabase
          .from("project_links")
          .select("id, title, url, category")
          .eq("project_id", project.id),
      ]);

      const issues = issuesRes.data || [];
      const issuesBreakdown = {
        total: issues.length,
        done: issues.filter((i) => i.status === "done").length,
        inProgress: issues.filter((i) => i.status === "in_progress").length,
        todo: issues.filter((i) => i.status === "todo").length,
        backlog: issues.filter((i) => i.status === "backlog").length,
        canceled: issues.filter((i) => i.status === "canceled").length,
      };

      return jsonResult({
        ...project,
        milestones: milestonesRes.data || [],
        links: linksRes.data || [],
        issuesCount: issuesBreakdown,
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to get project");
    }
  }
);

server.tool(
  "create_project",
  "Create a new project in Chrono",
  {
    name: z.string().describe("Project name"),
    workspaceId: z.string().optional().describe("Workspace ID (defaults to active workspace)"),
    summary: z.string().optional().describe("Short one-line summary"),
    description: z.string().optional().describe("Full markdown description"),
    status: z
      .enum(["Planned", "In Progress", "Completed", "Backlog", "Paused", "Canceled"])
      .optional()
      .default("Planned"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .default("medium"),
    startDate: z.string().optional().describe("ISO date string for start date"),
    targetDate: z.string().optional().describe("ISO date string for target deadline"),
    leadId: z.string().optional().describe("Account ID of project lead"),
    icon: z.string().optional().describe("Icon symbol or letter"),
  },
  async ({
    name,
    workspaceId,
    summary,
    description,
    status,
    priority,
    startDate,
    targetDate,
    leadId,
    icon,
  }) => {
    try {
      const wsId = await getDefaultWorkspaceId(workspaceId);
      const id = `proj-${crypto.randomBytes(4).toString("hex")}`;
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `project-${Date.now()}`;
      const identifier = `PRJ-${Math.floor(100 + Math.random() * 900)}`;

      const newProject = {
        id,
        identifier,
        internal_id: `prj_${id}`,
        workspace_id: wsId,
        team_id: "team-1",
        name,
        slug,
        summary: summary || null,
        description: description || null,
        status: status || "Planned",
        priority: priority || "medium",
        start_date: startDate || new Date().toISOString(),
        target_date: targetDate || null,
        lead_id: leadId || null,
        icon: icon || name.charAt(0).toUpperCase() || "P",
        icon_bg: "#121419",
        icon_color: "#5e6ad2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single();

      if (error) return errorResult(error.message);
      return jsonResult({ message: "Project created successfully", project: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to create project");
    }
  }
);

server.tool(
  "update_project",
  "Update an existing project by ID",
  {
    projectId: z.string().describe("Project ID to update"),
    name: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional(),
    status: z
      .enum(["Planned", "In Progress", "Completed", "Backlog", "Paused", "Canceled"])
      .optional(),
    priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    leadId: z.string().optional(),
  },
  async ({
    projectId,
    name,
    summary,
    description,
    status,
    priority,
    startDate,
    targetDate,
    leadId,
  }) => {
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (name !== undefined) updates.name = name;
      if (summary !== undefined) updates.summary = summary;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (startDate !== undefined) updates.start_date = startDate;
      if (targetDate !== undefined) updates.target_date = targetDate;
      if (leadId !== undefined) updates.lead_id = leadId;

      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .select()
        .single();

      if (error) return errorResult(error.message);
      if (!data) return errorResult(`Project '${projectId}' not found`);

      return jsonResult({ message: "Project updated successfully", project: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to update project");
    }
  }
);

server.tool(
  "delete_project",
  "Delete a project and its associated milestones",
  {
    projectId: z.string().describe("Project ID to delete"),
  },
  async ({ projectId }) => {
    try {
      await supabase.from("project_milestones").delete().eq("project_id", projectId);
      await supabase.from("project_links").delete().eq("project_id", projectId);
      const { error } = await supabase.from("projects").delete().eq("id", projectId);

      if (error) return errorResult(error.message);
      return jsonResult({ message: `Project '${projectId}' and associated milestones deleted.` });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to delete project");
    }
  }
);

/* ========================================================================== */
/* 3. ISSUE TOOLS                                                             */
/* ========================================================================== */

server.tool(
  "list_issues",
  "List issues with optional filters for workspace, project, status, priority, assignee, and search",
  {
    workspaceId: z.string().optional().describe("Workspace ID (defaults to active workspace)"),
    projectId: z.string().optional().describe("Filter by project ID"),
    status: z
      .enum(["backlog", "todo", "in_progress", "done", "canceled"])
      .optional()
      .describe("Filter by issue status"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .describe("Filter by issue priority"),
    assigneeId: z.string().optional().describe("Filter by assignee account ID"),
    quadrant: z
      .enum(["q1", "q2", "q3", "q4"])
      .optional()
      .describe("Filter by Eisenhower quadrant"),
    search: z.string().optional().describe("Search term matching issue title"),
    limit: z.number().optional().default(50).describe("Max issues to return (default 50)"),
  },
  async ({
    workspaceId,
    projectId,
    status,
    priority,
    assigneeId,
    quadrant,
    search,
    limit,
  }) => {
    try {
      let query = supabase
        .from("issues")
        .select(
          "id, identifier, internal_id, workspace_id, title, status, priority, project_id, assignee_id, estimate, due_date, eisenhower_quadrant, labels, created_at, updated_at"
        )
        .order("created_at", { ascending: false })
        .limit(limit || 50);

      if (workspaceId && workspaceId.trim()) {
        query = query.eq("workspace_id", workspaceId.trim());
      }
      if (projectId) query = query.eq("project_id", projectId);
      if (status) query = query.eq("status", status);
      if (priority) query = query.eq("priority", priority);
      if (assigneeId) query = query.eq("assignee_id", assigneeId);
      if (quadrant) query = query.eq("eisenhower_quadrant", quadrant);
      if (search && search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) return errorResult(error.message);

      return jsonResult({
        workspaceId: workspaceId || "all",
        count: data?.length || 0,
        issues: data || [],
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to list issues");
    }
  }
);

server.tool(
  "get_issue",
  "Get complete details of a single issue by ID or identifier (e.g. 'FIR-1')",
  {
    issueId: z.string().describe("Issue ID (e.g. issue-1) or identifier (e.g. FIR-1)"),
  },
  async ({ issueId }) => {
    try {
      let query = supabase.from("issues").select("*");
      if (issueId.includes("-") && !issueId.startsWith("issue-")) {
        query = query.or(`identifier.eq.${issueId},id.eq.${issueId}`);
      } else {
        query = query.eq("id", issueId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) return errorResult(error.message);
      if (!data) return errorResult(`Issue '${issueId}' not found`);

      return jsonResult(data);
    } catch (err: any) {
      return errorResult(err?.message || "Failed to get issue");
    }
  }
);

server.tool(
  "create_issue",
  "Create a new issue/task in Chrono",
  {
    title: z.string().describe("Issue title"),
    workspaceId: z.string().optional().describe("Workspace ID (defaults to active workspace)"),
    projectId: z.string().optional().describe("Associated Project ID"),
    description: z.string().optional().describe("Detailed markdown description"),
    status: z
      .enum(["backlog", "todo", "in_progress", "done", "canceled"])
      .optional()
      .default("todo"),
    priority: z
      .enum(["urgent", "high", "medium", "low", "none"])
      .optional()
      .default("none"),
    assigneeId: z.string().optional().describe("Account ID assigned to the task"),
    estimate: z.number().optional().describe("Story points estimate (1, 2, 3, 5, 8)"),
    dueDate: z.string().optional().describe("ISO due date string"),
    labels: z.array(z.string()).optional().describe("List of label strings"),
    quadrant: z
      .enum(["q1", "q2", "q3", "q4"])
      .optional()
      .describe("Eisenhower matrix quadrant"),
  },
  async ({
    title,
    workspaceId,
    projectId,
    description,
    status,
    priority,
    assigneeId,
    estimate,
    dueDate,
    labels,
    quadrant,
  }) => {
    try {
      const wsId = await getDefaultWorkspaceId(workspaceId);
      const id = `issue-${crypto.randomBytes(4).toString("hex")}`;
      const identifier = `FIR-${Math.floor(100 + Math.random() * 900)}`;

      const newIssue = {
        id,
        identifier,
        internal_id: `iss_${id}`,
        workspace_id: wsId,
        team_id: "team-1",
        project_id: projectId || null,
        title,
        description: description || null,
        status: status || "todo",
        priority: priority || "none",
        assignee_id: assigneeId || null,
        estimate: estimate || null,
        due_date: dueDate || null,
        labels: labels || [],
        eisenhower_quadrant: quadrant || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("issues")
        .insert(newIssue)
        .select()
        .single();

      if (error) return errorResult(error.message);
      return jsonResult({ message: "Issue created successfully", issue: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to create issue");
    }
  }
);

server.tool(
  "update_issue",
  "Update an existing issue's status, priority, title, description, or assignment",
  {
    issueId: z.string().describe("Issue ID (e.g. issue-1) or identifier (e.g. FIR-1)"),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z
      .enum(["backlog", "todo", "in_progress", "done", "canceled"])
      .optional(),
    priority: z.enum(["urgent", "high", "medium", "low", "none"]).optional(),
    projectId: z.string().optional(),
    assigneeId: z.string().optional(),
    estimate: z.number().optional(),
    dueDate: z.string().optional(),
    labels: z.array(z.string()).optional(),
    quadrant: z.enum(["q1", "q2", "q3", "q4"]).optional(),
  },
  async ({
    issueId,
    title,
    description,
    status,
    priority,
    projectId,
    assigneeId,
    estimate,
    dueDate,
    labels,
    quadrant,
  }) => {
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) {
        updates.status = status;
        if (status === "done") updates.completed_at = new Date().toISOString();
      }
      if (priority !== undefined) updates.priority = priority;
      if (projectId !== undefined) updates.project_id = projectId;
      if (assigneeId !== undefined) updates.assignee_id = assigneeId;
      if (estimate !== undefined) updates.estimate = estimate;
      if (dueDate !== undefined) updates.due_date = dueDate;
      if (labels !== undefined) updates.labels = labels;
      if (quadrant !== undefined) updates.eisenhower_quadrant = quadrant;

      let query = supabase.from("issues").update(updates);
      if (issueId.includes("-") && !issueId.startsWith("issue-")) {
        query = query.or(`identifier.eq.${issueId},id.eq.${issueId}`);
      } else {
        query = query.eq("id", issueId);
      }

      const { data, error } = await query.select().single();
      if (error) return errorResult(error.message);
      if (!data) return errorResult(`Issue '${issueId}' not found`);

      return jsonResult({ message: "Issue updated successfully", issue: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to update issue");
    }
  }
);

server.tool(
  "delete_issue",
  "Delete an issue by ID or identifier",
  {
    issueId: z.string().describe("Issue ID or identifier to delete"),
  },
  async ({ issueId }) => {
    try {
      let query = supabase.from("issues").delete();
      if (issueId.includes("-") && !issueId.startsWith("issue-")) {
        query = query.or(`identifier.eq.${issueId},id.eq.${issueId}`);
      } else {
        query = query.eq("id", issueId);
      }

      const { error } = await query;
      if (error) return errorResult(error.message);
      return jsonResult({ message: `Issue '${issueId}' deleted successfully.` });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to delete issue");
    }
  }
);

/* ========================================================================== */
/* 4. MILESTONE TOOLS                                                         */
/* ========================================================================== */

server.tool(
  "list_milestones",
  "List all milestones for a specific project",
  {
    projectId: z.string().describe("Project ID"),
  },
  async ({ projectId }) => {
    try {
      const { data, error } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });

      if (error) return errorResult(error.message);
      return jsonResult(data || []);
    } catch (err: any) {
      return errorResult(err?.message || "Failed to list milestones");
    }
  }
);

server.tool(
  "create_milestone",
  "Add a new milestone to a project",
  {
    projectId: z.string().describe("Project ID to attach the milestone to"),
    name: z.string().describe("Milestone title / deliverable"),
    targetDate: z.string().optional().describe("ISO target date string"),
    completed: z.boolean().optional().default(false),
    sortOrder: z.number().optional().default(1),
  },
  async ({ projectId, name, targetDate, completed, sortOrder }) => {
    try {
      const id = `ms-${crypto.randomBytes(4).toString("hex")}`;
      const newMilestone = {
        id,
        project_id: projectId,
        name,
        target_date: targetDate || null,
        completed: Boolean(completed),
        sort_order: sortOrder || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("project_milestones")
        .insert(newMilestone)
        .select()
        .single();

      if (error) return errorResult(error.message);
      return jsonResult({ message: "Milestone created successfully", milestone: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to create milestone");
    }
  }
);

server.tool(
  "update_milestone",
  "Update a milestone's completion status, target date, or name",
  {
    milestoneId: z.string().describe("Milestone ID"),
    name: z.string().optional(),
    completed: z.boolean().optional(),
    targetDate: z.string().optional(),
  },
  async ({ milestoneId, name, completed, targetDate }) => {
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (name !== undefined) updates.name = name;
      if (completed !== undefined) updates.completed = completed;
      if (targetDate !== undefined) updates.target_date = targetDate;

      const { data, error } = await supabase
        .from("project_milestones")
        .update(updates)
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) return errorResult(error.message);
      if (!data) return errorResult(`Milestone '${milestoneId}' not found`);

      return jsonResult({ message: "Milestone updated successfully", milestone: data });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to update milestone");
    }
  }
);

/* ========================================================================== */
/* 5. MEMBERS & SUMMARY TOOLS                                                 */
/* ========================================================================== */

server.tool(
  "list_members",
  "List all members and their roles in a workspace",
  {
    workspaceId: z.string().optional().describe("Workspace ID (defaults to active workspace)"),
  },
  async ({ workspaceId }) => {
    try {
      const wsId = await getDefaultWorkspaceId(workspaceId);
      const { data: members, error: mErr } = await supabase
        .from("workspace_members")
        .select("id, workspace_id, account_id, role, joined_at")
        .eq("workspace_id", wsId);

      if (mErr) return errorResult(mErr.message);

      const accountIds = (members || []).map((m) => m.account_id);
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, name, username, email, avatar_url, role")
        .in("id", accountIds);

      const accountsMap = new Map((accounts || []).map((a) => [a.id, a]));
      const enrichedMembers = (members || []).map((m) => ({
        id: m.id,
        workspaceId: m.workspace_id,
        role: m.role,
        joinedAt: m.joined_at,
        account: accountsMap.get(m.account_id) || { id: m.account_id, name: "Unknown" },
      }));

      return jsonResult({
        workspaceId: wsId,
        count: enrichedMembers.length,
        members: enrichedMembers,
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to list members");
    }
  }
);

server.tool(
  "get_workspace_summary",
  "Get an executive summary of the workspace: active projects, pending issues by status, urgent priorities, and milestones",
  {
    workspaceId: z.string().optional().describe("Workspace ID (defaults to active workspace)"),
  },
  async ({ workspaceId }) => {
    try {
      const wsId = await getDefaultWorkspaceId(workspaceId);

      const [wsRes, projectsRes, issuesRes] = await Promise.all([
        supabase.from("workspaces").select("id, name, slug, plan").eq("id", wsId).maybeSingle(),
        supabase.from("projects").select("id, name, status, priority, target_date").eq("workspace_id", wsId),
        supabase.from("issues").select("id, identifier, title, status, priority, due_date").eq("workspace_id", wsId),
      ]);

      const projects = projectsRes.data || [];
      const issues = issuesRes.data || [];

      const activeProjects = projects.filter((p) => p.status === "In Progress" || p.status === "Planned");
      const urgentIssues = issues.filter((i) => i.priority === "urgent" && i.status !== "done" && i.status !== "canceled");

      const issuesByStatus = {
        todo: issues.filter((i) => i.status === "todo").length,
        in_progress: issues.filter((i) => i.status === "in_progress").length,
        backlog: issues.filter((i) => i.status === "backlog").length,
        done: issues.filter((i) => i.status === "done").length,
        canceled: issues.filter((i) => i.status === "canceled").length,
        total: issues.length,
      };

      return jsonResult({
        workspace: wsRes.data,
        metrics: {
          totalProjects: projects.length,
          activeProjectsCount: activeProjects.length,
          issuesByStatus,
          urgentOpenIssuesCount: urgentIssues.length,
        },
        activeProjects: activeProjects.slice(0, 10),
        urgentOpenIssues: urgentIssues.slice(0, 10),
      });
    } catch (err: any) {
      return errorResult(err?.message || "Failed to generate workspace summary");
    }
  }
);

/* ========================================================================== */
/* SERVER STARTUP & TRANSPORT                                                 */
/* ========================================================================== */

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Chrono MCP Server] Connected to stdio transport and ready for requests.");
}

main().catch((err) => {
  console.error("[Chrono MCP Server] Fatal startup error:", err);
  process.exit(1);
});
