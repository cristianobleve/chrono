-- Persistent workspace invitations. Tokens are stored hashed and are only
-- returned once, when the invitation is created.
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  accepted_by TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, email, status)
);

ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS accepted_by TEXT REFERENCES public.accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace
  ON public.workspace_invitations(workspace_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email
  ON public.workspace_invitations(lower(email), status);

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_invitations_self_read ON public.workspace_invitations;
CREATE POLICY workspace_invitations_self_read ON public.workspace_invitations
  FOR SELECT TO authenticated
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.chrono_is_workspace_member(workspace_id)
  );

CREATE OR REPLACE FUNCTION public.chrono_workspace_role(target_workspace_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wm.role
  FROM public.workspace_members wm
  JOIN public.accounts a ON a.id = wm.account_id
  WHERE wm.workspace_id = target_workspace_id
    AND lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.chrono_workspace_role(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chrono_workspace_role(text) TO anon, authenticated;