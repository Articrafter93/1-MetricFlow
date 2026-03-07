import nodemailer from "nodemailer";

type InviteEmailPayload = {
  to: string;
  workspaceName: string;
  role: string;
  inviteUrl: string;
};

export async function sendInviteEmail(payload: InviteEmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;

  if (!host || !user || !pass || !from) {
    return { sent: false, reason: "smtp-not-configured" as const };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: `Invitacion a ${payload.workspaceName} en MetricFlow`,
    html: `
      <p>Recibiste una invitacion para unirte a <b>${payload.workspaceName}</b> como <b>${payload.role}</b>.</p>
      <p><a href="${payload.inviteUrl}">Aceptar invitacion</a></p>
      <p>Si no esperabas este correo, puedes ignorarlo.</p>
    `,
  });

  return { sent: true as const };
}
