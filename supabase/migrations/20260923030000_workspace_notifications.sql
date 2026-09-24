-- Persistent workspace notifications for cross-session SaaS activity.
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

CREATE INDEX IF NOT EXISTS idx_workspace_notifications_recipient
  ON public.workspace_notifications(recipient_account_id, read_at, created_at DESC);

ALTER TABLE public.workspace_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_notifications_recipient_read ON public.workspace_notifications;
CREATE POLICY workspace_notifications_recipient_read ON public.workspace_notifications
  FOR SELECT TO authenticated
  USING (recipient_account_id IN (
    SELECT id FROM public.accounts
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ));