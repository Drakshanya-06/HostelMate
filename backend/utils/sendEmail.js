import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const canSendEmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_FROM && process.env.EMAIL_USER !== 'test@example.com');

export const sendEmail = async ({ email, subject, message, attachments }) => {
    if (!canSendEmail) {
        console.warn('Email not configured. Skipping email send in development.', { email, subject, message });
        return { success: false, info: 'Email delivery disabled in development' };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"HostelMate" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject,
            text: message,
            attachments: attachments || []
        });

        console.log(`Email sent to ${email}`, info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error('Email send failed:', error.message || error);
        if (process.env.NODE_ENV !== 'production') {
            return { success: false, error: error.message || 'Email send failed' };
        }
        throw error;
    }
};

export default sendEmail;
