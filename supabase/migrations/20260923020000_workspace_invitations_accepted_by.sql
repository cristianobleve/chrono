-- Incremental DB change for databases where the invitations migration
-- has already been applied.
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS accepted_by TEXT
  REFERENCES public.accounts(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_accepted_by
  ON public.workspace_invitations(accepted_by);