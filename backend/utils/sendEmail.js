import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async ({ email, subject, message, attachments }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `"HostelMate" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject,
        text: message,
        attachments: attachments || []
    });

    console.log(`Email sent to ${email}`);
};

export default sendEmail;
