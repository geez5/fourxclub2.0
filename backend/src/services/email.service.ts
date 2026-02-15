
import { Resend } from 'resend';
import { config } from '../config/env.js';
import fs from 'fs';
import path from 'path';

const resend = new Resend(config.email.resendApiKey);

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        console.log(`[Email Service] Sending welcome email to ${email}`);

        // Resolve PDF path - robust check for different environments
        // Try multiple potential locations for the PDF
        const possiblePaths = [
            path.resolve(process.cwd(), 'pdf', 'fourxclub free course.pdf'),
            path.resolve(process.cwd(), 'backend', 'pdf', 'fourxclub free course.pdf'),
            path.resolve(__dirname, '../../pdf', 'fourxclub free course.pdf'),
            path.resolve(__dirname, '../../../pdf', 'fourxclub free course.pdf')
        ];

        let pdfPath = '';
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                pdfPath = p;
                break;
            }
        }

        if (!pdfPath) {
            console.error('[Email Service] PDF file not found to attach!');
            // Still send email but without attachment or log error? 
            // Better to log and optimize.
        } else {
            console.log(`[Email Service] Found PDF at: ${pdfPath}`);
        }

        const attachments = pdfPath ? [{
            filename: 'fourxclub-free-course.pdf',
            content: fs.readFileSync(pdfPath),
        }] : [];

        const { data, error } = await resend.emails.send({
            from: 'FourXclub <onboarding@resend.dev>', // Use verified domain in production if available
            to: [email],
            subject: 'Welcome to FourXclub! Here is your Free Course PDF',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1>Welcome to FourXclub, ${name}!</h1>
                    <p>We are excited to have you join our community.</p>
                    <p>As promised, here is your <strong>Free Course PDF</strong> attached to this email.</p>
                    <p>Get started with your trading journey today!</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The FourXclub Team</p>
                </div>
            `,
            attachments: attachments
        });

        if (error) {
            console.error('[Email Service] Error sending email:', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('[Email Service] Email sent successfully:', data);
        return { success: true, data };
    } catch (err) {
        console.error('[Email Service] Unexpected error:', err);
        return { success: false, error: err };
    }
};
