import nodemailer from 'nodemailer';
import { EmailType } from "../../@types";
import logger from "../../logger";
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Initialize Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL, 
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export interface EmailOptions {
    to: string;
    subject?: string;
    data: any; // RepairEmail --> generic ??
    type: EmailType;
    html: boolean; // Make html optional
    templateName: string; // Make html optional
}

export const sendEmail = async ({ to, subject, data, type, html, templateName }: EmailOptions) => {
    let emailHtml: string | undefined = undefined;
    const plainText = 'This is a plain text fallback for the email.';

    if (html) {
        emailHtml = generateEmailHTML(type, data, templateName)
    }

    const emailSubject = subject || `New ${type} record created`;

    try {
        const mailOptions = {
            from: process.env.GMAIL_USER || process.env.EMAIL_FROM || 'Ride-Recap <your-email@gmail.com>',
            to: to, // Use the actual recipient instead of hardcoded email
            subject: emailSubject,
            html: emailHtml,
            text: plainText,
        };

        const response = await transporter.sendMail(mailOptions);

        logger.info('Nodemailer response:', response);
        logger.info(`[EMAIL:${type}] sent to ${to}`);
        return response;
    } catch (error) {
        logger.error(`[EMAIL:${type}] failed:`, error);
        throw error;
    }
};

const generateEmailHTML = (type: EmailType, data: any, templateName: string): string => {
    try {
        return getCompiledTemplate(templateName, data);
    } catch (err) {
        logger.error(`Failed to render email template for type ${type}`, err);
        return `<p>Template not found for type: ${type}</p>`;
    }
};

function getCompiledTemplate(templateName: string, data: any): string {
    const templatePath = path.join(__dirname, "../..", 'emailTemplates', `${templateName}.hbs`); // TODO: path when compiled
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    return template(data); // returns HTML string
}
