require('dotenv').config();
const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log("Sending email with user:", process.env.EMAIL_USER);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'sujeeva8300@gmail.com',
      subject: 'Test Notification',
      text: 'This is a test'
    });

    console.log("Success:", info.messageId);
  } catch (error) {
    console.error("Error:", error);
  }
}
testEmail();
