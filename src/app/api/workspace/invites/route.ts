import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWorkspaceInviteEmail } from "@/lib/mailer";

const supabaseServer = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type AuthContext = { accountId: string; email: string };

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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
  return account ? { accountId: account.id, email: account.email } : null;
}

async function canManageWorkspace(workspaceId: string, accountId: string) {
  const { data } = await supabaseServer
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("account_id", accountId)
    .maybeSingle();
  return data?.role === "owner" || data?.role === "admin";
}

async function getWorkspaceRole(workspaceId: string, accountId: string) {
  const { data } = await supabaseServer
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("account_id", accountId)
    .maybeSingle();
  return data?.role || null;
}

async function createNotification(input: {
  workspaceId: string;
  recipientAccountId: string;
  actorAccountId?: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  metadata?: any;
}) {
  await supabaseServer.from("workspace_notifications").insert({
    workspace_id: input.workspaceId,
    recipient_account_id: input.recipientAccountId,
    actor_account_id: input.actorAccountId || null,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href || "/settings/members",
    metadata: input.metadata || null,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const previewToken = url.searchParams.get("preview_token") || url.searchParams.get("token");
  if (previewToken) {
    const hash = tokenHash(previewToken);
    const { data: inv, error: invErr } = await supabaseServer
      .from("workspace_invitations")
      .select("id, workspace_id, email, role, status, expires_at, invited_by")
      .eq("token_hash", hash)
      .maybeSingle();

    if (invErr || !inv) {
      return NextResponse.json({ error: "Invito non valido o inesistente" }, { status: 404 });
    }
    if (inv.status !== "pending") {
      return NextResponse.json({
        error: inv.status === "accepted" ? "Questo invito è già stato accettato" : "Questo invito non è più valido",
        status: inv.status,
      }, { status: 410 });
    }
    if (new Date(inv.expires_at) <= new Date()) {
      return NextResponse.json({ error: "Questo invito è scaduto", status: "expired" }, { status: 410 });
    }

    const [{ data: ws }, { data: inviter }] = await Promise.all([
      supabaseServer.from("workspaces").select("id, name, slug, icon, icon_bg, icon_color").eq("id", inv.workspace_id).maybeSingle(),
      inv.invited_by ? supabaseServer.from("accounts").select("id, name, username, avatar_url").eq("id", inv.invited_by).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json({
      valid: true,
      invitation: {
        id: inv.id,
        role: inv.role,
        email: inv.email,
        expires_at: inv.expires_at,
      },
      workspace: ws || { id: inv.workspace_id, name: "Workspace" },
      inviter: inviter || { name: "Un membro del team" },
    });
  }

  const auth = await authenticate(req);
  if (!auth) return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  const workspaceId = new URL(req.url).searchParams.get("workspace_id");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspace_id è obbligatorio" }, { status: 400 });
  }

  const actorRole = await getWorkspaceRole(workspaceId, auth.accountId);
  if (!actorRole || !["owner", "admin"].includes(actorRole)) {
    return NextResponse.json({
      error: "Accesso riservato ad Owner e Admin",
      canManage: false,
      currentRole: actorRole || "member",
    }, { status: 403 });
  }

  const { data: invitations, error } = await supabaseServer
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, status, expires_at, created_at, accepted_at, invited_by, accepted_by")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: memberships, error: membersError } = await supabaseServer
    .from("workspace_members")
    .select("id, workspace_id, account_id, role, joined_at")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });
  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });
  const accountIds = (memberships || []).map((member) => member.account_id);
  const invitedByIds = (invitations || []).flatMap((invitation) => [invitation.invited_by, invitation.accepted_by]).filter(Boolean);
  const allAccountIds = [...new Set([...accountIds, ...invitedByIds])];
  const { data: memberAccounts } = allAccountIds.length
    ? await supabaseServer.from("accounts").select("id, identifier, internal_id, name, username, email, avatar_url, role, created_at").in("id", allAccountIds)
    : { data: [] };
  const accountById = new Map((memberAccounts || []).map((account) => [account.id, account]));
  
  const roleRank: Record<string, number> = { owner: 1, admin: 2, member: 3, guest: 4 };
  const members = (memberships || [])
    .map((member) => ({ ...member, account: accountById.get(member.account_id) || null }))
    .sort((a, b) => {
      const rankA = roleRank[a.role] || 99;
      const rankB = roleRank[b.role] || 99;
      if (rankA !== rankB) return rankA - rankB;
      const nameA = a.account?.name || "";
      const nameB = b.account?.name || "";
      return nameA.localeCompare(nameB);
    });

  const invitationHistory = (invitations || []).map((invitation) => ({
    ...invitation,
    invited_by_account: invitation.invited_by ? accountById.get(invitation.invited_by) || null : null,
    accepted_by_account: invitation.accepted_by ? accountById.get(invitation.accepted_by) || null : null,
  }));

  return NextResponse.json({
    invitations: invitationHistory,
    members,
    canManage: true,
    currentRole: actorRole,
  });
}

