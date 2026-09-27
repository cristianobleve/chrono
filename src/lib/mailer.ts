import nodemailer, { type SendMailOptions } from "nodemailer";
import path from "path";
import fs from "fs";

export interface WorkspaceInviteEmailParams {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}

export interface PasswordRecoveryEmailParams {
  to: string;
  resetUrl: string;
}

export interface WelcomeEmailParams {
  to: string;
  name?: string;
  siteUrl?: string;
}

export interface EmailRenderOptions {
  isWebPreview?: boolean;
  logoUrl?: string;
}

const SHIELD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;"><path d="M10.49 2.23006L5.50003 4.11006C4.35003 4.54006 3.41003 5.90006 3.41003 7.12006V14.5501C3.41003 15.7301 4.19003 17.2801 5.14003 17.9901L9.44003 21.2001C10.85 22.2601 13.17 22.2601 14.58 21.2001L18.88 17.9901C19.83 17.2801 20.61 15.7301 20.61 14.5501V7.12006C20.61 5.89006 19.67 4.53006 18.52 4.10006L13.53 2.23006C12.68 1.92006 11.32 1.92006 10.49 2.23006Z" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.05005 11.8701L10.66 13.4801L14.96 9.18005" stroke="#111827" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MAIL_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:block;"><rect width="20" height="16" x="2" y="4" rx="2" stroke="#6b7280" stroke-width="1.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const COMPASS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:block;"><circle cx="12" cy="12" r="10" stroke="#6b7280" stroke-width="1.5"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="#6b7280" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.resend.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || "resend";
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress() {
  const rawFrom = process.env.SMTP_FROM || "Chrono <chrono@cristianobleve.com>";
  if (rawFrom.includes("<") && rawFrom.includes(">")) {
    return rawFrom;
  }
  const parts = rawFrom.trim().split(/\s+/);
  const emailPart = parts.find((p) => p.includes("@"));
  if (emailPart && parts.length > 1) {
    const namePart = parts.filter((p) => p !== emailPart).join(" ");
    return `${namePart} <${emailPart}>`;
  }
  return rawFrom;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRole(role: string): string {
  const normalized = (role || "").toLowerCase().trim();
  switch (normalized) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "guest":
      return "Guest";
    case "member":
    default:
      return "Member";
  }
}

function getLogoAttachment(): SendMailOptions["attachments"] {
  const logoPath = path.join(process.cwd(), "public", "chrono-logo-black.png");
  if (fs.existsSync(logoPath)) {
    return [
      {
        filename: "chrono-logo.png",
        content: fs.readFileSync(logoPath),
        cid: "chrono-logo",
        contentType: "image/png",
      },
    ];
  }
  return [];
}

function getBaseStyles(): string {
  return `
    @import url('https://fonts.cristianobleve.com/TestSöhne-Buch.otf');
    @import url('https://fonts.cristianobleve.com/TestSöhne-Halbfett.otf');
    @import url('https://fonts.cristianobleve.com/InterDisplay-Regular.woff2');
    @import url('https://fonts.cristianobleve.com/InterDisplay-SemiBold.woff2');

    @font-face {
      font-family: 'Söhne';
      src: url('https://fonts.cristianobleve.com/TestSöhne-Buch.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Söhne';
      src: url('https://fonts.cristianobleve.com/TestSöhne-Halbfett.otf') format('opentype');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'Inter Display';
      src: url('https://fonts.cristianobleve.com/InterDisplay-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Inter Display';
      src: url('https://fonts.cristianobleve.com/InterDisplay-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-style: normal;
    }

    body, table, td, p, a, span {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Söhne', 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    .mono {
      font-family: 'Geist Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 24px 12px !important;
      }
      .email-card {
        padding: 32px 20px !important;
        border-radius: 10px !important;
      }
      .email-title {
        font-size: 20px !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      body, .email-wrapper {
        background-color: #09090b !important;
      }
      .email-card {
        background-color: #121316 !important;
        border-color: #27272a !important;
      }
      .email-title, .email-heading {
        color: #ffffff !important;
      }
      .email-subtitle, .email-help-sub {
        color: #a1a1aa !important;
      }
      .email-greeting, .email-desc, .email-meta {
        color: #d4d4d8 !important;
      }
      .email-strong {
        color: #ffffff !important;
      }
      .email-direct-link {
        color: #ffffff !important;
      }
      .email-notice {
        background-color: #18181b !important;
        border-color: #27272a !important;
      }
      .email-notice-title {
        color: #ffffff !important;
      }
      .email-notice-text {
        color: #a1a1aa !important;
      }
      .email-hr {
        border-top-color: #27272a !important;
      }
      .email-help-title {
        color: #ffffff !important;
      }
      .email-help-link {
        color: #ffffff !important;
      }
      .email-btn {
        background-color: #ffffff !important;
        color: #09090b !important;
      }
      .email-logo-img {
        filter: invert(1) brightness(1.2) !important;
      }
    }
  `;
}

