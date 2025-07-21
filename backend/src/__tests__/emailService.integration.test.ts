import dotenv from 'dotenv';
import { sendEmail } from '../services/common/emailService';
import { EmailType } from '../@types';

// Load environment variables
dotenv.config();

// This is an integration test that will actually send emails
// Only run this when you want to test the real email functionality
describe('Email Service Integration Tests', () => {
    // Skip these tests by default to avoid sending emails during regular test runs
    describe('Real Email Sending', () => {
        it('should send a test email successfully', async () => {
            const emailOptions = {
                to: 'al-dev-testing@endtest-mail.io', // Replace with your actual test email
                subject: 'Integration Test Email',
                data: {
                    name: 'Test User',
                    message: 'This is a test email from the integration test suite.',
                    timestamp: new Date().toISOString()
                },
                type: 'REPAIR' as EmailType, // Adjust based on your EmailType enum
                html: true,
                templateName: 'test-template' // Make sure this template exists
            };

            const response = await sendEmail(emailOptions);

            expect(response).toBeDefined();
        }, 30000); // 30 second timeout for email sending

        it('should handle plain text emails', async () => {
            const emailOptions = {
                to: 'al-dev-testing@endtest-mail.io',
                subject: 'Plain Text Test Email',
                data: {
                    message: 'This is a plain text test email.'
                },
                type: 'REPAIR' as EmailType,
                html: false,
                templateName: 'test-template'
            };

            const response = await sendEmail(emailOptions);

            expect(response).toBeDefined();
        }, 30000);

        it('should use default subject when none provided', async () => {
            const emailOptions = {
                to: 'al-dev-testing@endtest-mail.io',
                data: { test: 'data' },
                type: 'REPAIR' as EmailType,
                html: false,
                templateName: 'test-template'
            };

            const response = await sendEmail(emailOptions);

            expect(response).toBeDefined();
        }, 30000);

        it('should throw error for invalid email', async () => {
            const emailOptions = {
                to: 'invalid-email',
                subject: 'Test Email',
                data: { test: 'data' },
                type: 'REPAIR' as EmailType,
                html: false,
                templateName: 'test-template'
            };

            await expect(sendEmail(emailOptions)).rejects.toThrow();
        }, 30000);
    });

    // These tests run by default and don't send actual emails
    describe('Email Service Validation', () => {
        it('should validate environment variables are set', () => {
            expect(process.env.GMAIL_EMAIL).toBeDefined();
            expect(process.env.GMAIL_APP_PASSWORD).toBeDefined();
        });
    });
});