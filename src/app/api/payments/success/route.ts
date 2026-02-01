import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fourxclub.in'

/**
 * DEPRECATED: This route was for PayU's POST success callback.
 * Razorpay verification is handled in /api/payments/verify.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const params: Record<string, string> = {}

        formData.forEach((value, key) => {
            params[key] = value.toString()
        })

        const { txnid, status, mihpayid } = params

        // Basic verification for legacy support - we should really avoid using this for Razorpay
        if (status !== 'success') {
            if (txnid) {
                await prisma.payment.updateMany({
                    where: { razorpayOrderId: txnid },
                    data: {
                        status: 'failed',
                        razorpayPaymentId: mihpayid || null,
                    }
                })
            }
            return NextResponse.redirect(`${SITE_URL}/dashboard?payment=failed`)
        }

        // Get payment record
        const payment = await prisma.payment.findFirst({
            where: { razorpayOrderId: txnid }
        })

        if (!payment) {
            return NextResponse.redirect(`${SITE_URL}/dashboard?payment=failed&reason=payment_not_found`)
        }

        if (payment.status !== 'completed') {
            // Update payment status
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'completed',
                    razorpayPaymentId: mihpayid,
                    metadata: params,
                }
            })

            // Grant access based on payment type
            if (payment.type === 'course') {
                await prisma.courseAccess.upsert({
                    where: { userId: payment.userId },
                    update: { status: 'active', purchasedAt: new Date() },
                    create: { userId: payment.userId, status: 'active' }
                })
            } else if (payment.type === 'discord_subscription') {
                const now = new Date()
                const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

                await prisma.communityAccess.upsert({
                    where: { userId: payment.userId },
                    update: {
                        status: 'active',
                        subscribedAt: now,
                        expiresAt: expiresAt,
                        autoRenew: true,
                    },
                    create: {
                        userId: payment.userId,
                        status: 'active',
                        expiresAt: expiresAt,
                        autoRenew: true,
                    }
                })
            }
        }

        return NextResponse.redirect(`${SITE_URL}/dashboard?payment=success&type=${payment.type}`)
    } catch (error) {
        console.error('Payment success callback error:', error)
        return NextResponse.redirect(`${SITE_URL}/dashboard?payment=failed&reason=server_error`)
    }
}
