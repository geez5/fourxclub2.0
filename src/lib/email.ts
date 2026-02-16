import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

/**
 * Send welcome email with a link to download the free PDF.
 */
export async function sendWelcomeEmail(email: string, name: string) {
    try {
        console.log(`[Email] Sending welcome email to ${email}`);

        if (!process.env.RESEND_API_KEY) {
            console.error('[Email] ❌ RESEND_API_KEY is not set. Skipping email.');
            return { success: false, error: 'RESEND_API_KEY not configured' };
        }

        // Determine the base URL for the PDF download link
        const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const pdfUrl = `${baseUrl}/FOURXCLUB-free-PDF.pdf`;

        const { data, error } = await resend.emails.send({
            from: `FourXclub <${FROM_EMAIL}>`,
            to: [email],
            subject: 'Welcome to FourXclub! Here is your Free Course PDF',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 40px 30px; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6BBF6A; font-size: 28px; margin: 0;">Welcome to FourXclub!</h1>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                        Hey <strong style="color: #ffffff;">${name}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                        We're excited to have you join our trading community! As promised, here is your 
                        <strong style="color: #6BBF6A;">Free Course PDF</strong> to kickstart your journey.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${pdfUrl}" 
                           style="display: inline-block; background-color: #6BBF6A; color: #0a0a0a; 
                                  padding: 14px 32px; border-radius: 8px; text-decoration: none; 
                                  font-weight: bold; font-size: 16px;">
                            📥 Download Your Free PDF
                        </a>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #888888;">
                        Ready to take your trading to the next level? Check out our 
                        <a href="${baseUrl}" style="color: #9B7BD3; text-decoration: underline;">premium course</a> 
                        and <a href="${baseUrl}" style="color: #9B7BD3; text-decoration: underline;">Discord community</a>.
                    </p>

                    <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
                    
                    <p style="font-size: 12px; color: #666666; text-align: center;">
                        © 2026 FourXclub. All rights reserved.<br/>
                        Built on Analysis. Backed by Experience.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('[Email] ❌ Error sending email:', JSON.stringify(error, null, 2));
            return { success: false, error };
        }

        console.log('[Email] ✅ Email sent successfully:', data);
        return { success: true, data };
    } catch (err) {
        console.error('[Email] ❌ Unexpected error:', err);
        return { success: false, error: err };
    }
}
