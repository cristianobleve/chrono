const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function seedDatabase() {
  console.log("🌱 Starting complete Supabase database seeding for Chrono Platform...\n");

  try {
    // 1. WORKSPACES
    console.log("1. Seeding Workspaces...");
    const workspaces = [
      {
        id: "ws-1",
        identifier: "WS-1",
        internal_id: "wrk_chrono_core",
        name: "Chrono Engineering",
        slug: "chrono-core",
        icon: "chrono",
        icon_bg: "#121419",
        icon_color: "#5e6ad2",
        plan: "Pro",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ws-2",
        identifier: "WS-2",
        internal_id: "wrk_acme_labs",
        name: "Acme Studio & Labs",
        slug: "acme-studio",
        icon: "A",
        icon_bg: "#062316",
        icon_color: "#34d399",
        plan: "Enterprise",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "ws-3",
        identifier: "WS-3",
        internal_id: "wrk_personal_space",
        name: "Personal Workspace",
        slug: "personal-space",
        icon: "P",
        icon_bg: "#231206",
        icon_color: "#f59e0b",
        plan: "Free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const { error: wsErr } = await supabase.from("workspaces").upsert(workspaces);
    if (wsErr) console.error("Workspaces error:", wsErr);
    else console.log(`   ✅ ${workspaces.length} workspaces seeded.`);

    // 2. ACCOUNTS
    console.log("2. Seeding Accounts...");
    const accounts = [
      {
        id: "user-1",
        identifier: "ACC-1",
        internal_id: "acc_cristiano_01",
        name: "Cristiano Bleve",
        username: "cristianobleve",
        email: "blevecristiano2018@gmail.com",
        role: "owner",
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "user-2",
        identifier: "ACC-2",
        internal_id: "acc_sarah_ai",
        name: "Sarah Connor",
        username: "sarah_connor",
        email: "sarah.connor@chrono.engineering",
        role: "admin",
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "user-3",
        identifier: "ACC-3",
        internal_id: "acc_alex_dev",
        name: "Alex Vance",
        username: "alex_vance",
        email: "alex.vance@blackmesa.org",
        role: "member",
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const { error: accErr } = await supabase.from("accounts").upsert(accounts);
    if (accErr) console.error("Accounts error:", accErr);
    else console.log(`   ✅ ${accounts.length} accounts seeded.`);

    // 3. WORKSPACE MEMBERS
    console.log("3. Seeding Workspace Members...");
    const members = [
      { id: "wm-1", workspace_id: "ws-1", account_id: "user-1", role: "owner" },
      { id: "wm-2", workspace_id: "ws-1", account_id: "user-2", role: "admin" },
      { id: "wm-3", workspace_id: "ws-2", account_id: "user-1", role: "owner" },
      { id: "wm-4", workspace_id: "ws-2", account_id: "user-3", role: "member" },
      { id: "wm-5", workspace_id: "ws-3", account_id: "user-1", role: "owner" },
    ];
    const { error: wmErr } = await supabase.from("workspace_members").upsert(members);
    if (wmErr) console.error("Workspace members error:", wmErr);
    else console.log(`   ✅ ${members.length} workspace memberships linked.`);

    // 4. TEAMS
    console.log("4. Seeding Teams...");
    const teams = [
      {
        id: "team-1",
        identifier: "TEM-1",
        internal_id: "team_first_01",
        name: "First",
        key: "FIR",
        icon: "zap",
        color: "#5e6ad2",
        workspace_id: "ws-1",
      },
      {
        id: "team-2",
        identifier: "TEM-2",
        internal_id: "team_acme_01",
        name: "Acme Studio",
        key: "ACM",
        icon: "layers",
        color: "#34d399",
        workspace_id: "ws-2",
      },
    ];
    const { error: tmErr } = await supabase.from("teams").upsert(teams);
    if (tmErr) console.error("Teams error:", tmErr);
    else console.log(`   ✅ ${teams.length} teams seeded.`);

    // 5. PROJECT FOLDERS / LISTS
    console.log("5. Seeding Project Folders / Lists...");
    const folders = [
      { id: "folder-core", workspace_id: "ws-1", name: "Core Platform", icon: "box", color: "#5e6ad2" },
      { id: "folder-ai", workspace_id: "ws-1", name: "AI & Autonomous Systems", icon: "sparkles", color: "#c084fc" },
      { id: "folder-infra", workspace_id: "ws-1", name: "Cloud Infrastructure", icon: "server", color: "#34d399" },
    ];
    const { error: fldErr } = await supabase.from("project_folders").upsert(folders);
    if (fldErr) console.error("Folders error:", fldErr);
    else console.log(`   ✅ ${folders.length} project folders seeded.`);

    // 6. PROJECTS
    console.log("6. Seeding Projects...");
    const projects = [
      {
        id: "proj-casd-1",
        identifier: "PRJ-1",
        internal_id: "prj_casd_7b27a4",
        workspace_id: "ws-1",
        team_id: "team-1",
        folder_id: "folder-core",
        name: "CASD — Autonomous Distributed System",
        slug: "casd-7b27a4e7f59c",
        summary: "High-performance decentralized coordination protocol.",
        description: "# CASD Architecture Overview\n\nModular distributed state machine with Raft consensus and zero-downtime hot reloading.",
        status: "In Progress",
        priority: "high",
        lead_id: "user-1",
        icon: "A",
        icon_bg: "#062316",
        icon_color: "#34d399",
        cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
        target_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        start_date: new Date().toISOString(),
      },
      {
        id: "proj-agent-2",
        identifier: "PRJ-2",
        internal_id: "prj_agent_99fa12",
        workspace_id: "ws-1",
        team_id: "team-1",
        folder_id: "folder-ai",
        name: "Chrono AI Agent Reasoning Engine",
        slug: "chrono-ai-agent-engine",
        summary: "Multi-turn autonomous LLM assistant with tool calling.",
        description: "# Chrono Agent Core\n\nDeep reasoning engine with multi-provider fallbacks (Gemini, Claude, DeepSeek).",
        status: "In Progress",
        priority: "urgent",
        lead_id: "user-1",
        icon: "C",
        icon_bg: "#121419",
        icon_color: "#5e6ad2",
        cover_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80",
        target_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        start_date: new Date().toISOString(),
      },
      {
        id: "proj-infra-3",
        identifier: "PRJ-3",
        internal_id: "prj_infra_33da87",
        workspace_id: "ws-1",
        team_id: "team-1",
        folder_id: "folder-infra",
        name: "Supabase Multi-Region PostgreSQL Cluster",
        slug: "supabase-postgresql-cluster",
        summary: "High availability database replication with sub-10ms latency.",
        description: "# Database Infrastructure\n\nDedicated read replicas, connection pooling with PgBouncer and realtime webhooks.",
        status: "Planned",
        priority: "medium",
        lead_id: "user-2",
        icon: "S",
        icon_bg: "#081d27",
        icon_color: "#38bdf8",
        cover_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
        target_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        start_date: new Date().toISOString(),
      },
    ];
    const { error: prjErr } = await supabase.from("projects").upsert(projects);
    if (prjErr) console.error("Projects error:", prjErr);
    else console.log(`   ✅ ${projects.length} projects seeded.`);

    // 7. PROJECT MILESTONES
    console.log("7. Seeding Milestones...");
    const milestones = [
      { id: "ms-1", project_id: "proj-casd-1", name: "Core Raft Protocol v1.0", completed: true, sort_order: 1 },
      { id: "ms-2", project_id: "proj-casd-1", name: "Multi-datacenter Replication", completed: false, sort_order: 2 },
      { id: "ms-3", project_id: "proj-agent-2", name: "Tool Calling & Action Engine", completed: true, sort_order: 1 },
      { id: "ms-4", project_id: "proj-agent-2", name: "Streaming Multi-turn Chat", completed: true, sort_order: 2 },
    ];
    const { error: msErr } = await supabase.from("project_milestones").upsert(milestones);
    if (msErr) console.error("Milestones error:", msErr);
    else console.log(`   ✅ ${milestones.length} milestones seeded.`);

    // 8. PROJECT LINKS
    console.log("8. Seeding Project Links...");
    const links = [
      { id: "pl-1", project_id: "proj-casd-1", title: "GitHub Repository", url: "https://github.com/chrono/casd", category: "github" },
      { id: "pl-2", project_id: "proj-casd-1", title: "Architecture Docs", url: "https://docs.chrono.engineering", category: "docs" },
      { id: "pl-3", project_id: "proj-agent-2", title: "Model Playground", url: "https://ai.google.dev", category: "web" },
    ];
    const { error: plErr } = await supabase.from("project_links").upsert(links);
    if (plErr) console.error("Project links error:", plErr);
    else console.log(`   ✅ ${links.length} project links seeded.`);

    // 9. TAGS
    console.log("9. Seeding Tags...");
    const tags = [
      { id: "tag-1", workspace_id: "ws-1", name: "Frontend", color: "#60a5fa", description: "UI, Layouts & Components" },
      { id: "tag-2", workspace_id: "ws-1", name: "Backend", color: "#34d399", description: "API, Databases & Services" },
      { id: "tag-3", workspace_id: "ws-1", name: "AI Agent", color: "#c084fc", description: "LLM, Prompts & Tool Calling" },
      { id: "tag-4", workspace_id: "ws-1", name: "Design", color: "#f472b6", description: "Figma, Assets & Tokens" },
      { id: "tag-5", workspace_id: "ws-1", name: "DevOps", color: "#fb923c", description: "Docker, Cloud & Deployments" },
    ];
    const { error: tagErr } = await supabase.from("tags").upsert(tags);
    if (tagErr) console.error("Tags error:", tagErr);
    else console.log(`   ✅ ${tags.length} tags seeded.`);

    // 10. ISSUES / TASKS
    console.log("10. Seeding Issues...");
    const issues = [
      {
        id: "issue-1",
        identifier: "FIR-1",
        internal_id: "iss_cmd_k_01",
        workspace_id: "ws-1",
        team_id: "team-1",
        project_id: "proj-casd-1",
        assignee_id: "user-1",
        creator_id: "user-1",
        title: "Implement Command+K Global Quick Search",
        description: "Build an ultra-fast modal for global search, shortcuts and action execution across projects and issues.",
        status: "in_progress",
        priority: "high",
        estimate: 3,
        eisenhower_quadrant: "q1",
        labels: ["Frontend", "Design"],
        tags: ["Frontend"],
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        recurrence: "none",
      },
      {
        id: "issue-2",
        identifier: "FIR-2",
        internal_id: "iss_sync_postgres_02",
        workspace_id: "ws-1",
        team_id: "team-1",
        project_id: "proj-infra-3",
        assignee_id: "user-2",
        creator_id: "user-1",
        title: "Set up Multi-Region Supabase Postgres Pool",
        description: "Configure connection pooling, edge caching, and real-time CDC triggers for zero-latency queries.",
        status: "todo",
        priority: "urgent",
        estimate: 5,
        eisenhower_quadrant: "q1",
        labels: ["Backend", "DevOps"],
        tags: ["Backend", "DevOps"],
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        recurrence: "none",
      },
      {
        id: "issue-3",
        identifier: "FIR-3",
        internal_id: "iss_kanban_dnd_03",
        workspace_id: "ws-1",
        team_id: "team-1",
        project_id: "proj-casd-1",
        assignee_id: "user-1",
        creator_id: "user-1",
        title: "Kanban Mouse Drag & Drop Column Reordering",
        description: "Interactive HTML5 card dragging across Backlog, Todo, In Progress and Done.",
        status: "done",
        priority: "medium",
        estimate: 2,
        eisenhower_quadrant: "q2",
        labels: ["Frontend"],
        tags: ["Frontend"],
        completed_at: new Date().toISOString(),
        recurrence: "none",
      },
      {
        id: "issue-4",
        identifier: "FIR-4",
        internal_id: "iss_habits_04",
        workspace_id: "ws-1",
        team_id: "team-1",
        project_id: "proj-agent-2",
        assignee_id: "user-1",
        creator_id: "user-1",
        title: "Daily Standup & AI Task Breakdown",
        description: "Run automated morning sprint triage with Chrono Agent.",
        status: "todo",
        priority: "low",
        estimate: 1,
        eisenhower_quadrant: "q2",
        labels: ["AI Agent"],
        tags: ["AI Agent"],
        due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
        due_time: "09:30",
        recurrence: "daily",
        recurrence_days: [1, 2, 3, 4, 5],
      },
    ];
    const { error: issErr } = await supabase.from("issues").upsert(issues);
    if (issErr) console.error("Issues error:", issErr);
    else console.log(`   ✅ ${issues.length} issues seeded.`);

    // 11. HABITS
    console.log("11. Seeding Habits...");
    const habits = [
      {
        id: "habit-1",
        workspace_id: "ws-1",
        account_id: "user-1",
        title: "Code Review & PR Triage",
        category: "Engineering",
        icon: "git-pull-request",
        color: "#60a5fa",
        frequency: "daily",
        target_days: [1, 2, 3, 4, 5],
        completed_dates: ["2026-08-31", "2026-08-30", "2026-08-29"],
        streak: 3,
      },
      {
        id: "habit-2",
        workspace_id: "ws-1",
        account_id: "user-1",
        title: "Deep Work Focus Block (90 min)",
        category: "Productivity",
        icon: "sparkles",
        color: "#c084fc",
        frequency: "daily",
        target_days: [1, 2, 3, 4, 5, 6, 7],
        completed_dates: ["2026-08-31", "2026-08-30"],
        streak: 2,
      },
      {
        id: "habit-3",
        workspace_id: "ws-1",
        account_id: "user-1",
        title: "Architecture & Tech Debt Clean",
        category: "Architecture",
        icon: "layers",
        color: "#34d399",
        frequency: "weekly",
        target_days: [5],
        completed_dates: ["2026-08-28"],
        streak: 1,
      },
    ];
    const { error: habErr } = await supabase.from("habits").upsert(habits);
    if (habErr) console.error("Habits error:", habErr);
    else console.log(`   ✅ ${habits.length} habits seeded.`);

    // 12. POMODORO SESSIONS
    console.log("12. Seeding Pomodoro Sessions...");
    const pomodoro = [
      {
        id: "pomo-1",
        workspace_id: "ws-1",
        account_id: "user-1",
        issue_id: "issue-1",
        duration: 1500,
        type: "focus",
        completed_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "pomo-2",
        workspace_id: "ws-1",
        account_id: "user-1",
        issue_id: "issue-3",
        duration: 1500,
        type: "focus",
        completed_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    const { error: pomoErr } = await supabase.from("pomodoro_sessions").upsert(pomodoro);
    if (pomoErr) console.error("Pomodoro sessions error:", pomoErr);
    else console.log(`   ✅ ${pomodoro.length} pomodoro sessions seeded.`);

    // 13. USER PREFERENCES
    console.log("13. Seeding User Preferences...");
    const preferences = [
      {
        id: "pref-1",
        account_id: "user-1",
        default_home_view: "agent",
        display_names: "username",
        first_day_of_week: "monday",
        convert_emoticons: true,
        send_comments_on: "ctrl_enter",
        font_size: "default",
        theme: "dark",
        ai_model: "gemini-2.5-flash",
      },
      {
        id: "pref-2",
        account_id: "user-2",
        default_home_view: "inbox",
        display_names: "full_name",
        first_day_of_week: "monday",
        convert_emoticons: true,
        send_comments_on: "enter",
        font_size: "default",
        theme: "dark",
        ai_model: "gemini-2.5-flash",
      },
    ];
    const { error: prefErr } = await supabase.from("user_preferences").upsert(preferences);
    if (prefErr) console.error("Preferences error:", prefErr);
    else console.log(`   ✅ ${preferences.length} user preferences seeded.`);

    console.log("\n✨ Supabase Seeding Finished Successfully!");
  } catch (error) {
    console.error("❌ Seeding fatal error:", error);
  }
}

seedDatabase();
