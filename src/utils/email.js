const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

const getTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    const error = new Error("SMTP email configuration is missing");
    error.statusCode = 500;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your SrokYerng Booking password",
    text: [
      `Hello ${fullName},`,
      "",
      "Use this link to reset your password:",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hello ${fullName},</p>
      <p>Use this link to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};