export async function POST(req: Request) {
  const auth = await authenticate(req);
  if (!auth) return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const workspaceId = String(body.workspace_id || "");
  const role = body.role === "admin" || body.role === "guest" ? body.role : "member";
  if (!workspaceId || !email || !email.includes("@")) {
    return NextResponse.json({ error: "workspace_id ed email valida sono richiesti" }, { status: 400 });
  }

  const actorRole = await getWorkspaceRole(workspaceId, auth.accountId);
  if (!actorRole || !["owner", "admin"].includes(actorRole)) {
    return NextResponse.json({ error: "Accesso riservato ad Owner e Admin" }, { status: 403 });
  }

  // Discord role hierarchy: Only owners can invite admins or owners.
  if (actorRole !== "owner" && (role === "admin" || role === "owner")) {
    return NextResponse.json({ error: "Solo l'Owner può invitare altri amministratori o proprietari." }, { status: 403 });
  }
  const { data: existingMember } = await supabaseServer
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .in("account_id", (await supabaseServer.from("accounts").select("id").ilike("email", email)).data?.map((a) => a.id) || ["__none__"])
    .maybeSingle();
  if (existingMember) return NextResponse.json({ error: "This email is already a workspace member" }, { status: 409 });

  const rawToken = randomBytes(32).toString("hex");
  const { data: invitation, error } = await supabaseServer
    .from("workspace_invitations")
    .insert({ workspace_id: workspaceId, email, role, token_hash: tokenHash(rawToken), invited_by: auth.accountId })
    .select("id, workspace_id, email, role, status, expires_at, created_at, accepted_at, invited_by, accepted_by")
    .single();
  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json({ error: duplicate ? "A pending invitation already exists for this email" : error.message }, { status: duplicate ? 409 : 500 });
  }
  const [{ data: recipient }, { data: wsData }, { data: inviterAccount }] = await Promise.all([
    supabaseServer.from("accounts").select("id").ilike("email", email).maybeSingle(),
    supabaseServer.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
    supabaseServer.from("accounts").select("name, email").eq("id", auth.accountId).maybeSingle(),
  ]);

  if (recipient) {
    await createNotification({
      workspaceId,
      recipientAccountId: recipient.id,
      actorAccountId: auth.accountId,
      type: "workspace_invitation",
      title: `Invito a ${wsData?.name || "un workspace"}`,
      body: `Hai ricevuto un invito a collaborare con ruolo ${role}.`,
      href: `/invite/${rawToken}`,
      metadata: {
        invitation_id: invitation.id,
        workspace_id: workspaceId,
        role,
        token: rawToken,
      },
    });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://chrono.cristianobleve.com";
  const inviteUrl = `${origin}/invite/${rawToken}`;

  const mailResult = await sendWorkspaceInviteEmail({
    to: email,
    workspaceName: wsData?.name || "Workspace Chrono",
    inviterName: inviterAccount?.name || auth.email || "Un amministratore",
    role,
    inviteUrl,
  });

  return NextResponse.json(
    {
      invitation,
      token: rawToken,
      emailSent: mailResult.sent,
      emailError: mailResult.error,
    },
    { status: 201 }
  );
}

