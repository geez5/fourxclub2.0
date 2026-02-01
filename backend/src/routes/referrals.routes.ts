import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../config/prisma.js'

const router = Router()

// Apply referral code
router.post('/apply', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { code } = req.body

        if (!code) {
            res.status(400).json({ error: 'Referral code is required' })
            return
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!currentUser) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        // Check if user already used a referral code
        if (currentUser.referredByCode) {
            res.status(400).json({ error: 'You have already used a referral code' })
            return
        }

        // Check if trying to use own code
        if (currentUser.referralCode === code) {
            res.status(400).json({ error: 'You cannot use your own referral code' })
            return
        }

        // Find the referrer
        const referrer = await prisma.user.findUnique({
            where: { referralCode: code },
        })

        if (!referrer) {
            res.status(404).json({ error: 'Invalid referral code' })
            return
        }

        // Check if already referred by this user
        const existingReferral = await prisma.referral.findFirst({
            where: {
                referrerId: referrer.id,
                referredId: currentUser.id,
            },
        })

        if (existingReferral) {
            res.status(400).json({ error: 'You have already been referred by this user' })
            return
        }

        // Create referral record
        await prisma.referral.create({
            data: {
                referrerId: referrer.id,
                referredId: currentUser.id,
                code: code,
                bonusDays: 15,
                applied: false,
            },
        })

        // Update current user's referredByCode
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { referredByCode: code },
        })

        // Grant 15 days Discord access to referred user
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
            },
        })

        // Grant 15 days Discord access to referrer
        const referrerAccess = await prisma.communityAccess.findUnique({
            where: { userId: referrer.id },
        })

        if (referrerAccess) {
            const currentExpiry = referrerAccess.expiresAt ? new Date(referrerAccess.expiresAt) : now
            const baseDate = currentExpiry > now ? currentExpiry : now
            const newExpiry = new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000)

            await prisma.communityAccess.update({
                where: { userId: referrer.id },
                data: {
                    expiresAt: newExpiry,
                    status: 'active',
                },
            })
        } else {
            await prisma.communityAccess.create({
                data: {
                    userId: referrer.id,
                    expiresAt: expiresAt,
                    status: 'active',
                },
            })
        }

        // Mark referral as applied
        await prisma.referral.updateMany({
            where: {
                referrerId: referrer.id,
                referredId: currentUser.id,
            },
            data: { applied: true },
        })

        res.json({
            success: true,
            message: 'Referral code applied! You and the referrer both get 15 days of free Discord access.',
            bonusDays: 15,
            expiresAt: expiresAt.toISOString(),
        })
    } catch (error) {
        console.error('Apply referral error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get user's referrals
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const referrals = await prisma.referral.findMany({
            where: { referrerId: userId },
            include: {
                referred: {
                    select: { email: true, createdAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true },
        })

        res.json({
            success: true,
            referralCode: user?.referralCode,
            referrals: referrals.map((r) => ({
                id: r.id,
                referredEmail: r.referred.email,
                bonusDays: r.bonusDays,
                applied: r.applied,
                createdAt: r.createdAt,
            })),
            totalReferrals: referrals.length,
        })
    } catch (error) {
        console.error('Get referrals error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
