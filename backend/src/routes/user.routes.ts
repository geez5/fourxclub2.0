import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../config/prisma.js'

const router = Router()

// Generate a unique referral code
function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FXC'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// Get user status with access info
router.get('/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id

        // Get user with all access info
        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                courseAccesses: true,
                communityAccesses: true,
            },
        })

        if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        // Generate referral code if user doesn't have one
        if (!user.referralCode) {
            let code = generateReferralCode()
            while (await prisma.user.findUnique({ where: { referralCode: code } })) {
                code = generateReferralCode()
            }
            user = await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: code },
                include: {
                    courseAccesses: true,
                    communityAccesses: true,
                },
            })
        }

        // Check course access
        const courseAccess = user.courseAccesses
        const hasCourseAccess =
            courseAccess &&
            courseAccess.status === 'active' &&
            (!courseAccess.expiresAt || new Date(courseAccess.expiresAt) > new Date())

        // Check community access
        const communityAccess = user.communityAccesses
        const hasCommunityAccess =
            communityAccess &&
            communityAccess.status === 'active' &&
            (!communityAccess.expiresAt || new Date(communityAccess.expiresAt) > new Date())

        // Count referrals
        const referralCount = await prisma.referral.count({
            where: { referrerId: user.id },
        })

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName || user.name,
                referralCode: user.referralCode,
                discordId: user.discordId,
            },
            courseAccess: {
                hasAccess: hasCourseAccess,
                purchasedAt: courseAccess?.purchasedAt || null,
                expiresAt: courseAccess?.expiresAt || null,
                status: courseAccess?.status || 'not_purchased',
            },
            communityAccess: {
                hasAccess: hasCommunityAccess,
                subscribedAt: communityAccess?.subscribedAt || null,
                expiresAt: communityAccess?.expiresAt || null,
                autoRenew: communityAccess?.autoRenew || false,
                status: communityAccess?.status || 'not_subscribed',
            },
            referrals: {
                code: user.referralCode,
                count: referralCount,
            },
        })
    } catch (error) {
        console.error('User status error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get user dashboard stats
router.get('/dashboard', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                courseAccesses: true,
                communityAccesses: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        })

        if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        const referralCount = await prisma.referral.count({
            where: { referrerId: userId },
        })

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName || user.name,
            },
            courseAccess: user.courseAccesses,
            communityAccess: user.communityAccesses,
            recentPayments: user.payments,
            referralCount,
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Log user activity
router.post('/activity', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { action, metadata } = req.body

        if (!action) {
            res.status(400).json({ error: 'Action is required' })
            return
        }

        await prisma.userActivity.create({
            data: {
                userId,
                action,
                metadata: metadata || {},
            },
        })

        res.json({ success: true })
    } catch (error) {
        console.error('Activity log error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
