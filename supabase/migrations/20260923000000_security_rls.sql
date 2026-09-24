-- Chrono security baseline: authenticated, workspace-scoped reads.
-- Server routes use the service role only after checking the user's membership.

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

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accounts_self_read ON public.accounts;
CREATE POLICY accounts_self_read ON public.accounts
  FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

DROP POLICY IF EXISTS workspace_members_workspace_read ON public.workspace_members;
CREATE POLICY workspace_members_workspace_read ON public.workspace_members
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS workspaces_member_read ON public.workspaces;
CREATE POLICY workspaces_member_read ON public.workspaces
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(id));

DROP POLICY IF EXISTS teams_member_read ON public.teams;
CREATE POLICY teams_member_read ON public.teams
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS folders_member_read ON public.project_folders;
CREATE POLICY folders_member_read ON public.project_folders
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS projects_member_read ON public.projects;
CREATE POLICY projects_member_read ON public.projects
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS milestones_member_read ON public.project_milestones;
CREATE POLICY milestones_member_read ON public.project_milestones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND public.chrono_is_workspace_member(p.workspace_id)
  ));

DROP POLICY IF EXISTS links_member_read ON public.project_links;
CREATE POLICY links_member_read ON public.project_links
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
      AND public.chrono_is_workspace_member(p.workspace_id)
  ));

DROP POLICY IF EXISTS tags_member_read ON public.tags;
CREATE POLICY tags_member_read ON public.tags
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS issues_member_read ON public.issues;
CREATE POLICY issues_member_read ON public.issues
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS habits_member_read ON public.habits;
CREATE POLICY habits_member_read ON public.habits
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS pomodoro_member_read ON public.pomodoro_sessions;
CREATE POLICY pomodoro_member_read ON public.pomodoro_sessions
  FOR SELECT TO authenticated
  USING (public.chrono_is_workspace_member(workspace_id));

DROP POLICY IF EXISTS preferences_self_read ON public.user_preferences;
CREATE POLICY preferences_self_read ON public.user_preferences
  FOR SELECT TO authenticated
  USING (account_id IN (
    SELECT id FROM public.accounts
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));