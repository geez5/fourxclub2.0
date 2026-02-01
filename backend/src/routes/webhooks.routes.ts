import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { verifyWebhookSignature } from '../services/razorpay.js'

const router = Router()

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

// Razorpay webhook
router.post('/razorpay', async (req: Request, res: Response) => {
    try {
        const rawBody = JSON.stringify(req.body)
        const signature = req.headers['x-razorpay-signature'] as string

        if (!signature) {
            res.status(400).json({ error: 'Missing signature' })
            return
        }

        const isValid = verifyWebhookSignature(rawBody, signature)

        if (!isValid) {
            res.status(400).json({ error: 'Invalid signature' })
            return
        }

        const event = req.body
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

        res.json({ received: true })
    } catch (error) {
        console.error('Razorpay Webhook Error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

async function handlePaymentCaptured(payment: RazorpayPaymentEntity) {
    const orderId = payment.order_id
    if (!orderId) return

    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
    })

    if (!paymentRecord || paymentRecord.status === 'completed') return

    await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
            status: 'completed',
            razorpayPaymentId: payment.id,
        },
    })

    if (paymentRecord.type === 'course') {
        await prisma.courseAccess.upsert({
            where: { userId: paymentRecord.userId },
            update: { status: 'active', purchasedAt: new Date() },
            create: { userId: paymentRecord.userId, status: 'active' },
        })
    }
}

async function handleSubscriptionCharged(
    subscription: RazorpaySubscriptionEntity,
    payment: RazorpayPaymentEntity
) {
    const subscriptionId = subscription.id

    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpaySubscriptionId: subscriptionId },
    })

    if (!paymentRecord) return

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
                metadata: { recurring: true },
            },
        })
    } else {
        await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
                status: 'completed',
                razorpayPaymentId: payment.id,
            },
        })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.communityAccess.update({
        where: { userId: paymentRecord.userId },
        data: {
            status: 'active',
            expiresAt: expiresAt,
            autoRenew: true,
        },
    })
}

async function handleSubscriptionCancelled(subscription: RazorpaySubscriptionEntity) {
    const paymentRecord = await prisma.payment.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
    })

    if (!paymentRecord) return

    await prisma.communityAccess.update({
        where: { userId: paymentRecord.userId },
        data: { autoRenew: false },
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
        where: query,
    })

    if (!paymentRecord) return

    await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: 'failed' },
    })
}

export default router
