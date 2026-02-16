
import dotenv from 'dotenv'
import path from 'path'

// Resolve .env path relative to this file
// src/config/env.ts -> ../../.env
const envPath = path.resolve(__dirname, '../../.env')

dotenv.config({ path: envPath })


export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000' || 'https://fourxclub.in',

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: '7d',

    // Google OAuth
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
    },

    // Razorpay
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
    },

    // Discord
    discord: {
        botToken: process.env.DISCORD_BOT_TOKEN!,
        guildId: process.env.DISCORD_GUILD_ID!,
        premiumRoleId: process.env.DISCORD_PREMIUM_ROLE_ID!,
    },

    // Bunny CDN
    bunny: {
        libraryId: process.env.BUNNY_LIBRARY_ID || '589918',
        apiKey: process.env.BUNNY_API_KEY!,
        cdnUrl: process.env.BUNNY_CDN_URL || 'vz-36a9a6d8-d84.b-cdn.net',
        pullZone: process.env.BUNNY_PULL_ZONE || 'vz-36a9a6d8-d84',
    },

    // Admin
    adminEmail: process.env.ADMIN_EMAIL || 'hello.fourxclub@gmail.com',

    // Email (Resend)
    email: {
        resendApiKey: process.env.RESEND_API_KEY!,
        fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    },
}

// Validate required env vars
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
]

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`)
        process.exit(1)
    }
}
