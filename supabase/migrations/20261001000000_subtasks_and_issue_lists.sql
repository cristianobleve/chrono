-- Migration: 20261001000000_subtasks_and_issue_lists.sql
-- Description: Adds parent_issue_id to issues table for subtasking, and creates issue_lists table with Chrono RLS policy.

-- 1. SUBTASKS SUPPORT ON ISSUES
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS parent_issue_id TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'issues_parent_issue_id_fkey'
  ) THEN
    ALTER TABLE public.issues
      ADD CONSTRAINT issues_parent_issue_id_fkey
      FOREIGN KEY (parent_issue_id)
      REFERENCES public.issues(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_issues_parent_issue_id
  ON public.issues(parent_issue_id);

-- 2. ADVANCED ISSUE LISTS TABLE
CREATE TABLE IF NOT EXISTS public.issue_lists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#5e6ad2',
  icon TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  sort_by TEXT DEFAULT 'createdAt',
  sort_dir TEXT DEFAULT 'desc',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_lists_workspace_id
  ON public.issue_lists(workspace_id);

-- 3. ENSURE WORKSPACE MEMBERSHIP HELPER EXISTS
CREATE OR REPLACE FUNCTION public.chrono_is_workspace_member(target_workspace_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.accounts a ON a.id = wm.account_id
    WHERE wm.workspace_id = target_workspace_id
      AND lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.chrono_is_workspace_member(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chrono_is_workspace_member(text) TO anon, authenticated;

-- 4. ROW LEVEL SECURITY (RLS) FOR ISSUE LISTS
ALTER TABLE public.issue_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS issue_lists_member_all ON public.issue_lists;

CREATE POLICY issue_lists_member_all ON public.issue_lists
  FOR ALL TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id))
  WITH CHECK (public.chrono_is_workspace_member(workspace_id));
