import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Generate a unique referral code
function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FXC'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userEmail = session.user.email!

        // Get or create user in database
        let user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                courseAccesses: true,
                communityAccesses: true,
            }
        })

        // If user doesn't exist, create them
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: session.user.id,
                    email: userEmail,
                    fullName: session.user.user_metadata?.full_name || null,
                    referralCode: generateReferralCode(),
                },
                include: {
                    courseAccesses: true,
                    communityAccesses: true,
                }
            })
        }

        // Generate referral code if user doesn't have one
        if (!user.referralCode) {
            let code = generateReferralCode()
            // Ensure uniqueness
            while (await prisma.user.findUnique({ where: { referralCode: code } })) {
                code = generateReferralCode()
            }
            user = await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: code },
                include: {
                    courseAccesses: true,
                    communityAccesses: true,
                }
            })
        }

        // Check course access (now a single object, not array)
        const courseAccess = user.courseAccesses
        const hasCourseAccess = courseAccess &&
            courseAccess.status === 'active' &&
            (!courseAccess.expiresAt || new Date(courseAccess.expiresAt) > new Date())

        // Check community (Discord) access (now a single object, not array)
        const communityAccess = user.communityAccesses
        const hasCommunityAccess = communityAccess &&
            communityAccess.status === 'active' &&
            (!communityAccess.expiresAt || new Date(communityAccess.expiresAt) > new Date())

        // Count referrals
        const referralCount = await prisma.referral.count({
            where: { referrerId: user.id }
        })

        return NextResponse.json({
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
            }
        })
    } catch (error) {
        console.error('User status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
