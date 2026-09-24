-- Incremental update for databases where previous workspace migrations
-- have already been applied.

-- 1. Track which account accepted an invitation.
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS accepted_by TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'workspace_invitations_accepted_by_fkey'
  ) THEN
    ALTER TABLE public.workspace_invitations
      ADD CONSTRAINT workspace_invitations_accepted_by_fkey
      FOREIGN KEY (accepted_by)
      REFERENCES public.accounts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_accepted_by
  ON public.workspace_invitations(accepted_by);

-- 2. Persistent notifications for workspace activity.
CREATE TABLE IF NOT EXISTS public.workspace_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  recipient_account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  actor_account_id TEXT REFERENCES public.accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS actor_account_id TEXT;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS href TEXT;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE public.workspace_notifications
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workspace_notifications_actor_account_id_fkey'
  ) THEN
    ALTER TABLE public.workspace_notifications
      ADD CONSTRAINT workspace_notifications_actor_account_id_fkey
      FOREIGN KEY (actor_account_id)
      REFERENCES public.accounts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.workspace_notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_workspace_notifications_recipient
  ON public.workspace_notifications(recipient_account_id, read_at, created_at DESC);

DROP POLICY IF EXISTS workspace_notifications_recipient_read
  ON public.workspace_notifications;
CREATE POLICY workspace_notifications_recipient_read
  ON public.workspace_notifications
  FOR SELECT TO authenticated
  USING (
    recipient_account_id IN (
      SELECT id
      FROM public.accounts
      WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
