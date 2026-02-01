import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'

// Prices in INR (in paise for Razorpay)
const PRICES = {
    course: 149900, // ₹1,499
    discord_subscription: 200000, // ₹2,000 (Monthly)
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 })
        }

        const { type } = await request.json()

        if (!type || !['course', 'discord_subscription'].includes(type)) {
            return NextResponse.json({
                error: 'Invalid payment type.'
            }, { status: 400 })
        }

        const userId = session.user.id
        const userEmail = session.user.email!
        const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer'

        // Check for required environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('CRITICAL: Razorpay keys are missing in environment variables.')
            return NextResponse.json({ error: 'Payment gateway configuration missing. Please contact support.' }, { status: 500 })
        }

        // Get or create user in database
        let user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: userEmail,
                        fullName: userName,
                    }
                })
            } catch (dbError) {
                console.error('Database user creation error:', dbError)
                // Fallback: check if user exists by email if ID lookup failed (sometimes IDs can conflict if not handled correctly)
                user = await prisma.user.findUnique({ where: { email: userEmail } })
                if (!user) throw dbError;
            }
        }

        // 1. Handle One-Time Course Purchase
        if (type === 'course') {
            const existingAccess = await prisma.courseAccess.findFirst({
                where: { userId: user.id, status: 'active' }
            })
            if (existingAccess) {
                return NextResponse.json({ error: 'You already have course access' }, { status: 400 })
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
                }
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
                }
            })

            return NextResponse.json({
                success: true,
                method: 'order',
                orderId: order.id,
                amount: amount,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID,
                prefill: { name: userName, email: userEmail },
            })
        }

        // 2. Handle Recurring Discord Subscription (Autopay)
        if (type === 'discord_subscription') {
            const planId = process.env.RAZORPAY_PLAN_ID
            if (!planId) {
                console.error('RAZORPAY_PLAN_ID is missing for discord_subscription')
                return NextResponse.json({ error: 'Subscription configuration missing. Please contact support.' }, { status: 500 })
            }

            // Create Razorpay Subscription
            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: 121, // Long duration
                notes: {
                    userId: user.id,
                    type: 'discord_subscription',
                }
            })

            // Create payment record
            await prisma.payment.create({
                data: {
                    userId: user.id,
                    type: 'discord_subscription',
                    amount: PRICES.discord_subscription / 100,
                    currency: 'INR',
                    status: 'pending',
                    razorpaySubscriptionId: subscription.id,
                }
            })

            return NextResponse.json({
                success: true,
                method: 'subscription',
                subscriptionId: subscription.id,
                amount: PRICES.discord_subscription,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID,
                prefill: { name: userName, email: userEmail },
            })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    } catch (error) {
        console.error('Create payment error:', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({
            error: message,
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 })
    }
}
