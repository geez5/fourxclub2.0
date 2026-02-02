import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import passport from './config/passport.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import videosRoutes from './routes/videos.routes.js'
import discordRoutes from './routes/discord.routes.js'
import referralsRoutes from './routes/referrals.routes.js'
import adminRoutes from './routes/admin.routes.js'
import webhooksRoutes from './routes/webhooks.routes.js'

const app = express()

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
})

// CORS configuration
app.use(
    cors({
        origin: [config.frontendUrl, 'http://localhost:3000'],
        credentials: true,
    })
)

// Parse JSON bodies (except for webhooks which need raw body)
app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(cookieParser())

// Initialize Passport
app.use(passport.initialize())

// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'fourxclub-backend' })
})

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/videos', videosRoutes)
app.use('/api/discord', discordRoutes)
app.use('/api/referrals', referralsRoutes)
app.use('/api/referral', referralsRoutes) // Alias for /apply endpoint
app.use('/api/admin', adminRoutes)
app.use('/api/webhooks', webhooksRoutes)

// Error handler
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`)
    console.log(`📝 Environment: ${config.nodeEnv}`)
    console.log(`🌐 Frontend URL: ${config.frontendUrl}`)
})

export default app
