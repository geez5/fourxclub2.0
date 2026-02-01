import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { verifyRazorpaySignature, verifySubscriptionSignature } from '@/lib/razorpay'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            razorpay_payment_id,
            razorpay_signature,
            razorpay_order_id,      // Present for orders
            razorpay_subscription_id // Present for subscriptions
        } = body

        if (!razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
        }

        let isValid = false
        let paymentRecord = null

        if (razorpay_order_id) {
            // Verify Order Signature
            isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
            paymentRecord = await prisma.payment.findFirst({
                where: { razorpayOrderId: razorpay_order_id }
            })
        } else if (razorpay_subscription_id) {
            // Verify Subscription Signature
            isValid = verifySubscriptionSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature)
            paymentRecord = await prisma.payment.findFirst({
                where: { razorpaySubscriptionId: razorpay_subscription_id }
            })
        }

        if (!isValid || !paymentRecord) {
            return NextResponse.json({ error: 'Invalid payment verification' }, { status: 400 })
        }

        // Update payment record
        await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
                status: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            }
        })

        // Grant access
        if (paymentRecord.type === 'course') {
            await prisma.courseAccess.upsert({
                where: { userId: paymentRecord.userId },
                update: { status: 'active', purchasedAt: new Date() },
                create: { userId: paymentRecord.userId, status: 'active' }
            })
        } else if (paymentRecord.type === 'discord_subscription') {
            // For first payment, give 30 days
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            await prisma.communityAccess.upsert({
                where: { userId: paymentRecord.userId },
                update: {
                    status: 'active',
                    subscribedAt: new Date(),
                    expiresAt: expiresAt,
                    autoRenew: true
                },
                create: {
                    userId: paymentRecord.userId,
                    status: 'active',
                    expiresAt: expiresAt,
                    autoRenew: true
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
