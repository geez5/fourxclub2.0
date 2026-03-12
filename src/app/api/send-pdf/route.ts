import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST() {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const email = session.user.email
        const name = session.user.name || 'Trader'

        console.log(`[Send-PDF API] Sending PDF email to ${email}`)

        const result = await sendWelcomeEmail(email, name)

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Email sent successfully' })
        } else {
            console.error('[Send-PDF API] Email send failed:', result.error)
            return NextResponse.json(
                { success: false, error: 'Failed to send email' },
                { status: 500 }
            )
        }
    } catch (err) {
        console.error('[Send-PDF API] Unexpected error:', err)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
