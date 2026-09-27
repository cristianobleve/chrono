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
  footerLogoUrl?: string;
  shieldIconUrl?: string;
  badgeIconUrl?: string;
}

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

function getEmailAttachments(type: "invite" | "recovery" | "welcome"): SendMailOptions["attachments"] {
  const publicDir = path.join(process.cwd(), "public");
  const attachments: NonNullable<SendMailOptions["attachments"]> = [];

  // Main Chrono Logo
  const mainLogo = path.join(publicDir, "chrono-logo-black.png");
  if (fs.existsSync(mainLogo)) {
    attachments.push({
      filename: "chrono-logo.png",
      content: fs.readFileSync(mainLogo),
      cid: "chrono-logo",
      contentType: "image/png",
    });
  }

  // Footer Logo (square)
  const footerLogo = path.join(publicDir, "email-footer-logo.png");
  if (fs.existsSync(footerLogo)) {
    attachments.push({
      filename: "chrono-footer-logo.png",
      content: fs.readFileSync(footerLogo),
      cid: "chrono-footer-logo",
      contentType: "image/png",
    });
  }

  // Shield Icon
  const shieldIcon = path.join(publicDir, "email-shield.png");
  if (fs.existsSync(shieldIcon)) {
    attachments.push({
      filename: "email-shield.png",
      content: fs.readFileSync(shieldIcon),
      cid: "email-shield",
      contentType: "image/png",
    });
  }

  // Type specific badge
  const badgeMap: Record<string, string> = {
    invite: "email-rocket.png",
    welcome: "email-sparkles.png",
    recovery: "email-key.png",
  };
  const badgeFile = badgeMap[type];
  if (badgeFile) {
    const badgePath = path.join(publicDir, badgeFile);
    if (fs.existsSync(badgePath)) {
      attachments.push({
        filename: badgeFile,
        content: fs.readFileSync(badgePath),
        cid: "email-badge",
        contentType: "image/png",
      });
    }
  }

  return attachments;
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
      background-color: #e5e5e9;
      color: #202124;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
      max-width: 100%;
    }
    a {
      color: inherit;
    }
    .mono {
      font-family: 'Geist Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace !important;
    }

    .email-wrapper {
      width: 100%;
      background-color: #e5e5e9;
      padding: 46px 20px;
    }

    .email-container {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #dcdce2;
    }

    .content {
      padding: 44px 36px 36px 36px;
    }

    .brand {
      text-align: center;
      padding-bottom: 26px;
    }

    .brand-logo {
      width: 135px;
      height: 23px;
      margin: 0 auto;
      display: block;
    }

    .title {
      margin: 0;
      font-family: 'Söhne', 'Inter Display', sans-serif;
      text-align: center;
      font-size: 23px;
      line-height: 30px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 8px 0 0;
      text-align: center;
      font-size: 14px;
      line-height: 22px;
      color: #4b5563;
    }

    .body-copy {
      padding-top: 28px;
    }

    .body-copy p {
      margin: 0 0 16px;
      font-size: 15px;
      line-height: 24px;
      color: #303640;
    }

    .verify-button-wrapper {
      text-align: center;
      padding: 8px 0 24px;
    }

    .verify-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      padding: 13px 32px;
      border-radius: 7px;
      letter-spacing: -0.01em;
    }

    .copy-link {
      text-align: center;
      padding: 0 20px 28px;
    }

    .copy-link p {
      margin: 0 0 6px;
      font-size: 13px;
      line-height: 20px;
      color: #4b5563;
    }

    .verification-url {
      font-size: 12px;
      line-height: 18px;
      color: #2563eb;
      word-break: break-all;
    }

    .verification-url a {
      color: #2563eb;
      text-decoration: underline;
    }

    .security-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 18px;
      margin-top: 0;
    }

    .security-table {
      width: 100%;
    }

    .security-icon {
      width: 24px;
      vertical-align: top;
      padding-right: 12px;
    }

    .security-title {
      margin: 0 0 4px;
      font-size: 13px;
      line-height: 18px;
      font-weight: 700;
      color: #111827;
    }

    .security-text {
      margin: 0;
      font-size: 12px;
      line-height: 18px;
      color: #4b5563;
    }

    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 32px 0 26px;
    }

    /* Google Docs sharing style footer */

    .gmail-section {
      width: 100%;
      border-top: 0 solid #e5e7eb;
      margin-top: 0;
      padding-top: 0;
    }

    .gmail-left {
      width: 78%;
      vertical-align: top;
      padding-right: 20px;
    }

    .gmail-right {
      width: 22%;
      vertical-align: middle;
      text-align: right;
    }

    .gmail-address {
      margin: 0;
      font-size: 11px;
      line-height: 17px;
      color: #6b7280;
    }

    .chrono-footer-logo {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      margin-left: auto;
      display: inline-block;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px !important;
      }
      .content {
        padding: 32px 20px 24px 20px !important;
      }
      .title {
        font-size: 21px !important;
      }
      .gmail-left,
      .gmail-right {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
      }
      .gmail-right {
        padding-top: 18px !important;
        text-align: left !important;
      }
      .chrono-footer-logo {
        margin-left: 0 !important;
      }
    }
  `;
}

function renderGoogleDocsStyleFooter(userEmail: string, footerLogoSrc: string): string {
  const currentYear = new Date().getFullYear();
  const emailEscaped = escapeHtml(userEmail || "your-email@example.com");

  return `
    <table role="presentation" class="gmail-section" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="gmail-left">
          <p class="gmail-address" style="margin:0 0 8px;font-size:11px;line-height:17px;color:#6b7280;">
            This email was sent to <span style="color:#111827;font-weight:500;">${emailEscaped}</span> because you have an account on Chrono.
            If you didn't request this, you can safely ignore this email - no changes have been made to your account.
          </p>
          <p class="gmail-address" style="margin:0 0 10px;font-size:11px;line-height:17px;color:#6b7280;">
            &copy; ${currentYear} Chrono, part of <a href="https://cristianobleve.com" target="_blank" style="color:#4b5563;text-decoration:none;font-weight:500;">cristianobleve.com</a>. All rights reserved.
          </p>
          <p style="margin:0;font-size:11px;line-height:17px;">
            <a href="https://chrono.cristianobleve.com/resources" target="_blank" style="color:#2563eb;text-decoration:underline;margin-right:12px;">Help Center</a>
            <a href="https://chrono.cristianobleve.com/security" target="_blank" style="color:#2563eb;text-decoration:underline;margin-right:12px;">Privacy Policy</a>
            <a href="https://chrono.cristianobleve.com/settings/preferences" target="_blank" style="color:#2563eb;text-decoration:underline;">Notification Preferences</a>
          </p>
        </td>
        <td class="gmail-right">
          <img
            src="${escapeHtml(footerLogoSrc)}"
            alt="Chrono"
            class="chrono-footer-logo"
            width="48"
            height="48"
            style="width:48px;height:48px;border-radius:10px;display:inline-block;"
          />
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
  const footerLogoSrc = options?.footerLogoUrl || (options?.isWebPreview ? "/email-footer-logo.png" : "cid:chrono-footer-logo");
  const shieldIconSrc = options?.shieldIconUrl || (options?.isWebPreview ? "/email-shield.png" : "cid:email-shield");
  const badgeIconSrc = options?.badgeIconUrl || (options?.isWebPreview ? "/email-rocket.png" : "cid:email-badge");
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
    `This email was sent to ${params.to} because you have an account on Chrono.`,
    `If you didn't request this, you can safely ignore this email - no changes have been made to your account.`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
  <style>
    ${getBaseStyles()}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#e5e5e9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="email-wrapper">

        <table
          role="presentation"
          class="email-container"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          align="center"
        >
          <!-- CONTENT -->
          <tr>
            <td class="content">

              <!-- BRAND LOGO -->
              <div class="brand">
                <img
                  src="${escapeHtml(logoSrc)}"
                  alt="Chrono"
                  class="brand-logo"
                  width="135"
                  height="23"
                >
              </div>

              <!-- FESTIVE BADGE -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px auto;">
                <tr>
                  <td style="background-color:#eff6ff;border:1px solid #dbeafe;border-radius:100px;padding:4px 14px 4px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                          <img src="${escapeHtml(badgeIconSrc)}" alt="" width="16" height="16" style="display:block;border:0;" />
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#2563eb;letter-spacing:0.01em;">
                          Hooray! You're invited
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TITLE & SUBTITLE -->
              <h1 class="title">
                Join ${workspaceName}
              </h1>

              <p class="subtitle">
                Workspace invitation
              </p>

              <!-- BODY COPY -->
              <div class="body-copy">
                <p>
                  Hello,
                </p>

                <p>
                  ${inviterName} invited you to join and collaborate in the ${workspaceName} workspace as <strong style="color:#111827;">${roleLabel}</strong> - full visibility into projects, issues, and the roadmap.
                </p>

                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#4b5563;">
                  <span style="color:#6b7280;">Workspace:</span> <strong style="color:#111827;">${workspaceName}</strong><br>
                  <span style="color:#6b7280;">Assigned role:</span> <strong style="color:#111827;">${roleLabel}</strong><br>
                  <span style="color:#6b7280;">Expires in:</span> <span style="color:#111827;">7 days</span>
                </p>
              </div>

              <!-- BUTTON -->
              <div class="verify-button-wrapper">
                <a
                  href="${escapeHtml(inviteUrl)}"
                  target="_blank"
                  class="verify-button"
                >
                  Accept invitation
                </a>
              </div>

              <!-- COPY LINK -->
              <div class="copy-link">
                <p>
                  Or copy and paste this link into your browser:
                </p>
                <div class="verification-url">
                  <a href="${escapeHtml(inviteUrl)}" target="_blank">${escapeHtml(inviteUrl)}</a>
                </div>
              </div>

              <!-- SECURITY BOX -->
              <div class="security-box">
                <table
                  role="presentation"
                  class="security-table"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <td class="security-icon">
                      <img src="${escapeHtml(shieldIconSrc)}" alt="Security" width="20" height="20" style="display:block;border:0;" />
                    </td>
                    <td>
                      <p class="security-title">
                        Security Notice
                      </p>
                      <p class="security-text">
                        This invitation link is intended for ${escapeHtml(params.to)} and will expire in 7 days. For your security, please do not share this email with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- DIVIDER -->
              <div class="divider"></div>

              <!-- FOOTER (GOOGLE DOCS SHARING STYLE) -->
              ${renderGoogleDocsStyleFooter(params.to, footerLogoSrc)}

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
  const footerLogoSrc = options?.footerLogoUrl || (options?.isWebPreview ? "/email-footer-logo.png" : "cid:chrono-footer-logo");
  const shieldIconSrc = options?.shieldIconUrl || (options?.isWebPreview ? "/email-shield.png" : "cid:email-shield");
  const badgeIconSrc = options?.badgeIconUrl || (options?.isWebPreview ? "/email-key.png" : "cid:email-badge");
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
    `This email was sent to ${params.to} because you have an account on Chrono.`,
    `If you didn't request this, you can safely ignore this email - no changes have been made to your account.`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
  <style>
    ${getBaseStyles()}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#e5e5e9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="email-wrapper">

        <table
          role="presentation"
          class="email-container"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          align="center"
        >
          <!-- CONTENT -->
          <tr>
            <td class="content">

              <!-- BRAND LOGO -->
              <div class="brand">
                <img
                  src="${escapeHtml(logoSrc)}"
                  alt="Chrono"
                  class="brand-logo"
                  width="135"
                  height="23"
                >
              </div>

              <!-- SECURITY BADGE -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px auto;">
                <tr>
                  <td style="background-color:#eff6ff;border:1px solid #dbeafe;border-radius:100px;padding:4px 14px 4px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                          <img src="${escapeHtml(badgeIconSrc)}" alt="" width="16" height="16" style="display:block;border:0;" />
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#2563eb;letter-spacing:0.01em;">
                          Security Verification
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TITLE & SUBTITLE -->
              <h1 class="title">
                Let's get you back in
              </h1>

              <p class="subtitle">
                Password reset request
              </p>

              <!-- BODY COPY -->
              <div class="body-copy">
                <p>
                  Hello,
                </p>

                <p>
                  We received a request to reset the password for your Chrono account. Click the button below to choose a new one and return to your workspace.
                </p>

                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#4b5563;">
                  <span style="color:#6b7280;">Request:</span> <strong style="color:#111827;">Password reset</strong><br>
                  <span style="color:#6b7280;">Valid for:</span> <span style="color:#111827;">24 hours</span>
                </p>
              </div>

              <!-- BUTTON -->
              <div class="verify-button-wrapper">
                <a
                  href="${escapeHtml(resetUrl)}"
                  target="_blank"
                  class="verify-button"
                >
                  Reset password
                </a>
              </div>

              <!-- COPY LINK -->
              <div class="copy-link">
                <p>
                  Or copy and paste this link into your browser:
                </p>
                <div class="verification-url">
                  <a href="${escapeHtml(resetUrl)}" target="_blank">${escapeHtml(resetUrl)}</a>
                </div>
              </div>

              <!-- SECURITY BOX -->
              <div class="security-box">
                <table
                  role="presentation"
                  class="security-table"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <td class="security-icon">
                      <img src="${escapeHtml(shieldIconSrc)}" alt="Security" width="20" height="20" style="display:block;border:0;" />
                    </td>
                    <td>
                      <p class="security-title">
                        Security Notice
                      </p>
                      <p class="security-text">
                        This verification link will expire in 24 hours. For your security, please do not share this email with anyone.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- DIVIDER -->
              <div class="divider"></div>

              <!-- FOOTER (GOOGLE DOCS SHARING STYLE) -->
              ${renderGoogleDocsStyleFooter(params.to, footerLogoSrc)}

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
  const footerLogoSrc = options?.footerLogoUrl || (options?.isWebPreview ? "/email-footer-logo.png" : "cid:chrono-footer-logo");
  const shieldIconSrc = options?.shieldIconUrl || (options?.isWebPreview ? "/email-shield.png" : "cid:email-shield");
  const badgeIconSrc = options?.badgeIconUrl || (options?.isWebPreview ? "/email-sparkles.png" : "cid:email-badge");
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
    `This email was sent to ${params.to} because you have an account on Chrono.`,
    `If you didn't request this, you can safely ignore this email - no changes have been made to your account.`,
    ``,
    `© ${currentYear} Chrono, part of cristianobleve.com. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
  <style>
    ${getBaseStyles()}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#e5e5e9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="email-wrapper">

        <table
          role="presentation"
          class="email-container"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          align="center"
        >
          <!-- CONTENT -->
          <tr>
            <td class="content">

              <!-- BRAND LOGO -->
              <div class="brand">
                <img
                  src="${escapeHtml(logoSrc)}"
                  alt="Chrono"
                  class="brand-logo"
                  width="135"
                  height="23"
                >
              </div>

              <!-- FESTIVE BADGE -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px auto;">
                <tr>
                  <td style="background-color:#eff6ff;border:1px solid #dbeafe;border-radius:100px;padding:4px 14px 4px 10px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                          <img src="${escapeHtml(badgeIconSrc)}" alt="" width="16" height="16" style="display:block;border:0;" />
                        </td>
                        <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#2563eb;letter-spacing:0.01em;">
                          Hooray! You're in
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TITLE & SUBTITLE -->
              <h1 class="title">
                Ready to ship with direction
              </h1>

              <p class="subtitle">
                Welcome to Chrono
              </p>

              <!-- BODY COPY -->
              <div class="body-copy">
                <p>
                  Hi ${name},
                </p>

                <p>
                  Your Chrono account is all set. You now have a unified system to manage projects, resolve issues, and coordinate your roadmap.
                </p>

                <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#4b5563;">
                  <span style="color:#6b7280;">Status:</span> <strong style="color:#111827;">Active</strong><br>
                  <span style="color:#6b7280;">Capabilities:</span> <strong style="color:#111827;">Projects, Issues, Timeline &amp; AI Agent</strong>
                </p>
              </div>

              <!-- BUTTON -->
              <div class="verify-button-wrapper">
                <a
                  href="${escapeHtml(siteUrl)}"
                  target="_blank"
                  class="verify-button"
                >
                  Launch Chrono Workspace
                </a>
              </div>

              <!-- COPY LINK -->
              <div class="copy-link">
                <p>
                  Or copy and paste this link into your browser:
                </p>
                <div class="verification-url">
                  <a href="${escapeHtml(siteUrl)}" target="_blank">${escapeHtml(siteUrl)}</a>
                </div>
              </div>

              <!-- SECURITY BOX -->
              <div class="security-box">
                <table
                  role="presentation"
                  class="security-table"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>
                    <td class="security-icon">
                      <img src="${escapeHtml(shieldIconSrc)}" alt="Security" width="20" height="20" style="display:block;border:0;" />
                    </td>
                    <td>
                      <p class="security-title">
                        Security Notice
                      </p>
                      <p class="security-text">
                        Your account is protected by standard authentication protocols. If you did not create this account, please contact our support team immediately.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- DIVIDER -->
              <div class="divider"></div>

              <!-- FOOTER (GOOGLE DOCS SHARING STYLE) -->
              ${renderGoogleDocsStyleFooter(params.to, footerLogoSrc)}

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
      attachments: getEmailAttachments("invite"),
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
      attachments: getEmailAttachments("recovery"),
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
      attachments: getEmailAttachments("welcome"),
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWelcomeEmail error:", err);
    return { sent: false, error: err?.message || "Failed to send email via SMTP." };
  }
}
