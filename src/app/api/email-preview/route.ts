import { NextResponse } from "next/server";
import {
  renderWorkspaceInviteEmailHtml,
  renderPasswordRecoveryEmailHtml,
  renderWelcomeEmailHtml,
  sendWorkspaceInviteEmail,
  sendPasswordRecoveryEmail,
  sendWelcomeEmail,
} from "@/lib/mailer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "invite";
  const format = url.searchParams.get("format") || "html";

  const origin = url.origin || "https://chrono.cristianobleve.com";

  let rendered: { subject: string; text: string; html: string };

  switch (type) {
    case "recovery":
      rendered = renderPasswordRecoveryEmailHtml({
        to: "alex.turner@example.com",
        resetUrl: `${origin}/reset-password?token=mock_recovery_token_123456`,
      });
      break;
    case "welcome":
      rendered = renderWelcomeEmailHtml({
        to: "alex.turner@example.com",
        name: "Alex Turner",
        siteUrl: origin,
      });
      break;
    case "invite":
    default:
      rendered = renderWorkspaceInviteEmailHtml({
        to: "alex.turner@example.com",
        workspaceName: "Chrono Core",
        inviterName: "Cristiano Bleve",
        role: "admin",
        inviteUrl: `${origin}/invite/mock_invitation_token_abcdef123456`,
      });
      break;
  }

  if (format === "json") {
    return NextResponse.json(rendered);
  }

  return new NextResponse(rendered.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = String(body.to || "").trim().toLowerCase();
    const type = body.type || "all";

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Indirizzo email non valido." }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://chrono.cristianobleve.com";

    const results: Record<string, { sent: boolean; error?: string }> = {};

    if (type === "all" || type === "invite") {
      results.invite = await sendWorkspaceInviteEmail({
        to,
        workspaceName: "Chrono Core",
        inviterName: "Cristiano Bleve",
        role: "admin",
        inviteUrl: `${origin}/invite/preview-token-777`,
      });
    }

    if (type === "all" || type === "recovery") {
      results.recovery = await sendPasswordRecoveryEmail({
        to,
        resetUrl: `${origin}/reset-password?recovery=preview-token-888`,
      });
    }

    if (type === "all" || type === "welcome") {
      results.welcome = await sendWelcomeEmail({
        to,
        name: "Cristiano",
        siteUrl: origin,
      });
    }

    const allSent = Object.values(results).every((r) => r.sent);

    return NextResponse.json({
      success: allSent,
      results,
      recipient: to,
    });
  } catch (err: any) {
    console.error("[EmailPreview API] POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Errore durante l'invio delle email di test." },
      { status: 500 }
    );
  }
}
