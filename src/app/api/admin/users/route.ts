import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const whereClause = search
      ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
        ]
      }
      : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        courseAccesses: true,
        communityAccesses: true,
        referrerReferrals: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName || u.email,
      discordId: u.discordId,
      createdAt: u.createdAt,
      coursePurchased: u.courseAccesses?.status === 'active',
      communityAccess: u.communityAccesses?.status === 'active',
      referralCount: u.referrerReferrals?.length ?? 0,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}