-- ==============================================================================
-- CHRONO PLATFORM — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Multi-Workspace, Multi-Account, Realtime Sync Engine
-- ==============================================================================

-- 1. ACCOUNTS (User Profiles & Credentials)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT UNIQUE,
    internal_id TEXT UNIQUE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'member', -- owner, admin, member, guest
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT UNIQUE,
    internal_id TEXT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'chrono',
    icon_bg TEXT DEFAULT '#121419',
    icon_color TEXT DEFAULT '#5e6ad2',
    plan TEXT DEFAULT 'Pro', -- Free, Pro, Enterprise
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS (Many-to-Many Accounts <-> Workspaces)
CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- owner, admin, member, guest
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, account_id)
);

CREATE TABLE IF NOT EXISTS workspace_invitations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
    token_hash TEXT NOT NULL UNIQUE,
    invited_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    accepted_by TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, email, status)
);

CREATE TABLE IF NOT EXISTS workspace_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    recipient_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    actor_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    href TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TEAMS
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT UNIQUE,
    internal_id TEXT UNIQUE,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    icon TEXT DEFAULT 'zap',
    color TEXT DEFAULT '#5e6ad2',
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECT FOLDERS / LISTS
CREATE TABLE IF NOT EXISTS project_folders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT '#5e6ad2',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL, -- e.g. "PRJ-1"
    internal_id TEXT NOT NULL, -- e.g. "prj_casd_98f"
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    folder_id TEXT REFERENCES project_folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    status TEXT DEFAULT 'Planned', -- Planned, In Progress, Completed, Backlog, Paused, Canceled
    priority TEXT DEFAULT 'none', -- urgent, high, medium, low, none
    lead_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    target_date TIMESTAMPTZ,
    icon TEXT,
    icon_bg TEXT DEFAULT '#2a0808',
    icon_color TEXT DEFAULT '#e53e3e',
    icon_symbol TEXT,
    icon_shape TEXT DEFAULT 'squircle',
    cover_url TEXT,
    cover_gradient TEXT,
    parent_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

-- 7. PROJECT MILESTONES
CREATE TABLE IF NOT EXISTS project_milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROJECT LINKS
CREATE TABLE IF NOT EXISTS project_links (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TAGS
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#5e6ad2',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ISSUES / TASKS
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL, -- e.g. "FIR-1"
    internal_id TEXT,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    assignee_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    creator_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo', -- backlog, todo, in_progress, done, canceled
    priority TEXT DEFAULT 'none', -- urgent, high, medium, low, none
    due_date TIMESTAMPTZ,
    due_time TEXT,
    reminder_date TIMESTAMPTZ,
    reminder_time TEXT,
    recurrence TEXT DEFAULT 'none', -- none, daily, weekly, monthly, custom
    recurrence_days JSONB DEFAULT '[]'::jsonb,
    eisenhower_quadrant TEXT, -- q1, q2, q3, q4
    labels JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    estimate INT,
    sort_order FLOAT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. HABITS
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    icon TEXT DEFAULT 'flame',
    color TEXT DEFAULT '#5e6ad2',
    frequency TEXT DEFAULT 'daily',
    target_days JSONB DEFAULT '[1,2,3,4,5,6,7]'::jsonb,
    completed_dates JSONB DEFAULT '[]'::jsonb,
    streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. POMODORO SESSIONS
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
    issue_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
    duration INT NOT NULL, -- in seconds
    type TEXT DEFAULT 'focus', -- focus, short_break, long_break
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    account_id TEXT UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    default_home_view TEXT DEFAULT 'agent',
    display_names TEXT DEFAULT 'username',
    first_day_of_week TEXT DEFAULT 'monday',
    convert_emoticons BOOLEAN DEFAULT TRUE,
    send_comments_on TEXT DEFAULT 'ctrl_enter',
    font_size TEXT DEFAULT 'default',
    theme TEXT DEFAULT 'dark',
    ai_model TEXT DEFAULT 'gemini-2.5-flash',
    api_keys JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Super-fast Lookups
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_updated ON projects(workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_workspace ON issues(workspace_id);
CREATE INDEX IF NOT EXISTS idx_issues_workspace_created ON issues(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_habits_workspace ON habits(workspace_id);
CREATE INDEX IF NOT EXISTS idx_habits_workspace_created ON habits(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_workspace ON tags(workspace_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_sort ON project_milestones(project_id, sort_order, target_date);
CREATE INDEX IF NOT EXISTS idx_project_links_project ON project_links(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_acc ON workspace_members(account_id);
