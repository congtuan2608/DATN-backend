import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { generateEmailTemplate } from "../utils/emailHTML.js";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io", //"sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const sendEmailHandler = async ({ to, subject, text, values }) => {
  try {
    const info = await transporter.sendMail({
      from: `Go Green <${process.env.MAILTRAP_FROM}>`, // sender address
      to: (to ?? []).join(", "), // list of receivers
      subject: subject ?? "Hello ✔", // Subject line
      text: text ?? "Hello" + (to ?? []).join(", "), // plain text body
      html: generateEmailTemplate(values), // html body
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};
