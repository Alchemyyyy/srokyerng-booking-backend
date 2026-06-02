const emailService = require("../services/email.service");

const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  await emailService.sendEmail({
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

const sendEmailVerificationEmail = async ({ to, fullName, verificationUrl }) => {
  await emailService.sendEmail({
    to,
    subject: "Verify your SrokYerng Booking email",
    text: [
      `Hello ${fullName},`,
      "",
      "Use this link to verify your email address:",
      verificationUrl,
      "",
      "This link expires in 24 hours. If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hello ${fullName},</p>
      <p>Use this link to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
};
