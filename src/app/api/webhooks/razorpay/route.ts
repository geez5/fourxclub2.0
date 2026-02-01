import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'

interface RazorpayPaymentEntity {
    id: string
    order_id: string | null
    subscription_id: string | null
    amount: number
    currency: string
    status: string
}

interface RazorpaySubscriptionEntity {
    id: string
    status: string
}

export async function POST(request: Request) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('x-razorpay-signature')
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET

        if (!signature || !secret) {
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
        }

        const isValid = verifyWebhookSignature(rawBody, signature, secret)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(rawBody)
        const payload = event.payload

        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity)
                break
            case 'subscription.charged':
                await handleSubscriptionCharged(payload.subscription.entity, payload.payment.entity)
                break
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(payload.subscription.entity)
                break
            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity)
                break
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Razorpay Webhook Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function handlePaymentCaptured(payment: RazorpayPaymentEntity) {
    const orderId = payment.order_id
    if (!orderId) return

    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
    })

    if (!paymentRecord || paymentRecord.status === 'completed') return

    await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
            status: 'completed',
            razorpayPaymentId: payment.id
        }
    })

    // Grant access if not already granted via frontend verify
    if (paymentRecord.type === 'course') {
        await prisma.courseAccess.upsert({
            where: { userId: paymentRecord.userId },
            update: { status: 'active', purchasedAt: new Date() },
            create: { userId: paymentRecord.userId, status: 'active' }
        })
    }
}

async function handleSubscriptionCharged(subscription: RazorpaySubscriptionEntity, payment: RazorpayPaymentEntity) {
    const subscriptionId = subscription.id

    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpaySubscriptionId: subscriptionId }
    })

    if (!paymentRecord) return

    // Create a record for the recurring payment
    if (paymentRecord.status === 'completed') {
        await prisma.payment.create({
            data: {
                userId: paymentRecord.userId,
                type: 'discord_subscription',
                amount: payment.amount / 100,
                currency: payment.currency,
                status: 'completed',
                razorpayPaymentId: payment.id,
                razorpaySubscriptionId: subscriptionId,
                metadata: { recurring: true }
            }
        })
    } else {
        // Update the initial pending record
        await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
                status: 'completed',
                razorpayPaymentId: payment.id
            }
        })
    }

    // Extend access by 30 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.communityAccess.update({
        where: { userId: paymentRecord.userId },
        data: {
            status: 'active',
            expiresAt: expiresAt,
            autoRenew: true
        }
    })
}

async function handleSubscriptionCancelled(subscription: RazorpaySubscriptionEntity) {
    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpaySubscriptionId: subscription.id }
    })

    if (!paymentRecord) return

    await prisma.communityAccess.update({
        where: { userId: paymentRecord.userId },
        data: {
            autoRenew: false,
            // We don't necessarily kill access immediately, 
            // they keep it until expiresAt
        }
    })
}

async function handlePaymentFailed(payment: RazorpayPaymentEntity) {
    const orderId = payment.order_id
    const subscriptionId = payment.subscription_id

    const query = orderId
        ? { razorpayOrderId: orderId }
        : { razorpaySubscriptionId: subscriptionId }

    if (!query.razorpayOrderId && !query.razorpaySubscriptionId) return

    const paymentRecord = await prisma.payment.findFirst({
        where: query
    })

    if (!paymentRecord) return

    await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: 'failed' }
    })
}
