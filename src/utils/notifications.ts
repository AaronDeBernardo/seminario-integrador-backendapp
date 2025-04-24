import { environment } from "../config/env.config.js";
import nodemailer from "nodemailer";

const emailListDev = ["aarondebernardo@gmail.com", "santiagospini@gmail.com"];

export const sendEmail = async (
  subject: string,
  htmlContent: string,
  receivers: string[]
) => {
  receivers = environment.production ? receivers : emailListDev;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: environment.emailAccount.email,
      pass: environment.emailAccount.password,
    },
  });

  const mailOptions = {
    from: environment.emailAccount.email,
    to: receivers,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
