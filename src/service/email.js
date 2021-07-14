const nodemailer = require("nodemailer");

async function sendEmail(
  mailOptions = {
    from: "Sender Name <sender@server.com>",
    to: "admin@admin.com",
    subject: "hello subject",
    text: "hello text",
    html: "<b>Hello world html</b>",
  }
) {
  // let testAccount = await nodemailer.createTestAccount();
  // create reusable transporter object using the default transport
  const emailConfig = {
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    secure: process.env.EMAIL_SMTP_SECURE,
    auth: {
      user: process.env.EMAIL_SMTP_AUTH_USERNAME,
      pass: process.env.EMAIL_SMTP_AUTH_PASSWORD,
    },
  };
  console.log("emailConfig", emailConfig);
  let transporter = nodemailer.createTransport(emailConfig);

  let info = await transporter.sendMail(mailOptions);

  console.log("message sent: s%", info.messageId);
  console.log("preview URL: %s", nodemailer.getTestMessageUrl(info));
}

exports.sendEmail = sendEmail;
