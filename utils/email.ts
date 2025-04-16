import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  });
}
