import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { applyRateLimit } from "@/lib/rate-limit"

export async function GET(req: Request) {
    try {
        // Rate limit: general (100 req / 15 min)
        const limited = await applyRateLimit(req, "general")
        if (limited) return limited

        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        // Fetch user with all necessary relations
        let user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                courseAccesses: true,
                communityAccesses: true,
                _count: {
                    select: { referrerReferrals: true }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
        }

        // Generate referral code if missing
        if (!user.referralCode) {
            const newCode = nanoid(8).toUpperCase()
            user = await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: newCode },
                include: {
                    courseAccesses: true,
                    communityAccesses: true,
                    _count: {
                        select: { referrerReferrals: true }
                    }
                }
            })
        }

        // Construct the response object
        const userStatus = {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                referralCode: user.referralCode,
                discordId: user.discordId,
            },
            courseAccess: {
                hasAccess: user.courseAccesses?.status === 'active',
                purchasedAt: user.courseAccesses?.purchasedAt || null,
                expiresAt: user.courseAccesses?.expiresAt || null,
                status: user.courseAccesses?.status || 'inactive'
            },
            communityAccess: {
                hasAccess: user.communityAccesses?.status === 'active',
                subscribedAt: user.communityAccesses?.subscribedAt || null,
                expiresAt: user.communityAccesses?.expiresAt || null,
                autoRenew: user.communityAccesses?.autoRenew || false,
                status: user.communityAccesses?.status || 'inactive'
            },
            referrals: {
                code: user.referralCode,
                count: user._count.referrerReferrals
            }
        }

        return NextResponse.json(userStatus)

    } catch (error) {
        console.error("Error fetching user status:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
