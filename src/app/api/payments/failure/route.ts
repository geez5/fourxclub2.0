import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fourxclub.in'

/**
 * DEPRECATED: This route was for PayU's POST failure callback.
 * Razorpay handles failures client-side or via webhooks.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const params: Record<string, string> = {}

        formData.forEach((value, key) => {
            params[key] = value.toString()
        })

        // txnid in PayU flow corresponds to our razorpayOrderId now
        const { txnid, mihpayid } = params

        if (txnid) {
            await prisma.payment.updateMany({
                where: { razorpayOrderId: txnid },
                data: {
                    status: 'failed',
                    razorpayPaymentId: mihpayid || null,
                    metadata: params,
                }
            })
        }

        return NextResponse.redirect(`${SITE_URL}/dashboard?payment=failed`)
    } catch (error) {
        console.error('Payment failure callback error:', error)
        return NextResponse.redirect(`${SITE_URL}/dashboard?payment=failed`)
    }
}
