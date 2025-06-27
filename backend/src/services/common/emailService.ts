import { Resend } from "resend";
import { EmailType } from "../../@types";
import logger from "../../logger";
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Initialize with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
        const response = await resend.emails.send({
            from: 'Ride-Recap <onboarding@resend.dev>', // TODO: change when production current dev testing purpose
            to: 'yomal.2018471@iit.ac.lk',  // TODO: change when production current dev testing purpose
            subject: emailSubject,
            html: emailHtml,
            text: plainText,
        });

        logger.info('Resend API response:', response);

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