function renderNeedHelpAndFooter(): string {
  const currentYear = new Date().getFullYear();

  return `
    <!-- Need Help Section -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:4px;">
      <tr>
        <td align="left">
          <h2 class="email-help-title" style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#111827;letter-spacing:-0.01em;">Need Help?</h2>
          <p class="email-help-sub" style="margin:0 0 14px 0;font-size:12px;line-height:1.5;color:#6b7280;">Our team is available to assist you:</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;line-height:0;">${MAIL_ICON_SVG}</td>
              <td style="vertical-align:middle;font-size:12px;color:#374151;">
                <a href="mailto:support@cristianobleve.com" class="email-help-link" style="color:#111827;text-decoration:none;font-weight:500;">support@cristianobleve.com</a>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:middle;padding-right:10px;line-height:0;padding-top:8px;">${COMPASS_ICON_SVG}</td>
              <td style="vertical-align:middle;font-size:12px;color:#374151;padding-top:8px;">
                <a href="https://chrono.cristianobleve.com/resources" target="_blank" class="email-help-link" style="color:#111827;text-decoration:none;font-weight:500;">Chrono Documentation &amp; Help Center</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:36px;text-align:center;">
      <tr>
        <td align="center">
          <p style="margin:0 0 8px 0;font-size:11px;line-height:1.5;color:#9ca3af;">
            &copy; ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.
          </p>
          <p style="margin:0;font-size:11px;line-height:1.5;color:#9ca3af;">
            <a href="https://chrono.cristianobleve.com/settings/preferences" target="_blank" style="color:#6b7280;text-decoration:underline;margin:0 6px;">Unsubscribe</a>
            <span style="color:#d1d5db;">|</span>
            <a href="https://chrono.cristianobleve.com/privacy" target="_blank" style="color:#6b7280;text-decoration:underline;margin:0 6px;">Privacy Policy</a>
            <span style="color:#d1d5db;">|</span>
            <a href="https://chrono.cristianobleve.com/terms" target="_blank" style="color:#6b7280;text-decoration:underline;margin:0 6px;">Terms of Service</a>
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function renderWorkspaceInviteEmailHtml(
  params: WorkspaceInviteEmailParams,
  options?: EmailRenderOptions
): {
  subject: string;
  text: string;
  html: string;
} {
  const workspaceName = escapeHtml(params.workspaceName);
  const inviterName = escapeHtml(params.inviterName);
  const roleLabel = formatRole(params.role);
  const inviteUrl = params.inviteUrl;

  const subject = `You're invited to ${params.workspaceName} - as ${roleLabel}`;
  const preheader = `${params.inviterName} wants you on the team.`;

  const logoSrc = options?.logoUrl || (options?.isWebPreview ? "/chrono-logo-black.png" : "cid:chrono-logo");
  const currentYear = new Date().getFullYear();

  const text = [
    `Join ${params.workspaceName}`,
    ``,
    `${params.inviterName} invited you to join and collaborate in the ${params.workspaceName} workspace as ${roleLabel} - full visibility into projects, issues, and the roadmap.`,
    ``,
    `Workspace: ${params.workspaceName}`,
    `Assigned role: ${roleLabel}`,
    `Expires in: 7 days`,
    ``,
    `Accept invitation:`,
    inviteUrl,
    ``,
    `This invitation link is intended for ${params.to} and will expire in 7 days. For your security, please do not share this email with anyone.`,
    ``,
    `Need Help? Contact support@cristianobleve.com or visit https://chrono.cristianobleve.com/resources`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;color:#1f2937;">
  <div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#f3f4f6;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:48px 40px;text-align:left;">
          <tr>
            <td>

              <!-- Logo Centered -->
              <div style="text-align:center;margin-bottom:28px;">
                <img src="${escapeHtml(logoSrc)}" alt="CHRONO" width="135" height="23" class="email-logo-img" style="display:block;margin:0 auto;border:0;outline:none;font-family:'Söhne','Inter Display',sans-serif;font-size:18px;font-weight:800;letter-spacing:0.08em;color:#000000;" />
              </div>

              <!-- Header Centered -->
              <h1 class="email-title" style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;text-align:center;letter-spacing:-0.02em;">
                Join ${workspaceName}
              </h1>
              <p class="email-subtitle" style="margin:0 0 32px 0;font-size:13px;line-height:1.5;color:#6b7280;text-align:center;">
                Workspace invitation
              </p>

              <!-- Body Left-aligned -->
              <p class="email-greeting" style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                Hello,
              </p>
              <p class="email-desc" style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#374151;">
                ${inviterName} invited you to join and collaborate in the ${workspaceName} workspace as <strong class="email-strong" style="color:#111827;">${roleLabel}</strong> - full visibility into projects, issues, and the roadmap.
              </p>

              <!-- Clean Metadata (No nested box) -->
              <div class="email-meta" style="margin:0 0 28px 0;font-size:13px;line-height:1.8;color:#4b5563;">
                <span style="color:#6b7280;">Workspace:</span> <strong class="email-strong" style="color:#111827;">${workspaceName}</strong><br>
                <span style="color:#6b7280;">Assigned role:</span> <strong class="email-strong" style="color:#111827;">${roleLabel}</strong><br>
                <span style="color:#6b7280;">Expires in:</span> <span class="email-strong" style="color:#111827;">7 days</span>
              </div>

              <!-- Action Button Centered -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#000000;">
                    <a href="${escapeHtml(inviteUrl)}" target="_blank" class="email-btn" style="display:inline-block;padding:12px 32px;font-family:'Söhne','Inter Display',sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL Centered -->
              <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px 0;font-size:11px;line-height:1.5;text-align:center;word-break:break-all;">
                <a href="${escapeHtml(inviteUrl)}" target="_blank" class="email-direct-link" style="color:#111827;text-decoration:underline;">${escapeHtml(inviteUrl)}</a>
              </p>

              <!-- Single Security Notice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-notice" style="background-color:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:14px 16px;margin:0 0 32px 0;">
                <tr>
                  <td style="vertical-align:top;width:20px;padding-right:12px;line-height:0;">
                    ${SHIELD_ICON_SVG}
                  </td>
                  <td style="vertical-align:top;">
                    <strong class="email-notice-title" style="display:block;font-size:12px;font-weight:600;color:#111827;margin-bottom:3px;">Security Notice</strong>
                    <span class="email-notice-text" style="font-size:12px;line-height:1.5;color:#6b7280;">
                      This invitation link is intended for ${escapeHtml(params.to)} and will expire in 7 days. For your security, please do not share this email with anyone.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr class="email-hr" style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px 0;" />

              <!-- Support & Footer -->
              ${renderNeedHelpAndFooter()}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function renderPasswordRecoveryEmailHtml(
  params: PasswordRecoveryEmailParams,
  options?: EmailRenderOptions
): {
  subject: string;
  text: string;
  html: string;
} {
  const resetUrl = params.resetUrl;
  const subject = "Reset your Chrono password";
  const preheader = "This link expires in 24 hours.";

  const logoSrc = options?.logoUrl || (options?.isWebPreview ? "/chrono-logo-black.png" : "cid:chrono-logo");
  const currentYear = new Date().getFullYear();

  const text = [
    `Let's get you back in`,
    ``,
    `We received a request to reset the password for your Chrono account. Click the button below to choose a new one and return to your workspace.`,
    ``,
    `Request: Password reset`,
    `Valid for: 24 hours`,
    ``,
    `Reset password:`,
    resetUrl,
    ``,
    `This verification link will expire in 24 hours. For your security, please do not share this email with anyone.`,
    ``,
    `Need Help? Contact support@cristianobleve.com or visit https://chrono.cristianobleve.com/resources`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;color:#1f2937;">
  <div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#f3f4f6;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:48px 40px;text-align:left;">
          <tr>
            <td>

              <!-- Logo Centered -->
              <div style="text-align:center;margin-bottom:28px;">
                <img src="${escapeHtml(logoSrc)}" alt="CHRONO" width="135" height="23" class="email-logo-img" style="display:block;margin:0 auto;border:0;outline:none;font-family:'Söhne','Inter Display',sans-serif;font-size:18px;font-weight:800;letter-spacing:0.08em;color:#000000;" />
              </div>

              <!-- Header Centered -->
              <h1 class="email-title" style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;text-align:center;letter-spacing:-0.02em;">
                Let's get you back in
              </h1>
              <p class="email-subtitle" style="margin:0 0 32px 0;font-size:13px;line-height:1.5;color:#6b7280;text-align:center;">
                Password reset request
              </p>

              <!-- Body Left-aligned -->
              <p class="email-greeting" style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                Hello,
              </p>
              <p class="email-desc" style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#374151;">
                We received a request to reset the password for your Chrono account. Click the button below to choose a new one and return to your workspace.
              </p>

              <!-- Clean Metadata (No nested box) -->
              <div class="email-meta" style="margin:0 0 28px 0;font-size:13px;line-height:1.8;color:#4b5563;">
                <span style="color:#6b7280;">Request:</span> <strong class="email-strong" style="color:#111827;">Password reset</strong><br>
                <span style="color:#6b7280;">Valid for:</span> <span class="email-strong" style="color:#111827;">24 hours</span>
              </div>

              <!-- Action Button Centered -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#000000;">
                    <a href="${escapeHtml(resetUrl)}" target="_blank" class="email-btn" style="display:inline-block;padding:12px 32px;font-family:'Söhne','Inter Display',sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL Centered -->
              <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px 0;font-size:11px;line-height:1.5;text-align:center;word-break:break-all;">
                <a href="${escapeHtml(resetUrl)}" target="_blank" class="email-direct-link" style="color:#111827;text-decoration:underline;">${escapeHtml(resetUrl)}</a>
              </p>

              <!-- Single Security Notice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-notice" style="background-color:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:14px 16px;margin:0 0 32px 0;">
                <tr>
                  <td style="vertical-align:top;width:20px;padding-right:12px;line-height:0;">
                    ${SHIELD_ICON_SVG}
                  </td>
                  <td style="vertical-align:top;">
                    <strong class="email-notice-title" style="display:block;font-size:12px;font-weight:600;color:#111827;margin-bottom:3px;">Security Notice</strong>
                    <span class="email-notice-text" style="font-size:12px;line-height:1.5;color:#6b7280;">
                      This verification link will expire in 24 hours. For your security, please do not share this email with anyone.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr class="email-hr" style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px 0;" />

              <!-- Support & Footer -->
              ${renderNeedHelpAndFooter()}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function renderWelcomeEmailHtml(
  params: WelcomeEmailParams,
  options?: EmailRenderOptions
): {
  subject: string;
  text: string;
  html: string;
} {
  const name = params.name ? escapeHtml(params.name) : "there";
  const siteUrl = params.siteUrl || "https://chrono.cristianobleve.com";
  const subject = `Welcome aboard, ${params.name || "there"}`;
  const preheader = "Your workspace is live and ready to go.";

  const logoSrc = options?.logoUrl || (options?.isWebPreview ? "/chrono-logo-black.png" : "cid:chrono-logo");
  const currentYear = new Date().getFullYear();

  const text = [
    `Ready to ship with direction`,
    ``,
    `Hi ${params.name || "there"}, your Chrono account is all set. You now have a unified system to manage projects, resolve issues, and coordinate your roadmap.`,
    ``,
    `Status: Active`,
    `Capabilities: Projects, Issues, Timeline & AI Agent`,
    ``,
    `Launch Chrono Workspace:`,
    siteUrl,
    ``,
    `Your account is protected by standard authentication protocols. If you did not create this account, please contact our support team immediately.`,
    ``,
    `Need Help? Contact support@cristianobleve.com or visit https://chrono.cristianobleve.com/resources`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${getBaseStyles()}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;color:#1f2937;">
  <div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="background-color:#f3f4f6;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:48px 40px;text-align:left;">
          <tr>
            <td>

              <!-- Logo Centered -->
              <div style="text-align:center;margin-bottom:28px;">
                <img src="${escapeHtml(logoSrc)}" alt="CHRONO" width="135" height="23" class="email-logo-img" style="display:block;margin:0 auto;border:0;outline:none;font-family:'Söhne','Inter Display',sans-serif;font-size:18px;font-weight:800;letter-spacing:0.08em;color:#000000;" />
              </div>

              <!-- Header Centered -->
              <h1 class="email-title" style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;text-align:center;letter-spacing:-0.02em;">
                Ready to ship with direction
              </h1>
              <p class="email-subtitle" style="margin:0 0 32px 0;font-size:13px;line-height:1.5;color:#6b7280;text-align:center;">
                Welcome to Chrono
              </p>

              <!-- Body Left-aligned -->
              <p class="email-greeting" style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                Hi ${name},
              </p>
              <p class="email-desc" style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#374151;">
                Your Chrono account is all set. You now have a unified system to manage projects, resolve issues, and coordinate your roadmap.
              </p>

              <!-- Clean Metadata (No nested box) -->
              <div class="email-meta" style="margin:0 0 28px 0;font-size:13px;line-height:1.8;color:#4b5563;">
                <span style="color:#6b7280;">Status:</span> <strong class="email-strong" style="color:#111827;">Active</strong><br>
                <span style="color:#6b7280;">Capabilities:</span> <strong class="email-strong" style="color:#111827;">Projects, Issues, Timeline &amp; AI Agent</strong>
              </div>

              <!-- Action Button Centered -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#000000;">
                    <a href="${escapeHtml(siteUrl)}" target="_blank" class="email-btn" style="display:inline-block;padding:12px 32px;font-family:'Söhne','Inter Display',sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.01em;">
                      Launch Chrono Workspace
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL Centered -->
              <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px 0;font-size:11px;line-height:1.5;text-align:center;word-break:break-all;">
                <a href="${escapeHtml(siteUrl)}" target="_blank" class="email-direct-link" style="color:#111827;text-decoration:underline;">${escapeHtml(siteUrl)}</a>
              </p>

              <!-- Single Security Notice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-notice" style="background-color:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:14px 16px;margin:0 0 32px 0;">
                <tr>
                  <td style="vertical-align:top;width:20px;padding-right:12px;line-height:0;">
                    ${SHIELD_ICON_SVG}
                  </td>
                  <td style="vertical-align:top;">
                    <strong class="email-notice-title" style="display:block;font-size:12px;font-weight:600;color:#111827;margin-bottom:3px;">Security Notice</strong>
                    <span class="email-notice-text" style="font-size:12px;line-height:1.5;color:#6b7280;">
                      Your account is protected by standard authentication protocols. If you did not create this account, please contact our support team immediately.
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr class="email-hr" style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px 0;" />

              <!-- Support & Footer -->
              ${renderNeedHelpAndFooter()}

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendWorkspaceInviteEmail(
  params: WorkspaceInviteEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderWorkspaceInviteEmailHtml(params, { isWebPreview: false });

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
      attachments: getLogoAttachment(),
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWorkspaceInviteEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}

export async function sendPasswordRecoveryEmail(
  params: PasswordRecoveryEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderPasswordRecoveryEmailHtml(params, { isWebPreview: false });

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
      attachments: getLogoAttachment(),
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendPasswordRecoveryEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}

export async function sendWelcomeEmail(
  params: WelcomeEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS is not configured on the server." };
  }

  const { subject, text, html } = renderWelcomeEmailHtml(params, { isWebPreview: false });

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
      attachments: getLogoAttachment(),
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWelcomeEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}
