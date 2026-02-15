import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { config } from './env.js'
import { prisma } from './prisma.js'
import { sendWelcomeEmail } from '../services/email.service.js'

// Generate a unique referral code
function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FXC'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl,
        },
        async (accessToken, refreshToken, profile: Profile, done) => {
            try {
                const email = profile.emails?.[0]?.value

                if (!email) {
                    return done(new Error('No email found in Google profile'), undefined)
                }

                // Find or create user
                let user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user) {
                    // Generate unique referral code
                    let referralCode = generateReferralCode()
                    while (await prisma.user.findUnique({ where: { referralCode } })) {
                        referralCode = generateReferralCode()
                    }

                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            fullName: profile.displayName,
                            image: profile.photos?.[0]?.value,
                            referralCode,
                            accounts: {
                                create: {
                                    type: 'oauth',
                                    provider: 'google',
                                    providerAccountId: profile.id,
                                    access_token: accessToken,
                                    refresh_token: refreshToken,
                                },
                            },
                        },
                    })

                    // Send welcome email with PDF
                    // Don't await to avoid blocking the auth flow
                    sendWelcomeEmail(email, user.name || 'Trader').catch(err => {
                        console.error('Failed to send welcome email:', err)
                    })
                } else {
                    // Update existing user's account if needed
                    const existingAccount = await prisma.account.findFirst({
                        where: {
                            userId: user.id,
                            provider: 'google',
                        },
                    })

                    if (!existingAccount) {
                        await prisma.account.create({
                            data: {
                                userId: user.id,
                                type: 'oauth',
                                provider: 'google',
                                providerAccountId: profile.id,
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            },
                        })
                    }
                }

                // Return simplified user for Express session
                return done(null, {
                    id: user.id,
                    email: user.email!,
                    name: user.fullName || user.name || null,
                })
            } catch (error) {
                return done(error as Error, undefined)
            }
        }
    )
)

export default passport
