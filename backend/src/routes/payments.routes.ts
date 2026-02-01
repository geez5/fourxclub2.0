import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../config/prisma.js'
import { razorpay, PRICES, verifyRazorpaySignature, verifySubscriptionSignature } from '../services/razorpay.js'
import { config } from '../config/env.js'

const router = Router()

// Create payment order or subscription
router.post('/create', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const userEmail = req.user!.email
        const userName = req.user!.name || userEmail.split('@')[0]

        const { type } = req.body

        if (!type || !['course', 'discord_subscription'].includes(type)) {
            res.status(400).json({ error: 'Invalid payment type' })
            return
        }

        // Get or create user in database
        let user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: userEmail,
                    fullName: userName,
                },
            })
        }

        // Handle Course Purchase
        if (type === 'course') {
            const existingAccess = await prisma.courseAccess.findFirst({
                where: { userId: user.id, status: 'active' },
            })

            if (existingAccess) {
                res.status(400).json({ error: 'You already have course access' })
                return
            }

            const amount = PRICES.course

            // Create Razorpay Order
            const order = await razorpay.orders.create({
                amount: amount,
                currency: 'INR',
                receipt: `course_${user.id}_${Date.now()}`,
                notes: {
                    userId: user.id,
                    type: 'course',
                },
            })

            // Create payment record
            await prisma.payment.create({
                data: {
                    userId: user.id,
                    type: 'course',
                    amount: amount / 100,
                    currency: 'INR',
                    status: 'pending',
                    razorpayOrderId: order.id,
                },
            })

            res.json({
                success: true,
                method: 'order',
                orderId: order.id,
                amount: amount,
                currency: 'INR',
                keyId: config.razorpay.keyId,
                prefill: { name: userName, email: userEmail },
            })
            return
        }

        // Handle Discord Subscription
        if (type === 'discord_subscription') {
            const planId = process.env.RAZORPAY_PLAN_ID

            if (!planId) {
                console.error('RAZORPAY_PLAN_ID is missing')
                res.status(500).json({ error: 'Subscription configuration missing' })
                return
            }

            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 121,
                notes: {
                    userId: user.id,
                    type: 'discord_subscription',
                },
            })

            await prisma.payment.create({
                data: {
                    userId: user.id,
                    type: 'discord_subscription',
                    amount: PRICES.discord_subscription / 100,
                    currency: 'INR',
                    status: 'pending',
                    razorpaySubscriptionId: subscription.id,
                },
            })

            res.json({
                success: true,
                method: 'subscription',
                subscriptionId: subscription.id,
                amount: PRICES.discord_subscription,
                currency: 'INR',
                keyId: config.razorpay.keyId,
                prefill: { name: userName, email: userEmail },
            })
            return
        }

        res.status(400).json({ error: 'Invalid request' })
    } catch (error) {
        console.error('Create payment error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Verify payment
router.post('/verify', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_signature,
            razorpay_order_id,
            razorpay_subscription_id,
        } = req.body

        if (!razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ error: 'Missing payment details' })
            return
        }

        let isValid = false
        let paymentRecord = null

        if (razorpay_order_id) {
            isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
            paymentRecord = await prisma.payment.findFirst({
                where: { razorpayOrderId: razorpay_order_id },
            })
        } else if (razorpay_subscription_id) {
            isValid = verifySubscriptionSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature)
            paymentRecord = await prisma.payment.findFirst({
                where: { razorpaySubscriptionId: razorpay_subscription_id },
            })
        }

        if (!isValid || !paymentRecord) {
            res.status(400).json({ error: 'Invalid payment verification' })
            return
        }

        // Update payment record
        await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
                status: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            },
        })

        // Grant access
        if (paymentRecord.type === 'course') {
            await prisma.courseAccess.upsert({
                where: { userId: paymentRecord.userId },
                update: { status: 'active', purchasedAt: new Date() },
                create: { userId: paymentRecord.userId, status: 'active' },
            })
        } else if (paymentRecord.type === 'discord_subscription') {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            await prisma.communityAccess.upsert({
                where: { userId: paymentRecord.userId },
                update: {
                    status: 'active',
                    subscribedAt: new Date(),
                    expiresAt: expiresAt,
                    autoRenew: true,
                },
                create: {
                    userId: paymentRecord.userId,
                    status: 'active',
                    expiresAt: expiresAt,
                    autoRenew: true,
                },
            })
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
