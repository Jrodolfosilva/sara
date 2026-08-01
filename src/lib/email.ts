import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | undefined;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM ?? "Busca Pebas <contato@buscapebas.com.br>",
    to,
    subject,
    html,
  });
}