export async function DELETE(req: Request) {
  const auth = await authenticate(req);
  if (!auth) return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  const { id, member_id: memberId, workspace_id: workspaceId } = await req.json();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspace_id è obbligatorio" }, { status: 400 });
  }

  const actorRole = await getWorkspaceRole(workspaceId, auth.accountId);
  if (!actorRole || !["owner", "admin"].includes(actorRole)) {
    return NextResponse.json({ error: "Accesso riservato ad Owner e Admin" }, { status: 403 });
  }

  if (memberId) {
    const { data: target } = await supabaseServer
      .from("workspace_members")
      .select("account_id, role")
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!target) return NextResponse.json({ error: "Membro non trovato nel workspace" }, { status: 404 });
    if (target.account_id === auth.accountId) {
      return NextResponse.json({ error: "Non puoi rimuovere te stesso dal workspace" }, { status: 400 });
    }

    // Discord-style hierarchy:
    // Owner can remove Admins and Associati.
    // Admin can ONLY remove Associati (or Guests).
    if (actorRole !== "owner" && (target.role === "owner" || target.role === "admin")) {
      return NextResponse.json({
        error: "Un amministratore può rimuovere solo gli associati. Non puoi rimuovere proprietari o altri amministratori.",
      }, { status: 403 });
    }

    if (target.role === "owner") {
      const { count } = await supabaseServer
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("role", "owner");
      if ((count || 0) <= 1) {
        return NextResponse.json({ error: "Il workspace deve mantenere almeno un proprietario." }, { status: 400 });
      }
    }

    const { error: memberError } = await supabaseServer
      .from("workspace_members")
      .delete()
      .eq("id", memberId)
      .eq("workspace_id", workspaceId);
    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

    await createNotification({
      workspaceId,
      recipientAccountId: target.account_id,
      actorAccountId: auth.accountId,
      type: "workspace_member_removed",
      title: "Accesso al workspace rimosso",
      body: "Il tuo accesso a questo workspace è stato revocato.",
    });

    return NextResponse.json({ success: true });
  }

  // Revoke pending invitation
  if (actorRole !== "owner") {
    const { data: inv } = await supabaseServer
      .from("workspace_invitations")
      .select("role")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (inv && (inv.role === "admin" || inv.role === "owner")) {
      return NextResponse.json({ error: "Solo l'Owner può revocare inviti amministrativi." }, { status: 403 });
    }
  }

  const { error } = await supabaseServer
    .from("workspace_invitations")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (body.action === "update_member") {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    const workspaceId = String(body.workspace_id || "");
    const memberId = String(body.member_id || "");
    const role = ["owner", "admin", "member", "guest"].includes(body.role) ? body.role : null;
    const actorRole = await getWorkspaceRole(workspaceId, auth.accountId);
    if (!workspaceId || !memberId || !role || !actorRole || !["owner", "admin"].includes(actorRole)) {
      return NextResponse.json({ error: "Accesso riservato ad Owner e Admin" }, { status: 403 });
    }

    const { data: target } = await supabaseServer
      .from("workspace_members")
      .select("account_id, role")
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!target) return NextResponse.json({ error: "Membro non trovato nel workspace" }, { status: 404 });

    // Discord-style role hierarchy:
    // If actor is Admin:
    // - Cannot modify Owner or other Admins
    // - Cannot promote anyone to Owner or Admin
    if (actorRole !== "owner" && (target.role === "owner" || target.role === "admin" || role === "owner" || role === "admin")) {
      return NextResponse.json({
        error: "Un amministratore può gestire solo i membri associati. Solo l'Owner può modificare ruoli di amministratore o proprietario.",
      }, { status: 403 });
    }

    if (target.role === "owner" && role !== "owner") {
      const { count } = await supabaseServer
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("role", "owner");
      if ((count || 0) <= 1) {
        return NextResponse.json({ error: "Il workspace deve mantenere almeno un proprietario." }, { status: 400 });
      }
    }

    const { error } = await supabaseServer
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId)
      .eq("workspace_id", workspaceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (target.account_id !== auth.accountId) {
      const roleLabel = role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Associato";
      await createNotification({
        workspaceId,
        recipientAccountId: target.account_id,
        actorAccountId: auth.accountId,
        type: "workspace_role_changed",
        title: "Ruolo workspace aggiornato",
        body: `Il tuo ruolo nel workspace è stato aggiornato a ${roleLabel}.`,
      });
    }
    return NextResponse.json({ success: true });
  }

  const authToken = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!authToken) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(authToken);
  if (authError || !user?.email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  if (body.action === "reject") {
    const token = body.token ? String(body.token) : null;
    const invitationId = body.invitation_id ? String(body.invitation_id) : null;
    if (!token && !invitationId) {
      return NextResponse.json({ error: "Token or invitation_id required" }, { status: 400 });
    }

    let query = supabaseServer
      .from("workspace_invitations")
      .select("id, workspace_id, email, status")
      .eq("status", "pending");

    if (token) {
      query = query.eq("token_hash", tokenHash(token));
    } else {
      query = query.eq("id", invitationId!);
    }

    const { data: inv, error: invErr } = await query.maybeSingle();
    if (invErr || !inv) {
      return NextResponse.json({ error: "Invito non trovato o non più valido" }, { status: 404 });
    }

    if (inv.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Non sei autorizzato a rifiutare questo invito" }, { status: 403 });
    }

    await supabaseServer
      .from("workspace_invitations")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", inv.id);

    const { data: acc } = await supabaseServer.from("accounts").select("id").ilike("email", user.email).maybeSingle();
    if (acc) {
      await supabaseServer
        .from("workspace_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_account_id", acc.id)
        .eq("type", "workspace_invitation")
        .eq("workspace_id", inv.workspace_id);
    }

    return NextResponse.json({ success: true, rejected: true });
  }

  const token = body.token ? String(body.token) : null;
  const invitationId = body.invitation_id ? String(body.invitation_id) : null;
  if (!token && !invitationId) {
    return NextResponse.json({ error: "Invitation token or invitation_id is required" }, { status: 400 });
  }

  let query = supabaseServer
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, status, expires_at, invited_by")
    .eq("status", "pending");

  if (token) {
    query = query.eq("token_hash", tokenHash(token));
  } else {
    query = query.eq("id", invitationId!);
  }

  const { data: invitation, error: invitationError } = await query.maybeSingle();
  if (invitationError || !invitation) {
    return NextResponse.json({ error: "Invito non valido o già gestito" }, { status: 404 });
  }
  if (new Date(invitation.expires_at) <= new Date()) {
    await supabaseServer.from("workspace_invitations").update({ status: "expired" }).eq("id", invitation.id);
    return NextResponse.json({ error: "L'invito è scaduto", status: "expired" }, { status: 410 });
  }
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({
      error: `Accedi con l'email a cui è stato inviato l'invito (${invitation.email})`,
      invitedEmail: invitation.email,
      currentEmail: user.email,
    }, { status: 403 });
  }

  let { data: account } = await supabaseServer.from("accounts").select("id").ilike("email", user.email).maybeSingle();
  if (!account) {
    const baseUsername = (user.email.split("@")[0] || "member").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40);
    const username = `${baseUsername}_${randomBytes(3).toString("hex")}`;
    const { data: createdAccount, error: accountError } = await supabaseServer
      .from("accounts")
      .insert({ name: user.user_metadata?.full_name || user.user_metadata?.name || baseUsername, username, email: user.email, role: "member" })
      .select("id")
      .single();
    if (accountError) return NextResponse.json({ error: accountError.message }, { status: 500 });
    account = createdAccount;
  }

  const { error: memberError } = await supabaseServer.from("workspace_members").upsert({
    workspace_id: invitation.workspace_id,
    account_id: account.id,
    role: invitation.role,
  }, { onConflict: "workspace_id,account_id" });
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  const { error: updateError } = await supabaseServer
    .from("workspace_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), accepted_by: account.id, updated_at: new Date().toISOString() })
    .eq("id", invitation.id)
    .eq("status", "pending");
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabaseServer
    .from("workspace_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_account_id", account.id)
    .eq("type", "workspace_invitation")
    .eq("workspace_id", invitation.workspace_id);

  if (invitation.invited_by && invitation.invited_by !== account.id) {
    await createNotification({
      workspaceId: invitation.workspace_id,
      recipientAccountId: invitation.invited_by,
      actorAccountId: account.id,
      type: "workspace_invitation_accepted",
      title: "Invito accettato",
      body: `${user.user_metadata?.full_name || user.email} ha accettato l'invito al workspace.`,
    });
  }
  return NextResponse.json({ success: true, workspace_id: invitation.workspace_id });
}