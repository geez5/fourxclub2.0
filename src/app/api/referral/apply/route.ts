import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { code } = await request.json()

        if (!code) {
            return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
        }

        const userEmail = session.user.email!

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { email: userEmail }
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user already used a referral code
        if (currentUser.referredByCode) {
            return NextResponse.json({
                error: 'You have already used a referral code'
            }, { status: 400 })
        }

        // Check if trying to use own code
        if (currentUser.referralCode === code) {
            return NextResponse.json({
                error: 'You cannot use your own referral code'
            }, { status: 400 })
        }

        // Find the referrer by their code
        const referrer = await prisma.user.findUnique({
            where: { referralCode: code }
        })

        if (!referrer) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
        }

        // Check if already referred by this user
        const existingReferral = await prisma.referral.findFirst({
            where: {
                referrerId: referrer.id,
                referredId: currentUser.id,
            }
        })

        if (existingReferral) {
            return NextResponse.json({
                error: 'You have already been referred by this user'
            }, { status: 400 })
        }

        // Create referral record
        await prisma.referral.create({
            data: {
                referrerId: referrer.id,
                referredId: currentUser.id,
                code: code,
                bonusDays: 15,
                applied: false,
            }
        })

        // Update current user's referredByCode
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { referredByCode: code }
        })

        // Grant 15 days Discord access to referred user (current user)
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)

        await prisma.communityAccess.upsert({
            where: { userId: currentUser.id },
            update: {
                expiresAt: expiresAt,
                status: 'active',
            },
            create: {
                userId: currentUser.id,
                expiresAt: expiresAt,
                status: 'active',
            }
        })

        // Grant 15 days Discord access to referrer (add to existing or create new)
        const referrerAccess = await prisma.communityAccess.findUnique({
            where: { userId: referrer.id }
        })

        if (referrerAccess) {
            // Add 15 days to existing expiry or from now if expired
            const currentExpiry = referrerAccess.expiresAt ? new Date(referrerAccess.expiresAt) : now
            const baseDate = currentExpiry > now ? currentExpiry : now
            const newExpiry = new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000)

            await prisma.communityAccess.update({
                where: { userId: referrer.id },
                data: {
                    expiresAt: newExpiry,
                    status: 'active',
                }
            })
        } else {
            await prisma.communityAccess.create({
                data: {
                    userId: referrer.id,
                    expiresAt: expiresAt,
                    status: 'active',
                }
            })
        }

        // Mark referral as applied
        await prisma.referral.updateMany({
            where: {
                referrerId: referrer.id,
                referredId: currentUser.id,
            },
            data: { applied: true }
        })

        return NextResponse.json({
            success: true,
            message: 'Referral code applied! You and the referrer both get 15 days of free Discord access.',
            bonusDays: 15,
            expiresAt: expiresAt.toISOString(),
        })
    } catch (error) {
        console.error('Apply referral error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
