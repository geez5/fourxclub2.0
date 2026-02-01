import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { prisma } from '../config/prisma.js'
import { addUserToDiscord } from '../services/discord.js'

const router = Router()

// Link Discord account
router.post('/link', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { discordId } = req.body

        if (!discordId) {
            res.status(400).json({ error: 'Discord ID is required' })
            return
        }

        // Update user's Discord ID
        await prisma.user.update({
            where: { id: userId },
            data: { discordId },
        })

        // Check if user has active subscription
        const communityAccess = await prisma.communityAccess.findFirst({
            where: {
                userId,
                status: 'active',
            },
        })

        // If subscribed, add role immediately
        if (communityAccess) {
            const result = await addUserToDiscord(discordId, userId)

            if (!result.success) {
                res.status(400).json({
                    error: "Failed to add role. Make sure you've joined the Discord server.",
                })
                return
            }
        }

        res.json({
            success: true,
            message: communityAccess
                ? 'Discord linked and premium role added!'
                : 'Discord linked successfully!',
        })
    } catch (error) {
        console.error('Discord link error:', error)
        res.status(500).json({ error: 'Failed to link Discord account' })
    }
})

// Unlink Discord account
router.delete('/link', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id

        await prisma.user.update({
            where: { id: userId },
            data: { discordId: null },
        })

        res.json({
            success: true,
            message: 'Discord unlinked successfully',
        })
    } catch (error) {
        console.error('Discord unlink error:', error)
        res.status(500).json({ error: 'Failed to unlink Discord account' })
    }
})

export default router
