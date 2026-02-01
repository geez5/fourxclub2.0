import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'
import { prisma } from '../config/prisma.js'

const router = Router()

// Admin dashboard stats
router.get('/dashboard', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { range = '30d' } = req.query

        // Calculate date range
        const now = new Date()
        let startDate = new Date()

        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case '90d':
                startDate.setDate(now.getDate() - 90)
                break
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1)
                break
            case 'all':
                startDate = new Date(0)
                break
        }

        // Get stats
        const [totalUsers, coursePurchases, activeSubscriptions, totalReferrals, recentPayments] =
            await Promise.all([
                prisma.user.count(),
                prisma.courseAccess.count({ where: { status: 'active' } }),
                prisma.communityAccess.count({ where: { status: 'active' } }),
                prisma.referral.count(),
                prisma.payment.findMany({
                    where: { status: 'completed', createdAt: { gte: startDate } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: { select: { email: true, fullName: true } },
                    },
                }),
            ])

        // Calculate revenue
        const inrPayments = await prisma.payment.aggregate({
            where: { status: 'completed', currency: 'INR', createdAt: { gte: startDate } },
            _sum: { amount: true },
        })

        res.json({
            totalRevenue: { inr: inrPayments._sum.amount || 0 },
            totalUsers,
            coursePurchases,
            activeSubscriptions,
            totalReferrals,
            recentPurchases: recentPayments,
        })
    } catch (error) {
        console.error('Admin dashboard error:', error)
        res.status(500).json({ error: 'Failed to fetch dashboard data' })
    }
})

// List all users
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    courseAccesses: true,
                    communityAccesses: true,
                },
            }),
            prisma.user.count(),
        ])

        res.json({
            users: users.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.fullName || u.name,
                discordId: u.discordId,
                createdAt: u.createdAt,
                courseAccess: u.courseAccesses?.status || 'none',
                communityAccess: u.communityAccesses?.status || 'none',
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('List users error:', error)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

export default router
