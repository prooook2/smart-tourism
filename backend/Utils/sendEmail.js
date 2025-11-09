// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Plateforme Culturelle" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
