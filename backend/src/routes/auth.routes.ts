import { Router, Request, Response } from 'express'
import passport from '../config/passport.js'
import { generateToken, AuthenticatedRequest, authMiddleware } from '../middleware/auth.js'
import { config } from '../config/env.js'
import { User } from '@prisma/client'

const router = Router()

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${config.frontendUrl}/auth/signin?error=oauth_failed`
    }),
    (req: Request, res: Response) => {
        const user = req.user as User

        if (!user || !user.email) {
            res.redirect(`${config.frontendUrl}/auth/signin?error=no_user`)
            return
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email)

        // Set token as httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        // Redirect to frontend dashboard
        res.redirect(`${config.frontendUrl}/dashboard`)
    }
)

// Get current user
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.json({
        success: true,
        user: req.user,
    })
})

// Logout
router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    })
    res.json({ success: true, message: 'Logged out' })
})

export default router
