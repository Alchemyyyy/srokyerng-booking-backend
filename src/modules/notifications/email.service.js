const emailService = require("../../services/email.service");

const sendNotificationEmail = async ({ to, subject, title, message, actionUrl }) => {
  const text = [
    title,
    "",
    message,
    actionUrl ? "" : null,
    actionUrl ? `Open: ${actionUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = [
    `<h2>${title}</h2>`,
    `<p>${message}</p>`,
    actionUrl ? `<p><a href="${actionUrl}">Open notification</a></p>` : "",
  ].join("");

  return emailService.sendEmailIfConfigured({
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  isSmtpConfigured: emailService.isSmtpConfigured,
  sendEmail: emailService.sendEmailIfConfigured,
  sendNotificationEmail,
};
