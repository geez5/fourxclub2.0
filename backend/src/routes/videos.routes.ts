import { Router, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { prisma } from '../config/prisma.js'
import { courseVideos, generateBunnyEmbedUrl } from '../services/bunny.js'

const router = Router()

// Get video by ID
router.get('/:videoNumber', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { videoNumber } = req.params

        // Validate video number
        const videoNum = parseInt(videoNumber)
        if (isNaN(videoNum) || videoNum < 1 || videoNum > 10) {
            res.status(400).json({ error: 'Invalid video number. Must be between 1 and 10.' })
            return
        }

        // Check if user has paid access
        const courseAccess = await prisma.courseAccess.findFirst({
            where: {
                userId,
                status: 'active',
            },
        })

        if (!courseAccess) {
            res.status(403).json({
                error: 'Access denied. Please purchase the course to watch videos.',
                requiresPurchase: true,
            })
            return
        }

        // Get video info
        const video = courseVideos.find((v) => v.id === videoNum)
        if (!video) {
            res.status(404).json({ error: 'Video not found' })
            return
        }

        // Check if Bunny ID is configured
        if (video.bunnyId.startsWith('REPLACE_WITH_')) {
            res.status(503).json({
                error: 'Video not yet available. Please check back later.',
                videoInfo: {
                    id: video.id,
                    title: video.title,
                    description: video.description,
                    duration: video.duration,
                },
            })
            return
        }

        // Generate secure embed URL
        const embedUrl = generateBunnyEmbedUrl(video.bunnyId)

        // Log video access
        await prisma.userActivity.create({
            data: {
                userId,
                action: 'video_watched',
                metadata: {
                    videoId: video.id,
                    videoTitle: video.title,
                    provider: 'bunny',
                    timestamp: new Date().toISOString(),
                },
            },
        }).catch((err) => {
            console.error('Failed to log video activity:', err)
        })

        res.json({
            success: true,
            video: {
                id: video.id,
                title: video.title,
                description: video.description,
                duration: video.duration,
                embedUrl,
                thumbnail: video.thumbnail,
            },
        })
    } catch (error) {
        console.error('Video route error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}))

export default router
