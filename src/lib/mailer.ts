import nodemailer from "nodemailer";

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

export async function sendWorkspaceInviteEmail(
  params: WorkspaceInviteEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS non configurata sul server." };
  }

  const workspaceName = escapeHtml(params.workspaceName);
  const inviterName = escapeHtml(params.inviterName);
  const roleLabel = params.role === "admin" ? "Amministratore" : params.role === "owner" ? "Proprietario" : "Associato";
  const inviteUrl = params.inviteUrl;

  const subject = `Invito al workspace ${params.workspaceName} su Chrono`;

  const text = [
    `Ciao,`,
    ``,
    `${params.inviterName} ti ha invitato a collaborare nel workspace "${params.workspaceName}" su Chrono con il ruolo di ${roleLabel}.`,
    ``,
    `Per accettare l'invito ed entrare nel workspace, apri questo link:`,
    inviteUrl,
    ``,
    `Il link scade tra 7 giorni.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#121316;border:1px solid #27272a;border-radius:12px;padding:32px;">
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-transform:uppercase;">CHRONO</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#ffffff;line-height:1.3;">
                Invito a ${workspaceName}
              </h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                <strong style="color:#ffffff;">${inviterName}</strong> ti ha invitato a entrare nel workspace <strong style="color:#ffffff;">${workspaceName}</strong> su Chrono con il ruolo di <strong style="color:#ffffff;">${roleLabel}</strong>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#ffffff;">
                    <a href="${escapeHtml(inviteUrl)}" target="_blank" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:600;color:#09090b;text-decoration:none;border-radius:8px;">
                      Accetta invito e accedi
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#71717a;">
                Se il pulsante non si apre, copia e incolla questo URL nel browser:
              </p>
              <p style="margin:0 0 20px 0;font-size:12px;line-height:1.5;word-break:break-all;color:#d4d4d8;font-family:monospace;">
                ${escapeHtml(inviteUrl)}
              </p>
              <p style="margin:0;padding-top:16px;border-top:1px solid #27272a;font-size:11px;color:#71717a;">
                L'invito ha validità di 7 giorni. Se non conosci il mittente puoi ignorare questa comunicazione.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendWorkspaceInviteEmail error:", err);
    return { sent: false, error: err?.message || "Errore invio email SMTP" };
  }
}

export async function sendPasswordRecoveryEmail(
  params: PasswordRecoveryEmailParams
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, error: "SMTP_PASS non configurata sul server." };
  }

  const resetUrl = params.resetUrl;
  const subject = "Reimposta la tua password su Chrono";

  const text = [
    `Ciao,`,
    ``,
    `Hai richiesto il ripristino della password per il tuo account Chrono.`,
    `Apri questo link per scegliere una nuova password:`,
    resetUrl,
    ``,
    `Se non hai richiesto tu questa operazione, ignora questa email.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#121316;border:1px solid #27272a;border-radius:12px;padding:32px;">
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-transform:uppercase;">CHRONO</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#ffffff;line-height:1.3;">
                Ripristino della password
              </h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                Hai richiesto di reimpostare la password del tuo account Chrono. Clicca il pulsante qui sotto per scegliere una nuova password.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background-color:#ffffff;">
                    <a href="${escapeHtml(resetUrl)}" target="_blank" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:600;color:#09090b;text-decoration:none;border-radius:8px;">
                      Imposta nuova password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#71717a;">
                Se il pulsante non si apre, copia e incolla questo URL nel browser:
              </p>
              <p style="margin:0 0 20px 0;font-size:12px;line-height:1.5;word-break:break-all;color:#d4d4d8;font-family:monospace;">
                ${escapeHtml(resetUrl)}
              </p>
              <p style="margin:0;padding-top:16px;border-top:1px solid #27272a;font-size:11px;color:#71717a;">
                Se non hai richiesto il cambio password puoi ignorare questa comunicazione.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    console.error("[Mailer] sendPasswordRecoveryEmail error:", err);
    return { sent: false, error: err?.message || "Errore invio email SMTP" };
  }
}
