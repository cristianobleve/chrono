import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type AuthContext = {
  accountId: string;
  email: string;
  user: any;
};

async function authenticate(req: Request): Promise<AuthContext | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data: { user }, error } = await supabaseServer.auth.getUser(token);
  if (error || !user?.email) return null;

  let { data: account } = await supabaseServer
    .from("accounts")
    .select("id, email")
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
      .select("id, email")
      .single();
    account = created;
  }

  return account ? { accountId: account.id, email: user.email, user } : null;
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  // Sync any pending workspace invitations addressed to this email
  const { data: pendingInvitations } = await supabaseServer
    .from("workspace_invitations")
    .select("id, workspace_id, role, status, expires_at, created_at, invited_by")
    .ilike("email", auth.email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (pendingInvitations && pendingInvitations.length > 0) {
    for (const inv of pendingInvitations) {
      const { data: existingNotification } = await supabaseServer
        .from("workspace_notifications")
        .select("id")
        .eq("recipient_account_id", auth.accountId)
        .eq("type", "workspace_invitation")
        .eq("workspace_id", inv.workspace_id)
        .maybeSingle();

      if (!existingNotification) {
        const { data: ws } = await supabaseServer
          .from("workspaces")
          .select("name")
          .eq("id", inv.workspace_id)
          .maybeSingle();

        await supabaseServer.from("workspace_notifications").insert({
          workspace_id: inv.workspace_id,
          recipient_account_id: auth.accountId,
          actor_account_id: inv.invited_by || null,
          type: "workspace_invitation",
          title: `Invito a ${ws?.name || "un workspace"}`,
          body: `Hai un invito pendente con ruolo ${inv.role}.`,
          href: `/settings/members`,
          metadata: {
            invitation_id: inv.id,
            workspace_id: inv.workspace_id,
            role: inv.role,
          },
        });
      }
    }
  }

  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") || 30), 100);
  const { data, error } = await supabaseServer
    .from("workspace_notifications")
    .select("id, workspace_id, actor_account_id, type, title, body, href, metadata, read_at, created_at")
    .eq("recipient_account_id", auth.accountId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    notifications: data || [],
    unread: (data || []).filter((item) => !item.read_at).length,
    pending_invitations: pendingInvitations || [],
  });
}

export async function PATCH(req: Request) {
  const auth = await authenticate(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await req.json();
  const query = supabaseServer.from("workspace_notifications").update({ read_at: new Date().toISOString() }).eq("recipient_account_id", auth.accountId);
  const { error } = body.all
    ? await query.is("read_at", null)
    : await query.eq("id", String(body.id || "")).is("read_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}