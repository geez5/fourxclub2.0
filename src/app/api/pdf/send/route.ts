import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch PDF from public URL (works on Vercel)
        const pdfUrl = 'https://www.fourxclub.in/FreeTradingGuide.pdf';
        let pdfBuffer: Buffer;

        try {
            const response = await fetch(pdfUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch PDF');
            }
            const arrayBuffer = await response.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
        } catch (e) {
            console.error('PDF fetch error:', e);
            return NextResponse.json({ success: false, error: 'PDF file not found' }, { status: 404 });
        }

        // Send email with PDF attachment
        const { error } = await resend.emails.send({
            from: 'FourXclub <noreply@fourxclub.in>',
            to: user.email,
            subject: 'Your Free Trading Guide from FourXclub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #6BBF6A;">Welcome to FourXclub!</h1>
                    <p>Thank you for joining our trading community. Here's your free trading guide as promised.</p>
                    <p>This guide covers:</p>
                    <ul>
                        <li>Basic forex trading concepts</li>
                        <li>Risk management essentials</li>
                        <li>Getting started with your trading journey</li>
                    </ul>
                    <p>The PDF is attached to this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #888; font-size: 12px;">
                        FourXclub - Learn Trading the Right Way<br/>
                        <a href="https://www.fourxclub.in" style="color: #9B7BD3;">www.fourxclub.in</a>
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: 'FourXclub-Trading-Guide.pdf',
                    content: pdfBuffer,
                }
            ]
        });

        if (error) {
            console.error('Resend email error:', error);
            return NextResponse.json({ success: false, error: 'Failed to send email: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'PDF sent to your email!' });
    } catch (error) {
        console.error('PDF send error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
