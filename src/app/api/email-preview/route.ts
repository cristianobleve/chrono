import { NextResponse } from "next/server";
import {
  renderWorkspaceInviteEmailHtml,
  renderPasswordRecoveryEmailHtml,
  renderWelcomeEmailHtml,
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
        workspaceName: "Acme Product Core",
        inviterName: "Sarah Connor",
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
